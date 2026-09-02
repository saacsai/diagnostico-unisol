// Seção 17 — soma as 13 dimensões (0-4 cada, máx. 52) e deriva a classificação
// pelas faixas de média oficiais do formulário.

export const DIMENSOES_MATURIDADE = [
  { chave: 'governanca', label: 'Governança e autogestão' },
  { chave: 'regularidade_juridica', label: 'Regularidade jurídica/institucional' },
  { chave: 'gestao_administrativa', label: 'Gestão administrativa e financeira' },
  { chave: 'producao_qualidade', label: 'Produção e controle de qualidade' },
  { chave: 'infraestrutura', label: 'Infraestrutura e beneficiamento' },
  { chave: 'regularizacao_embalagem', label: 'Regularização, embalagem e rastreabilidade' },
  { chave: 'comercializacao', label: 'Comercialização e acesso a mercados' },
  { chave: 'logistica', label: 'Logística e armazenamento' },
  { chave: 'intercooperacao', label: 'Intercooperação e atuação em rede' },
  { chave: 'tecnologia', label: 'Tecnologia e inserção digital' },
  { chave: 'sustentabilidade', label: 'Sustentabilidade ambiental' },
  { chave: 'genero_juventude', label: 'Igualdade de gênero e juventude' },
  { chave: 'capacidade_formativa', label: 'Capacidade formativa/participação' },
] as const

export function calcularPontuacao(dimensoes: Record<string, { nota?: string | number }>) {
  const notas = DIMENSOES_MATURIDADE
    .map(d => dimensoes[d.chave]?.nota)
    .filter(n => n !== undefined && n !== null && n !== '')
    .map(Number)

  if (notas.length === 0) return { total: null, media: null, classificacao: '' as const }

  const total = notas.reduce((s, n) => s + n, 0)
  const media = total / DIMENSOES_MATURIDADE.length

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
