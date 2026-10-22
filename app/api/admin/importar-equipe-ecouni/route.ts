import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { exigirAdmin } from '@/lib/auth'
import { enviarEmail } from '@/lib/email'
import { criarLinkCurto } from '@/lib/linkCurto'
import { buscarPlanilha, type PessoaPlanilha } from '@/lib/importEcouni'

const NOME_PROJETO = 'CooperaMais'
const SITE_URL = 'https://sistema.unisolbrasil.org.br'

// A planilha tem o email antigo/pessoal do Luciano — a conta real dele no
// sistema usa outro email. Sem essa correção, criaríamos uma conta duplicada
// em vez de linkar na existente.
const CORRECOES_EMAIL: Record<string, string> = {
  'luciano.maeda@gmail.com': 'luciano.maeda@saacs.com.br',
  'vitorcn3@gail.com': 'vitorcn3@gmail.com', // erro de digitação confirmado pelo Luciano
}

function gerarSenhaTemp() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let s = ''
  for (let i = 0; i < 12; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s + '!1'
}

// Regional (rótulo vindo da planilha) -> UF representativo do território desse Executante.
// Qualquer UF dentro do mesmo território resolve pro mesmo projeto_executante_id — só
// precisa de um pra achar a linha certa (ver migration 20).
const REGIONAL_PARA_UF_REPRESENTATIVO: Record<string, string> = {
  Sudeste: 'SP', Nordeste: 'BA', Sul: 'RS', Norte: 'AC', 'Centro-Oeste': 'MT',
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
  const apenas = req.nextUrl.searchParams.get('apenas')?.toLowerCase() || null
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
  if (apenas) pessoas = pessoas.filter(p => p.email === apenas)

  // Resolve cada Regional da planilha pro projeto_executante_id real (ver migration 20) —
  // via território: pega um UF representativo do rótulo e busca quem é dono desse UF.
  const { data: territorios } = await sb
    .from('projeto_executante_territorio')
    .select('uf, projeto_executante_id, projeto_executantes!inner(projeto_id)')
    .eq('projeto_executantes.projeto_id', projeto.id)
  const mapaUfParaExecutante = new Map(
    (territorios ?? []).map(t => [t.uf, t.projeto_executante_id as string])
  )
  function resolverExecutanteId(regional: string | null): string | null {
    if (!regional) return null
    const uf = REGIONAL_PARA_UF_REPRESENTATIVO[regional]
    return uf ? mapaUfParaExecutante.get(uf) ?? null : null
  }

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
      }

      // Todo mundo recebe o email — quem já tinha conta também, pra
      // redefinir a senha (pedido explícito do Luciano: padronizar acesso
      // pra todo o time, não só quem é conta nova).
      const { data: linkData, error: erroLink } = await sb.auth.admin.generateLink({
        type: 'recovery', email: pessoa.email,
        options: { redirectTo: `${SITE_URL}/redefinir-senha` },
      })
      if (erroLink || !linkData) throw new Error(erroLink?.message ?? 'Erro ao gerar link de acesso.')

      // Link cru do Supabase é longo e aponta pra um domínio desconhecido
      // (aloumokqafywqntdisen.supabase.co) — passa por um link curto no
      // próprio domínio sistema.unisolbrasil.org.br antes de ir no email.
      const linkCurto = await criarLinkCurto(linkData.properties.action_link)

      const texto = acao === 'criar'
        ? `Olá, ${pessoa.nome}!\n\nVocê foi cadastrado(a) no Sistema UNISOL Brasil, no projeto ${NOME_PROJETO}.\n\nPara definir sua senha e acessar o sistema, clique no link abaixo:\n${linkCurto}\n\nSe não reconhece esse cadastro, pode ignorar este email.`
        : `Olá, ${pessoa.nome}!\n\nSeu acesso ao Sistema UNISOL Brasil, no projeto ${NOME_PROJETO}, foi atualizado. Pedimos que redefina sua senha pelo link abaixo:\n${linkCurto}\n\nSe não reconhece esse pedido, pode ignorar este email.`
      const envio = await enviarEmail(pessoa.email, 'Acesso ao Sistema UNISOL Brasil', texto)
      if (!envio.ok) console.error(`Falha ao enviar email pra ${pessoa.email}:`, envio.error)

      // equipe_projeto: upsert (atualiza nível/território se a pessoa já estava alocada)
      const projetoExecutanteId = resolverExecutanteId(pessoa.regional)
      if (equipeTecnicoIds.has(tecnicoId)) {
        await sb.from('equipe_projeto')
          .update({ nivel_acesso: pessoa.nivelAcesso, projeto_executante_id: projetoExecutanteId })
          .eq('projeto_id', projeto.id).eq('tecnico_id', tecnicoId)
      } else {
        await sb.from('equipe_projeto').insert({
          projeto_id: projeto.id, tecnico_id: tecnicoId,
          nivel_acesso: pessoa.nivelAcesso, projeto_executante_id: projetoExecutanteId,
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
