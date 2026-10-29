import { Bloco5Comercial } from './schema'

export type NivelMaturidade = 'inicial' | 'em_fase' | 'apta'

export interface MaturidadeComercial {
  nivel: NivelMaturidade | null  // null = Bloco 5 ainda não preenchido/avaliado
  motivo: string
}

export const MATURIDADE_LABEL: Record<NivelMaturidade, string> = {
  inicial: 'Inicial',
  em_fase: 'Em Fase',
  apta: 'Apta',
}

export const MATURIDADE_COR: Record<NivelMaturidade, { bg: string; cor: string }> = {
  inicial: { bg: '#fde2e1', cor: '#c0392b' },
  em_fase: { bg: '#fff3cd', cor: '#8a6d1a' },
  apta: { bg: '#d9f0e1', cor: '#1b5e3a' },
}

// Deriva a maturidade comercial (régua INICIAL/EM FASE/APTA, ver Plano de Ação — Implantação
// do CND) direto das respostas que o técnico já preenche no Bloco 5 — sem roteiro novo, sem
// pergunta extra. Prioriza a "Régua de Maturidade do Bloco" (nota de fechamento do técnico,
// com evidência) sobre o campo 5.7 isolado, quando as duas existem.
export function calcularMaturidadeComercial(respostas: Record<string, unknown> | null | undefined): MaturidadeComercial {
  const bloco5 = respostas?.bloco5 as Bloco5Comercial | undefined
  if (!bloco5) {
    return { nivel: null, motivo: 'Bloco 5 (Gestão Comercial) ainda não preenchido.' }
  }

  const nota = bloco5.regua_classificacao ?? bloco5.maturidade_comercial
  if (nota !== null && nota !== undefined) {
    let nivel: NivelMaturidade = nota <= 1 ? 'inicial' : nota <= 3 ? 'em_fase' : 'apta'
    let motivo = `Nota ${nota}/4 (${bloco5.regua_classificacao != null ? 'régua de fechamento do Bloco 5' : 'item 5.7'})`

    // Trava: sem emissão de NF não dá pra operar nos canais formais do CND, mesmo com nota alta —
    // mesmo critério já usado no Plano de Ação ("regularização jurídico-contábil... bloqueador
    // direto do início da operação comercial").
    if (nivel === 'apta' && bloco5.emite_nf === 'nao') {
      nivel = 'em_fase'
      motivo += ' — rebaixado por não emitir Nota Fiscal'
    }
    return { nivel, motivo }
  }

  // Técnico ainda não deu a nota 5.7/régua — estimar a partir de NF + canais ativos, mas sem
  // nunca inferir "Apta" sozinho: "pronta pra vender imediatamente" é julgamento que precisa
  // vir do técnico de verdade, não de checkbox (decidido com o Luciano, 2026-10-29).
  const canaisObj = (bloco5.canais ?? {}) as unknown as Record<string, { usa?: string; pct_vendas?: number }>
  const canalAtivo = Object.values(canaisObj).some(c => c?.usa === 'sim' && Number(c?.pct_vendas) > 0)
  const nfOk = bloco5.emite_nf === 'sempre' || bloco5.emite_nf === 'quando_solicitado'
  const temAlgumDado = bloco5.emite_nf || Object.keys(canaisObj).length > 0

  if (nfOk && canalAtivo) {
    return { nivel: 'em_fase', motivo: 'Estimado a partir de NF + canal(is) de venda ativo(s) — técnico ainda não deu a nota 5.7/régua.' }
  }
  if (temAlgumDado && !nfOk && !canalAtivo) {
    return { nivel: 'inicial', motivo: 'Estimado: sem NF regular e sem canal de venda ativo registrado — técnico ainda não deu a nota 5.7/régua.' }
  }
  return { nivel: null, motivo: 'Dados insuficientes pra estimar — técnico ainda não avaliou a maturidade comercial.' }
}
