'use client'

import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/offline/db'
import { getSupabase, UnisolEstadual } from '@/lib/supabase'

const UMA_HORA = 60 * 60 * 1000

// Cache de referência pra dropdowns que precisam funcionar offline (hoje só UNISOL Estaduais,
// usado na Seção 02). Lê do Dexie na hora (reativo via useLiveQuery) e atualiza em segundo
// plano quando online e o cache está velho/vazio — nunca bloqueia a UI esperando rede.
export function useReferenciaEstaduais(): UnisolEstadual[] {
  const linha = useLiveQuery(() => getDB().referencia.get('unisol_estaduais'), [])

  useEffect(() => {
    async function atualizar() {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return
      const desatualizado = !linha || Date.now() - linha.atualizadoEm > UMA_HORA
      if (!desatualizado) return
      const { data, error } = await getSupabase().from('unisol_estaduais').select('*').eq('ativo', true)
      if (error || !data) return
      await getDB().referencia.put({ tipo: 'unisol_estaduais', dados: data as UnisolEstadual[], atualizadoEm: Date.now() })
    }
    atualizar()
  }, [linha])

  return linha?.dados ?? []
}
