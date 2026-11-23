import { getSupabase } from '@/lib/supabase'
import type { Diagnostico } from '@/lib/supabase'

// T0 = versao 1, T1 = versao 2, T2 = versao 3... — rotulo_versao manual (sessões antigas,
// ex: "T1-2027") tem prioridade quando existir; sem isso, cai no rótulo automático.
export function rotuloVersao(d: Pick<Diagnostico, 'versao' | 'rotulo_versao'>): string {
  return d.rotulo_versao || `T${d.versao - 1}`
}

export async function validarDiagnostico(diagnosticoId: string): Promise<{ novoId: string } | { error: string }> {
  const sb = getSupabase()
  const { data, error } = await sb.rpc('validar_diagnostico', { p_diagnostico_id: diagnosticoId })
  if (error) return { error: error.message }
  return { novoId: data as string }
}
