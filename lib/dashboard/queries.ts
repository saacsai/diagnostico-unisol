import { getSupabase } from '@/lib/supabase'

export interface TotaisAdmin {
  diagnosticosConcluidos: number
  diagnosticosEmAberto: number
  diagnosticosAguardandoValidacao: number
  filiadas: number
  projetosAtivos: number
}

export interface DiagnosticoAguardandoValidacao {
  id: string
  empreendimento_id: string
  nome_empreendimento: string
  municipio: string | null
  uf: string | null
  enviado_em: string
  enviado_por_nome: string
}

export async function carregarTotaisAdmin(): Promise<TotaisAdmin> {
  const sb = getSupabase()
  // `diagnosticos.status` nunca é escrito pelo app de verdade (fica sempre 'rascunho') — a
  // métrica real de "concluído" é `validado_em`, que só existe a partir da linha do tempo
  // T0/T1/T2 (2026-11-23).
  const [concluidos, emAberto, aguardando, filiadas, projetos] = await Promise.all([
    sb.from('diagnosticos').select('*', { count: 'exact', head: true }).is('deleted_at', null).not('validado_em', 'is', null),
    sb.from('diagnosticos').select('*', { count: 'exact', head: true }).is('deleted_at', null).is('validado_em', null),
    sb.from('diagnosticos').select('*', { count: 'exact', head: true }).is('deleted_at', null).not('enviado_em', 'is', null).is('validado_em', null),
    sb.from('empreendimentos').select('*', { count: 'exact', head: true }),
    sb.from('projetos').select('*', { count: 'exact', head: true }).eq('ativo', true),
  ])
  return {
    diagnosticosConcluidos: concluidos.count ?? 0,
    diagnosticosEmAberto: emAberto.count ?? 0,
    diagnosticosAguardandoValidacao: aguardando.count ?? 0,
    filiadas: filiadas.count ?? 0,
    projetosAtivos: projetos.count ?? 0,
  }
}

// Fila de diagnósticos que o técnico já enviou e ainda não foram validados — é como o admin
// sabe que precisa agir, sem precisar visitar Filiada por Filiada procurando o selo.
export async function carregarAguardandoValidacao(): Promise<DiagnosticoAguardandoValidacao[]> {
  const sb = getSupabase()
  const { data: diags } = await sb
    .from('diagnosticos')
    .select('id, empreendimento_id, enviado_em, enviado_por')
    .is('deleted_at', null)
    .not('enviado_em', 'is', null)
    .is('validado_em', null)
    .order('enviado_em', { ascending: true })

  const lista = diags || []
  if (lista.length === 0) return []

  const idsEmp = Array.from(new Set(lista.map(d => d.empreendimento_id)))
  const idsPessoas = Array.from(new Set(lista.map(d => d.enviado_por).filter((id): id is string => !!id)))

  // municipio/uf/nome_fantasia vêm do empreendimento, não do snapshot em `diagnosticos`
  // (nome_empreendimento/municipio/uf lá nunca são escritos pelo fluxo real — ficam sempre null).
  const [{ data: emps }, { data: pessoas }] = await Promise.all([
    sb.from('empreendimentos').select('id, nome_fantasia, razao_social, municipio, uf').in('id', idsEmp),
    idsPessoas.length > 0
      ? sb.from('usuarios').select('id, nome').in('id', idsPessoas)
      : Promise.resolve({ data: [] as { id: string; nome: string }[] }),
  ])
  const empPorId = new Map((emps || []).map(e => [e.id, e]))
  const nomePessoa = new Map((pessoas || []).map(p => [p.id, p.nome]))

  return lista.map(d => {
    const emp = empPorId.get(d.empreendimento_id)
    return {
      id: d.id,
      empreendimento_id: d.empreendimento_id,
      nome_empreendimento: emp?.nome_fantasia || emp?.razao_social || 'Sem nome',
      municipio: emp?.municipio ?? null,
      uf: emp?.uf ?? null,
      enviado_em: d.enviado_em!,
      enviado_por_nome: (d.enviado_por && nomePessoa.get(d.enviado_por)) || 'técnico',
    }
  })
}
