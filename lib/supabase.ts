import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton — criar um createClient() novo a cada chamada gera várias instâncias de
// GoTrueClient competindo pelo mesmo localStorage/refresh token, o que fica arriscado assim
// que existe um motor de sync rodando em paralelo com chamadas feitas por componentes.
let cliente: SupabaseClient | null = null
export function getSupabase() {
  if (!cliente) cliente = createClient(url, anon)
  return cliente
}

export function getSupabaseAdmin() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ─── Enums ───────────────────────────────────────────────────────────────────

export type Perfil          = 'aplicador' | 'tecnico' | 'admin'
export type Modalidade      = 'presencial' | 'online' | 'hibrida'
export type StatusDiagnostico =
  | 'rascunho'
  | 'entrevista_concluida'
  | 'em_analise_tecnica'
  | 'concluido'
export type Classificacao =
  | 'emergencial'
  | 'inicial'
  | 'em_desenvolvimento'
  | 'estruturado'
  | 'consolidado'
export type FormaOrganizativa =
  | 'cooperativa'
  | 'associacao'
  | 'grupo_informal'
  | 'rede_central'
  | 'empreendimento_comunitario'
  | 'outra'
export type Zona              = 'urbana' | 'rural' | 'transicao'
export type VinculacaoUnisol  = 'filiado' | 'em_processo' | 'nao_filiado' | 'nao_sabe'
export type StatusEmpProjeto  = 'ativo' | 'inativo' | 'encerrado'
export type StatusEstadual    = 'formalizada' | 'em_constituicao'
export type StatusProjeto     = 'em_concorrencia' | 'em_fase_aprovacao' | 'em_execucao' | 'encerrado'
export type CategoriaInstrumento = 'emenda' | 'mrosc' | 'outro'
export type EntidadeTipo      = 'unisol_brasil' | 'unisol_estadual' | 'projeto' | 'diagnostico' | 'empreendimento'
export type EntidadeDiretoria = 'unisol_brasil' | 'unisol_estadual'
export type AreaAtuacao       = 'ater' | 'administrativo' | 'comunicacao' | 'coordenacao' | 'juridico' | 'contabil' | 'ti'

// ─── Entidades ────────────────────────────────────────────────────────────────

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: Perfil
  instituicao: string | null
  unisol_estadual_id: string | null
  ativo: boolean
  created_at: string
}

// UNISOL SP, UNISOL BA, UNISOL RS etc. — a estadual é "de onde o empreendimento é"
// (eixo institucional), independente de "em que projeto ele está engajado agora"
// (eixo empreendimento_projeto). Mesmo cadastro, dois ângulos.
export interface UnisolEstadual {
  id: string
  nome: string
  uf: string
  cnpj: string | null
  endereco: string | null
  municipio: string | null
  cep: string | null
  site: string | null
  status: StatusEstadual
  representante_nome: string | null
  representante_cargo: string | null
  representante_rg: string | null
  representante_cpf: string | null
  representante_tel: string | null
  representante_email: string | null
  ativo: boolean
  created_at: string
}

export interface UnisolBrasil {
  id: string
  nome: string
  cnpj: string | null
  endereco: string | null
  municipio: string | null
  uf: string | null
  cep: string | null
  site: string | null
  representante_nome: string | null
  representante_cargo: string | null
  representante_rg: string | null
  representante_cpf: string | null
  representante_tel: string | null
  representante_email: string | null
  created_at: string
  updated_at: string
}

export interface DiretoriaMembro {
  id: string
  entidade_tipo: EntidadeDiretoria
  entidade_id: string
  nome_completo: string
  cargo: string | null
  endereco: string | null
  email: string | null
  telefone: string | null
  cpf: string | null
  rg: string | null
  created_at: string
}

export interface DocumentoInstitucional {
  id: string
  entidade_tipo: EntidadeTipo
  entidade_id: string
  tipo_documento: string
  nome_arquivo: string | null
  storage_path: string
  data_emissao: string | null
  data_validade: string | null
  observacao: string | null
  uploaded_by: string | null
  created_at: string
}

// Cadastro Nacional UNISOL — os ~1000 empreendimentos afiliados (não é exclusivo do
// CooperaMais; ver empreendimento_projeto para o vínculo N:N com cada projeto).
export interface Empreendimento {
  id: string
  codigo: string | null
  razao_social: string | null
  nome_fantasia: string | null
  forma_organizativa: FormaOrganizativa | null
  cnpj: string | null
  ano_criacao: number | null
  ano_formalizacao: number | null
  endereco: string | null
  regiao: string | null
  uf: string | null
  municipio: string | null
  zona: Zona | null
  territorio_tipo: string | null
  area_abrangencia: string | null
  telefones: string | null
  email: string | null
  redes_sociais: string | null
  site: string | null
  pessoa_referencia_nome: string | null
  pessoa_referencia_funcao: string | null
  pessoa_referencia_tel: string | null
  pessoa_referencia_email: string | null
  vinculacao_unisol: VinculacaoUnisol | null
  unisol_estadual_id: string | null
  bsr_referencia: string | null
  created_at: string
  updated_at: string
}

export interface Projeto {
  id: string
  nome: string
  descricao: string | null
  resumo: string | null
  financiador: string | null
  orgao_responsavel: string | null
  tipo_instrumento: string | null
  categoria_instrumento: CategoriaInstrumento
  numero_termo_fomento: string | null
  numero_transferegov: string | null
  status: StatusProjeto
  data_inicio_execucao: string | null
  data_fim_execucao: string | null
  ativo: boolean
  created_at: string
}

// Banco de talentos técnicos — separado de `usuarios` (login). Cadastro de quem está
// disponível pra atuar, independente de ter acesso ao sistema.
export interface Tecnico {
  id: string
  nome: string
  telefone: string | null
  email: string | null
  area_atuacao: AreaAtuacao | null
  competencias: string | null
  unisol_estadual_id: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

// Equipe — aloca um Técnico (banco de talentos) num Projeto, com cargo/função. Eixo
// independente de empreendimento_projeto (Filiados no projeto) e de tecnicos.unisol_estadual_id
// (vínculo institucional do técnico).
export interface EquipeProjeto {
  id: string
  projeto_id: string
  tecnico_id: string
  cargo: string | null
  data_entrada: string
  data_saida: string | null
  ativo: boolean
  created_at: string
}

export interface EmpreendimentoProjeto {
  id: string
  empreendimento_id: string
  projeto_id: string
  status: StatusEmpProjeto
  data_entrada: string
  created_at: string
}

export interface Diagnostico {
  id: string
  empreendimento_id: string
  /** Contexto opcional — "coletado no âmbito de X". Diagnóstico pertence ao Filiado, não ao projeto. */
  projeto_id: string | null
  versao: number
  /** Rótulo legível da versão, ex: 'T0', 'T1-2027' */
  rotulo_versao: string | null
  /** Breve relato do que mudou nesta versão em relação à anterior (opcional) */
  relato_versao: string | null
  /** Snapshot no momento da criação — fonte de verdade é empreendimentos.nome_fantasia */
  nome_empreendimento: string | null
  regiao: string | null
  uf: string | null
  municipio: string | null
  modalidade: Modalidade | null
  aplicador_id: string
  status: StatusDiagnostico
  respostas: Record<string, unknown>
  analise_tecnica: Record<string, unknown>
  pontuacao_total: number | null
  classificacao: Classificacao | null
  tecnico_analista_id: string | null
  device_id: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}
