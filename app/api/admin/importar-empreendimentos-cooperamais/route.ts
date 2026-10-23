import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { exigirAdmin } from '@/lib/auth'
import { buscarPlanilhaEmpreendimentos, type EmpreendimentoPlanilha } from '@/lib/importEmpreendimentosCooperamais'

const NOME_PROJETO = 'CooperaMais'

type ResultadoEmpreendimento = {
  nome: string
  uf: string
  municipio: string
  cnpj: string | null
  acao: 'criar' | 'ja_existe'
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

  let empreendimentos: EmpreendimentoPlanilha[]
  try {
    empreendimentos = await buscarPlanilhaEmpreendimentos()
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro ao ler a planilha.' }, { status: 502 })
  }

  const { data: existentes } = await sb.from('empreendimentos').select('id, cnpj')
  const mapaPorCnpj = new Map((existentes ?? []).filter(e => e.cnpj).map(e => [e.cnpj!.trim(), e.id]))

  const { data: vinculosExistentes } = await sb
    .from('empreendimento_projeto')
    .select('empreendimento_id')
    .eq('projeto_id', projeto.id)
  const idsJaVinculados = new Set((vinculosExistentes ?? []).map(v => v.empreendimento_id))

  const resultados: ResultadoEmpreendimento[] = []

  for (const emp of empreendimentos) {
    const existenteId = emp.cnpj ? mapaPorCnpj.get(emp.cnpj) : undefined
    const acao: 'criar' | 'ja_existe' = existenteId ? 'ja_existe' : 'criar'

    if (!confirmar) {
      resultados.push({ nome: emp.nome, uf: emp.uf, municipio: emp.municipio, cnpj: emp.cnpj, acao, status: 'preview' })
      continue
    }

    try {
      let empreendimentoId: string

      if (existenteId) {
        empreendimentoId = existenteId
      } else {
        const { data: novo, error: erroInsert } = await sb
          .from('empreendimentos')
          .insert({
            nome_fantasia: emp.nome,
            razao_social: emp.nome,
            cnpj: emp.cnpj,
            uf: emp.uf || null,
            municipio: emp.municipio || null,
            pessoa_referencia_email: emp.email,
            pessoa_referencia_tel: emp.telefone,
          })
          .select('id')
          .single()
        if (erroInsert || !novo) throw new Error(erroInsert?.message ?? 'Erro ao criar empreendimento.')
        empreendimentoId = novo.id
      }

      if (!idsJaVinculados.has(empreendimentoId)) {
        const { error: erroVinculo } = await sb
          .from('empreendimento_projeto')
          .insert({ empreendimento_id: empreendimentoId, projeto_id: projeto.id })
        if (erroVinculo) throw new Error(erroVinculo.message)
        idsJaVinculados.add(empreendimentoId)
      }

      resultados.push({ nome: emp.nome, uf: emp.uf, municipio: emp.municipio, cnpj: emp.cnpj, acao, status: 'ok' })
    } catch (e) {
      resultados.push({
        nome: emp.nome, uf: emp.uf, municipio: emp.municipio, cnpj: emp.cnpj, acao, status: 'erro',
        erro: e instanceof Error ? e.message : String(e),
      })
    }
  }

  return NextResponse.json({
    confirmar,
    total: resultados.length,
    criar: resultados.filter(r => r.acao === 'criar').length,
    ja_existe: resultados.filter(r => r.acao === 'ja_existe').length,
    erros: resultados.filter(r => r.status === 'erro').length,
    resultados,
  })
}
