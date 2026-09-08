import { getSupabase } from '@/lib/supabase'

export interface TotaisAdmin {
  diagnosticosConcluidos: number
  diagnosticosEmAberto: number
  filiadas: number
  projetosAtivos: number
}

export async function carregarTotaisAdmin(): Promise<TotaisAdmin> {
  const sb = getSupabase()
  const [concluidos, emAberto, filiadas, projetos] = await Promise.all([
    sb.from('diagnosticos').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('status', 'concluido'),
    sb.from('diagnosticos').select('*', { count: 'exact', head: true }).is('deleted_at', null).neq('status', 'concluido'),
    sb.from('empreendimentos').select('*', { count: 'exact', head: true }),
    sb.from('projetos').select('*', { count: 'exact', head: true }).eq('ativo', true),
  ])
  return {
    diagnosticosConcluidos: concluidos.count ?? 0,
    diagnosticosEmAberto: emAberto.count ?? 0,
    filiadas: filiadas.count ?? 0,
    projetosAtivos: projetos.count ?? 0,
  }
}
