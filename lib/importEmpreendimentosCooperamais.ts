import { parseCsv } from './importEcouni'

export const PLANILHA_EMPREENDIMENTOS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1GhvDjjcd7N8Y4Bll6encm4INaedVK0uX/export?format=csv'

export type EmpreendimentoPlanilha = {
  cnpj: string | null
  nome: string
  uf: string
  municipio: string
  email: string | null
  telefone: string | null
}

export function normalizarEmpreendimentos(csvTexto: string): EmpreendimentoPlanilha[] {
  const linhas = parseCsv(csvTexto)
  const idxHeader = linhas.findIndex(l => l[0]?.trim() === 'Nº')
  if (idxHeader === -1) throw new Error('Cabeçalho da planilha não encontrado — formato mudou?')

  const resultado: EmpreendimentoPlanilha[] = []
  for (const linha of linhas.slice(idxHeader + 1)) {
    const [, cnpjBruto, nome, uf, municipio, email, telefone] = linha
    if (!nome?.trim()) continue

    const cnpj = cnpjBruto?.trim()
    resultado.push({
      // "INFORMAL" não é CNPJ real — vira null, não um valor repetido entre várias
      // associações diferentes (evitaria dedupe errado e lookup de CNPJ ambíguo).
      cnpj: cnpj && cnpj.toUpperCase() !== 'INFORMAL' ? cnpj : null,
      nome: nome.trim(),
      uf: uf?.trim().toUpperCase() || '',
      municipio: municipio?.trim() || '',
      email: email?.trim() || null,
      telefone: telefone?.trim() || null,
    })
  }
  return resultado
}

export async function buscarPlanilhaEmpreendimentos(): Promise<EmpreendimentoPlanilha[]> {
  const res = await fetch(PLANILHA_EMPREENDIMENTOS_CSV_URL, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Falha ao buscar a planilha (HTTP ${res.status})`)
  const texto = await res.text()
  return normalizarEmpreendimentos(texto)
}
