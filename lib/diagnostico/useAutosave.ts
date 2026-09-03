'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getDB } from '@/lib/offline/db'

export type SyncStatus = 'idle' | 'salvando' | 'salvo' | 'erro'

// Camada OFFLINE do autosave — grava no Dexie (IndexedDB), local e instantâneo, sem chamada de
// rede nenhuma aqui. Quem manda os dados pro Supabase é o motor de sync (lib/offline/sync.ts),
// em segundo plano, lendo os registros marcados _dirty*. A interface pública (nomes/retorno das
// duas funções abaixo) é a mesma de antes — trocar a implementação não exigiu mudar nenhuma
// seção do wizard.
//
// Pré-condição: o registro já precisa existir no Dexie antes do primeiro autosave (o wizard
// shell garante isso — grava um `put` completo assim que carrega o diagnóstico, seja do cache
// local ou de uma busca fresca no Supabase). Sem isso, um `update` num id inexistente vira nop.

export function useAutosaveDiagnostico(diagnosticoId: string) {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const timerRespostas = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerAnalise = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timerRespostas.current) clearTimeout(timerRespostas.current)
    if (timerAnalise.current) clearTimeout(timerAnalise.current)
  }, [])

  const gravar = useCallback(async (coluna: 'respostas' | 'analise_tecnica', valor: Record<string, unknown>) => {
    const patch = coluna === 'respostas'
      ? { respostas: valor, _dirtyRespostas: 1 as const, _localUpdatedAt: Date.now() }
      : { analise_tecnica: valor, _dirtyAnaliseTecnica: 1 as const, _localUpdatedAt: Date.now() }
    const atualizado = await getDB().diagnosticos.update(diagnosticoId, patch)
    setStatus(atualizado ? 'salvo' : 'erro')
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

export function useAutosaveEmpreendimento(empreendimentoId: string) {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const salvar = useCallback((campos: Record<string, unknown>) => {
    if (timer.current) clearTimeout(timer.current)
    setStatus('salvando')
    timer.current = setTimeout(async () => {
      const atualizado = await getDB().empreendimentos.update(empreendimentoId, {
        ...campos, _dirty: 1 as const, _localUpdatedAt: Date.now(),
      })
      setStatus(atualizado ? 'salvo' : 'erro')
    }, 600)
  }, [empreendimentoId])

  return { status, salvar }
}
