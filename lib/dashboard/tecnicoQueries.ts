import { getSupabase, Diagnostico } from '@/lib/supabase'

export interface TotaisTecnico {
  concluidos: number
  emAberto: number
  /** true = usuário ainda não foi ligado a um registro de tecnicos por um admin */
  semVinculo: boolean
}

// "Meus diagnósticos" não é só histórico (quem já mexeu, via aplicador_id/tecnico_analista_id)
// nem só atribuição (tecnico_empreendimento_projeto — quem deveria mexer) — é a união das
// duas, por empreendimento. Uma Filiada atribuída sem diagnóstico nenhum ainda conta como
// "em aberto" (é exatamente o trabalho de campo pendente), e um diagnóstico que o técnico
// tocou fora de uma atribuição formal (cobrindo colega, dado antigo) também continua contando.
export async function carregarTotaisTecnico(usuarioId: string, tecnicoId: string | null): Promise<TotaisTecnico> {
  const sb = getSupabase()

  const { data: pessoais } = await sb.from('diagnosticos').select('*')
    .or(`aplicador_id.eq.${usuarioId},tecnico_analista_id.eq.${usuarioId}`)
    .is('deleted_at', null)

  const porEmpreendimento = new Map<string, Diagnostico | null>()
  const guardarSeMaisRecente = (d: Diagnostico) => {
    const atual = porEmpreendimento.get(d.empreendimento_id)
    if (!atual || d.versao > atual.versao) porEmpreendimento.set(d.empreendimento_id, d)
  }
  for (const d of (pessoais as Diagnostico[]) || []) guardarSeMaisRecente(d)

  if (tecnicoId) {
    const { data: atribuicoes } = await sb.from('tecnico_empreendimento_projeto')
      .select('empreendimento_id').eq('tecnico_id', tecnicoId)
    const empIds = Array.from(new Set(
      ((atribuicoes as { empreendimento_id: string }[]) || []).map(a => a.empreendimento_id)
    ))

    if (empIds.length > 0) {
      const { data: diagsAtribuidos } = await sb.from('diagnosticos').select('*')
        .in('empreendimento_id', empIds).is('deleted_at', null)
      for (const d of (diagsAtribuidos as Diagnostico[]) || []) guardarSeMaisRecente(d)

      // Filiada atribuída sem nenhum diagnóstico ainda — sentinela null, conta como "em aberto"
      for (const empId of empIds) {
        if (!porEmpreendimento.has(empId)) porEmpreendimento.set(empId, null)
      }
    }
  }

  let concluidos = 0
  let emAberto = 0
  for (const d of Array.from(porEmpreendimento.values())) {
    if (d?.status === 'concluido') concluidos++
    else emAberto++
  }

  return { concluidos, emAberto, semVinculo: !tecnicoId }
}
