import { getSupabase } from '@/lib/supabase'
import type { Diagnostico } from '@/lib/supabase'

// T0 = versao 1, T1 = versao 2, T2 = versao 3... — rotulo_versao manual (sessões antigas,
// ex: "T1-2027") tem prioridade quando existir; sem isso, cai no rótulo automático.
export function rotuloVersao(d: Pick<Diagnostico, 'versao' | 'rotulo_versao'>): string {
  return d.rotulo_versao || `T${d.versao - 1}`
}

// Fase do diagnóstico — usada nas listagens (Filiadas, Diagnósticos) pra ordenar e badge de
// status. Separado de "maturidade comercial" (régua do Bloco 5, mede o negócio) e de
// "classificação" (régua do Bloco 11, mede maturidade institucional) — isso aqui é só onde o
// diagnóstico está no próprio ciclo de preenchimento/validação.
export type FaseDiagnostico = 'validado' | 'em_validacao' | 'rascunho' | 'nao_iniciado'

export const FASE_ORDEM: Record<FaseDiagnostico, number> = { validado: 0, em_validacao: 1, rascunho: 2, nao_iniciado: 3 }
export const FASE_LABEL: Record<FaseDiagnostico, string> = {
  validado: 'Validado', em_validacao: 'Em validação', rascunho: 'Rascunho', nao_iniciado: 'Não iniciado',
}
export const FASE_COR: Record<FaseDiagnostico, { bg: string; cor: string }> = {
  validado: { bg: '#dcfce7', cor: '#15803d' },
  em_validacao: { bg: '#fef3c7', cor: '#b45309' },
  rascunho: { bg: '#f3f4f6', cor: '#4b5563' },
  nao_iniciado: { bg: '#f3f4f6', cor: '#9ca3af' },
}

export function faseDiagnostico(d: Pick<Diagnostico, 'enviado_em' | 'validado_em'> | null | undefined): FaseDiagnostico {
  if (!d) return 'nao_iniciado'
  if (d.validado_em) return 'validado'
  if (d.enviado_em) return 'em_validacao'
  return 'rascunho'
}

// Ordem pedida pelo Luciano (2026-11-23): Validados primeiro, depois Em validação, depois
// Rascunho/Não iniciado — alfabético dentro de cada grupo.
export function compararPorFaseENome(a: { fase: FaseDiagnostico; nome: string }, b: { fase: FaseDiagnostico; nome: string }): number {
  const diff = FASE_ORDEM[a.fase] - FASE_ORDEM[b.fase]
  if (diff !== 0) return diff
  return a.nome.localeCompare(b.nome, 'pt-BR')
}

export async function validarDiagnostico(diagnosticoId: string): Promise<{ novoId: string } | { error: string }> {
  const sb = getSupabase()
  const { data, error } = await sb.rpc('validar_diagnostico', { p_diagnostico_id: diagnosticoId })
  if (error) return { error: error.message }
  return { novoId: data as string }
}

export async function enviarParaValidacao(diagnosticoId: string): Promise<{ ok: true } | { error: string }> {
  const sb = getSupabase()
  const { error } = await sb.rpc('enviar_para_validacao', { p_diagnostico_id: diagnosticoId })
  if (error) return { error: error.message }
  return { ok: true }
}

export async function cancelarEnvioValidacao(diagnosticoId: string): Promise<{ ok: true } | { error: string }> {
  const sb = getSupabase()
  const { error } = await sb.rpc('cancelar_envio_validacao', { p_diagnostico_id: diagnosticoId })
  if (error) return { error: error.message }
  return { ok: true }
}
