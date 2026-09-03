export type SituacaoDocumento = 'sem_validade' | 'vigente' | 'vencendo' | 'vencida'

export function situacaoDocumento(dataValidade: string | null): SituacaoDocumento {
  if (!dataValidade) return 'sem_validade'
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const validade = new Date(dataValidade + 'T00:00:00')
  const dias = (validade.getTime() - hoje.getTime()) / 86_400_000
  if (dias < 0) return 'vencida'
  if (dias <= 30) return 'vencendo'
  return 'vigente'
}

export const LABEL_SITUACAO: Record<SituacaoDocumento, { texto: string; cor: string; bg: string }> = {
  sem_validade: { texto: 'Sem validade', cor: '#6b7280', bg: '#f3f4f6' },
  vigente:      { texto: 'Vigente',      cor: '#15803d', bg: '#dcfce7' },
  vencendo:     { texto: 'Vencendo',     cor: '#b45309', bg: '#fef3c7' },
  vencida:      { texto: 'Vencida',      cor: '#dc2626', bg: '#fee2e2' },
}

export const TIPOS_DOCUMENTO = [
  { value: 'estatuto', label: 'Estatuto' },
  { value: 'ata_eleicao', label: 'Ata de eleição' },
  { value: 'cnd_federal', label: 'CND Federal' },
  { value: 'cnd_fgts', label: 'CND FGTS' },
  { value: 'cnd_trabalhista', label: 'CND Trabalhista' },
  { value: 'cnd_estadual', label: 'CND Estadual' },
  { value: 'cnd_municipal', label: 'CND Municipal' },
  { value: 'plano_trabalho', label: 'Plano de Trabalho' },
  { value: 'outro', label: 'Outro' },
]
