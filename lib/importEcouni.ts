import type { NivelAcesso, Regional } from './supabase'

export const PLANILHA_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1dxCruARXRB7KC7EylVlzPwPK6Bg1XVsm/export?format=csv'

export type PessoaPlanilha = {
  nome: string
  email: string
  telefone: string | null
  nivelAcesso: NivelAcesso
  regional: Regional | null
}

// Parser CSV mínimo — lida com campo entre aspas contendo vírgula e aspas
// duplicadas escapadas ("" dentro de campo), que é exatamente o que a
// planilha do EcoUni usa (ex: "Projeto inteiro – 5 regionais, 13 UFs").
export function parseCsv(texto: string): string[][] {
  const linhas: string[][] = []
  let campo = ''
  let linha: string[] = []
  let dentroAspas = false

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (dentroAspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++ }
      else if (c === '"') { dentroAspas = false }
      else { campo += c }
    } else {
      if (c === '"') dentroAspas = true
      else if (c === ',') { linha.push(campo); campo = '' }
      else if (c === '\r') { /* ignora, \n cuida da quebra */ }
      else if (c === '\n') { linha.push(campo); linhas.push(linha); linha = []; campo = '' }
      else campo += c
    }
  }
  if (campo.length > 0 || linha.length > 0) { linha.push(campo); linhas.push(linha) }
  return linhas
}

// Regional (do CooperaMais/EcoUni, não institucional) por UF — derivado da própria
// planilha (seção Nacional/Regional + abrangência de cada extensionista).
const UF_PARA_REGIONAL: Record<string, Regional> = {
  AC: 'Norte', AM: 'Norte',
  BA: 'Nordeste', CE: 'Nordeste', PB: 'Nordeste', PI: 'Nordeste', SE: 'Nordeste',
  MG: 'Sudeste', SP: 'Sudeste',
  RS: 'Sul', SC: 'Sul',
  MT: 'Centro-Oeste', MS: 'Centro-Oeste',
}

const REGIONAIS_VALIDAS: Regional[] = ['Norte', 'Nordeste', 'Sudeste', 'Sul', 'Centro-Oeste']

function limparNivelAcesso(bruto: string): NivelAcesso | null {
  const t = bruto.trim().toLowerCase()
  if (t.startsWith('nacional')) return 'nacional'
  if (t.startsWith('regional')) return 'regional'
  if (t.startsWith('extensionista')) return 'extensionista'
  return null
}

// A planilha às vezes cola texto extra no nome (ex: "Nelsa Inês Fabian Nespolo –
// Diretoria UNISOL Brasil / UNISOL RS (...)") — corta no primeiro " – ".
function limparNome(bruto: string): string {
  return bruto.split(' – ')[0].trim()
}

function extrairRegional(nivelAcesso: NivelAcesso, abrangencia: string): Regional | null {
  if (nivelAcesso === 'nacional') return null

  // UF primeiro, não o nome da regional — texto de "Abrangência" de
  // extensionista às vezes cita um sub-território que contém o NOME de uma
  // regional errada por coincidência (ex: "RS – Norte do RS e Litoral Norte
  // (definido pela Regional Sul)" contém a palavra "Norte" duas vezes, mas a
  // regional de verdade é Sul). A sigla de UF no início do texto é inequívoca.
  const matchUf = abrangencia.trim().match(/^([A-Z]{2})\b/)
  if (matchUf && UF_PARA_REGIONAL[matchUf[1]]) return UF_PARA_REGIONAL[matchUf[1]]

  // Sem UF no início (linhas dos coordenadores Regionais, tipo "Regional
  // Norte (AC, AM)") — aí sim procura o nome da regional no texto.
  for (const r of REGIONAIS_VALIDAS) {
    if (abrangencia.includes(r)) return r
  }

  return null
}

// Lê o CSV cru da planilha e devolve a lista de pessoas únicas e prontas pra
// processar — já deduplicadas por email (mantém a primeira aparição = papel
// primário, consistente com como a planilha lista coordenador regional antes
// de aparições extras como "provisório"), já sem as linhas "a contratar"
// (sem email, não tem dado suficiente pra criar conta).
export function normalizarPlanilha(csvTexto: string): PessoaPlanilha[] {
  const linhas = parseCsv(csvTexto)

  const idxHeader = linhas.findIndex(l => l[0]?.trim() === 'Nível de acesso')
  if (idxHeader === -1) throw new Error('Cabeçalho da planilha não encontrado — formato mudou?')

  const vistos = new Set<string>()
  const pessoas: PessoaPlanilha[] = []

  for (const linha of linhas.slice(idxHeader + 1)) {
    const [nivelBruto, nomeBruto, , abrangencia, telefone, email] = linha
    if (!nivelBruto?.trim() || !nomeBruto?.trim()) continue

    const emailLimpo = email?.trim().toLowerCase()
    if (!emailLimpo) continue // "a contratar" — sem dado pra criar conta

    if (vistos.has(emailLimpo)) continue // mesma pessoa já processada (papel primário)
    vistos.add(emailLimpo)

    const nivelAcesso = limparNivelAcesso(nivelBruto)
    if (!nivelAcesso) continue

    pessoas.push({
      nome: limparNome(nomeBruto),
      email: emailLimpo,
      telefone: telefone?.trim() || null,
      nivelAcesso,
      regional: extrairRegional(nivelAcesso, abrangencia || ''),
    })
  }

  return pessoas
}

export async function buscarPlanilha(): Promise<PessoaPlanilha[]> {
  const res = await fetch(PLANILHA_CSV_URL, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Falha ao buscar a planilha (HTTP ${res.status})`)
  const texto = await res.text()
  return normalizarPlanilha(texto)
}
