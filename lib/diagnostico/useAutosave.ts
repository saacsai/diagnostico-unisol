'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

export type SyncStatus = 'idle' | 'salvando' | 'salvo' | 'erro'

// Versão ONLINE do autosave — grava direto no Supabase, debounced. A interface
// (salvarRespostas/salvarAnaliseTecnica/status) é a mesma que a versão offline (Dexie+fila)
// vai expor depois — trocar a implementação aqui não deve exigir mudar nenhuma seção.
export function useAutosaveDiagnostico(diagnosticoId: string) {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const timerRespostas = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerAnalise = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timerRespostas.current) clearTimeout(timerRespostas.current)
    if (timerAnalise.current) clearTimeout(timerAnalise.current)
  }, [])

  const gravar = useCallback(async (coluna: 'respostas' | 'analise_tecnica', valor: Record<string, unknown>) => {
    setStatus('salvando')
    const { error } = await getSupabase()
      .from('diagnosticos')
      .update({ [coluna]: valor })
      .eq('id', diagnosticoId)
    setStatus(error ? 'erro' : 'salvo')
  }, [diagnosticoId])

  const salvarRespostas = useCallback((valor: Record<string, unknown>) => {
    if (timerRespostas.current) clearTimeout(timerRespostas.current)
    setStatus('salvando')
    timerRespostas.current = setTimeout(() => gravar('respostas', valor), 600)
  }, [gravar])

  const salvarAnaliseTecnica = useCallback((valor: Record<string, unknown>) => {
    if (timerAnalise.current) clearTimeout(timerAnalise.current)
    setStatus('salvando')
    timerAnalise.current = setTimeout(() => gravar('analise_tecnica', valor), 600)
  }, [gravar])

  return { status, salvarRespostas, salvarAnaliseTecnica }
}

// Autosave de um empreendimento (Seção 2) — tabela separada, mesmo padrão debounced.
export function useAutosaveEmpreendimento(empreendimentoId: string) {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const salvar = useCallback((campos: Record<string, unknown>) => {
    if (timer.current) clearTimeout(timer.current)
    setStatus('salvando')
    timer.current = setTimeout(async () => {
      const { error } = await getSupabase()
        .from('empreendimentos')
        .update(campos)
        .eq('id', empreendimentoId)
      setStatus(error ? 'erro' : 'salvo')
    }, 600)
  }, [empreendimentoId])

  return { status, salvar }
}
