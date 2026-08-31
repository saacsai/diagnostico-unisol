import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function getSupabase() {
  return createClient(url, anon)
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

// ─── Entidades ────────────────────────────────────────────────────────────────

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: Perfil
  instituicao: string | null
  ativo: boolean
  created_at: string
}

export interface Diagnostico {
  id: string
  codigo_empreendimento: string
  versao: number
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
