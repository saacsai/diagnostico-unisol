// Bloco 11 — soma as 11 dimensões (0-4 cada, N/A exclui do denominador; máx. 44) e
// deriva a classificação pelas faixas de média oficiais do documento revisado.

export const DIMENSOES_MATURIDADE = [
  { chave: 'identificacao_territorialidade', label: 'Identificação e territorialidade (Bloco 0)' },
  { chave: 'documentacao_regularidade', label: 'Documentação e regularidade (Bloco 1)' },
  { chave: 'gestao_governanca', label: 'Gestão e governança (Bloco 2)' },
  { chave: 'gestao_pessoas', label: 'Gestão de pessoas (Bloco 3)' },
  { chave: 'gestao_financeira', label: 'Gestão financeira (Bloco 4)' },
  { chave: 'gestao_comercial', label: 'Gestão comercial e acesso a mercados (Bloco 5)' },
  { chave: 'producao_infraestrutura_qualidade', label: 'Produção, infraestrutura e qualidade (Bloco 6)' },
  { chave: 'sustentabilidade_socioambiental', label: 'Sustentabilidade socioambiental (Bloco 7)' },
  { chave: 'logistica_intercooperacao', label: 'Logística e intercooperação (Bloco 9)' },
  { chave: 'tecnologia_insercao_digital', label: 'Tecnologia e inserção digital (Bloco 9)' },
  { chave: 'capacidade_formativa', label: 'Capacidade formativa e participação de beneficiários (Parte B)' },
] as const

export function calcularPontuacao(dimensoes: Record<string, { nota?: string | number }>) {
  const notas = DIMENSOES_MATURIDADE
    .map(d => dimensoes[d.chave]?.nota)
    .filter(n => n !== undefined && n !== null && n !== '' && n !== 'na')
    .map(Number)

  if (notas.length === 0) return { total: null, media: null, classificacao: '' as const }

  const total = notas.reduce((s, n) => s + n, 0)
  const media = total / notas.length

  let classificacao: 'emergencial' | 'inicial' | 'em_desenvolvimento' | 'estruturado' | 'consolidado'
  if (media < 1.0) classificacao = 'emergencial'
  else if (media < 2.0) classificacao = 'inicial'
  else if (media < 3.0) classificacao = 'em_desenvolvimento'
  else if (media <= 3.5) classificacao = 'estruturado'
  else classificacao = 'consolidado'

  return { total, media, classificacao }
}

export const LABEL_CLASSIFICACAO: Record<string, string> = {
  emergencial: 'Emergencial (0,0–0,9)',
  inicial: 'Inicial (1,0–1,9)',
  em_desenvolvimento: 'Em desenvolvimento (2,0–2,9)',
  estruturado: 'Estruturado (3,0–3,5)',
  consolidado: 'Consolidado (3,6–4,0)',
}
