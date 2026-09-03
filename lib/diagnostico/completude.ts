import { SECOES } from './secoesConfig'
import type { Diagnostico, Empreendimento } from '@/lib/supabase'

export function calcularCompletude(
  diagnostico: Pick<Diagnostico, 'respostas' | 'analise_tecnica'>,
  empreendimento: Empreendimento | null | undefined
) {
  const respostas = (diagnostico.respostas as Record<string, unknown>) || {}
  const analiseTecnica = (diagnostico.analise_tecnica as Record<string, unknown>) || {}

  let feitas = 0
  const completas: Record<string, boolean> = {}
  for (const s of SECOES) {
    let ok = false
    if (s.destino === 'respostas') ok = !!respostas[s.id]
    else if (s.destino === 'analise_tecnica') ok = !!analiseTecnica[s.id]
    else if (s.destino === 'empreendimento') ok = !!empreendimento?.nome_fantasia
    completas[s.id] = ok
    if (ok) feitas++
  }
  return { feitas, total: SECOES.length, pct: Math.round((feitas / SECOES.length) * 100), completas }
}
