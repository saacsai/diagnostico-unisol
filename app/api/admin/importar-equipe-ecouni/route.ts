import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { exigirAdmin } from '@/lib/auth'
import { enviarEmail } from '@/lib/email'
import { buscarPlanilha, type PessoaPlanilha } from '@/lib/importEcouni'

const NOME_PROJETO = 'CooperaMais'

// A planilha tem o email antigo/pessoal do Luciano — a conta real dele no
// sistema usa outro email. Sem essa correção, criaríamos uma conta duplicada
// em vez de linkar na existente.
const CORRECOES_EMAIL: Record<string, string> = {
  'luciano.maeda@gmail.com': 'luciano.maeda@saacs.com.br',
}

function gerarSenhaTemp() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let s = ''
  for (let i = 0; i < 12; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s + '!1'
}

type ResultadoPessoa = {
  nome: string
  email: string
  nivelAcesso: string
  regional: string | null
  acao: 'criar' | 'linkar'
  status: 'ok' | 'erro' | 'preview'
  erro?: string
}

export async function POST(req: NextRequest) {
  const admin = await exigirAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Acesso restrito a administradores.' }, { status: 403 })

  const confirmar = req.nextUrl.searchParams.get('confirmar') === '1'
  const sb = getSupabaseAdmin()

  const { data: projeto, error: erroProjeto } = await sb
    .from('projetos')
    .select('id')
    .eq('nome', NOME_PROJETO)
    .single()
  if (erroProjeto || !projeto) {
    return NextResponse.json({ error: `Projeto "${NOME_PROJETO}" não encontrado.` }, { status: 404 })
  }

  let pessoas: PessoaPlanilha[]
  try {
    pessoas = await buscarPlanilha()
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro ao ler a planilha.' }, { status: 502 })
  }

  pessoas = pessoas.map(p => ({ ...p, email: CORRECOES_EMAIL[p.email] ?? p.email }))

  const { data: usuariosExistentes } = await sb.from('usuarios').select('id, email, tecnico_id')
  const { data: tecnicosExistentes } = await sb.from('tecnicos').select('id, email')
  const { data: equipeExistente } = await sb.from('equipe_projeto').select('tecnico_id').eq('projeto_id', projeto.id)
  const equipeTecnicoIds = new Set((equipeExistente ?? []).map(e => e.tecnico_id))

  const mapaUsuarios = new Map((usuariosExistentes ?? []).map(u => [u.email.toLowerCase(), u]))
  const mapaTecnicos = new Map((tecnicosExistentes ?? []).filter(t => t.email).map(t => [t.email!.toLowerCase(), t]))

  const resultados: ResultadoPessoa[] = []

  for (const pessoa of pessoas) {
    const usuarioExistente = mapaUsuarios.get(pessoa.email)
    const acao: 'criar' | 'linkar' = usuarioExistente ? 'linkar' : 'criar'

    if (!confirmar) {
      resultados.push({
        nome: pessoa.nome, email: pessoa.email, nivelAcesso: pessoa.nivelAcesso,
        regional: pessoa.regional, acao, status: 'preview',
      })
      continue
    }

    try {
      let usuarioId: string
      let tecnicoId: string

      if (usuarioExistente) {
        usuarioId = usuarioExistente.id
        if (usuarioExistente.tecnico_id) {
          tecnicoId = usuarioExistente.tecnico_id
        } else {
          const tecnicoExistente = mapaTecnicos.get(pessoa.email)
          if (tecnicoExistente) {
            tecnicoId = tecnicoExistente.id
          } else {
            const { data: novoTecnico, error: erroTecnico } = await sb
              .from('tecnicos')
              .insert({ nome: pessoa.nome, email: pessoa.email, telefone: pessoa.telefone })
              .select('id')
              .single()
            if (erroTecnico || !novoTecnico) throw new Error(erroTecnico?.message ?? 'Erro ao criar técnico.')
            tecnicoId = novoTecnico.id
          }
          await sb.from('usuarios').update({ tecnico_id: tecnicoId }).eq('id', usuarioId)
        }
      } else {
        const senha = gerarSenhaTemp()
        const { data: novoUser, error: erroAuth } = await sb.auth.admin.createUser({
          email: pessoa.email, password: senha, email_confirm: true,
        })
        if (erroAuth || !novoUser.user) throw new Error(erroAuth?.message ?? 'Erro ao criar usuário.')
        usuarioId = novoUser.user.id

        const tecnicoExistente = mapaTecnicos.get(pessoa.email)
        if (tecnicoExistente) {
          tecnicoId = tecnicoExistente.id
        } else {
          const { data: novoTecnico, error: erroTecnico } = await sb
            .from('tecnicos')
            .insert({ nome: pessoa.nome, email: pessoa.email, telefone: pessoa.telefone })
            .select('id')
            .single()
          if (erroTecnico || !novoTecnico) {
            await sb.auth.admin.deleteUser(usuarioId)
            throw new Error(erroTecnico?.message ?? 'Erro ao criar técnico.')
          }
          tecnicoId = novoTecnico.id
        }

        const { error: erroUsuario } = await sb.from('usuarios').insert({
          id: usuarioId, nome: pessoa.nome, email: pessoa.email, perfil: 'aplicador', tecnico_id: tecnicoId,
        })
        if (erroUsuario) {
          await sb.auth.admin.deleteUser(usuarioId)
          throw new Error(erroUsuario.message)
        }

        const { data: linkData, error: erroLink } = await sb.auth.admin.generateLink({
          type: 'recovery', email: pessoa.email,
        })
        if (erroLink || !linkData) throw new Error(erroLink?.message ?? 'Erro ao gerar link de acesso.')

        const texto = `Olá, ${pessoa.nome}!\n\nVocê foi cadastrado(a) no Sistema UNISOL Brasil, no projeto ${NOME_PROJETO}.\n\nPara definir sua senha e acessar o sistema, clique no link abaixo:\n${linkData.properties.action_link}\n\nSe não reconhece esse cadastro, pode ignorar este email.`
        const envio = await enviarEmail(pessoa.email, 'Acesso ao Sistema UNISOL Brasil', texto)
        if (!envio.ok) console.error(`Falha ao enviar convite pra ${pessoa.email}:`, envio.error)
      }

      // equipe_projeto: upsert (atualiza nível/regional se a pessoa já estava alocada)
      if (equipeTecnicoIds.has(tecnicoId)) {
        await sb.from('equipe_projeto')
          .update({ nivel_acesso: pessoa.nivelAcesso, regional: pessoa.regional })
          .eq('projeto_id', projeto.id).eq('tecnico_id', tecnicoId)
      } else {
        await sb.from('equipe_projeto').insert({
          projeto_id: projeto.id, tecnico_id: tecnicoId,
          nivel_acesso: pessoa.nivelAcesso, regional: pessoa.regional,
        })
        equipeTecnicoIds.add(tecnicoId)
      }

      resultados.push({
        nome: pessoa.nome, email: pessoa.email, nivelAcesso: pessoa.nivelAcesso,
        regional: pessoa.regional, acao, status: 'ok',
      })
    } catch (e) {
      resultados.push({
        nome: pessoa.nome, email: pessoa.email, nivelAcesso: pessoa.nivelAcesso,
        regional: pessoa.regional, acao, status: 'erro',
        erro: e instanceof Error ? e.message : String(e),
      })
    }
  }

  return NextResponse.json({
    confirmar,
    total: resultados.length,
    criar: resultados.filter(r => r.acao === 'criar').length,
    linkar: resultados.filter(r => r.acao === 'linkar').length,
    erros: resultados.filter(r => r.status === 'erro').length,
    resultados,
  })
}
