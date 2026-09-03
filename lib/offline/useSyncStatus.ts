'use client'

import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from './db'

export type EstadoSync = 'offline' | 'sincronizando' | 'tudo-sincronizado'

// Substitui os 3 indicadores de status desencontrados que existiam antes (SyncBadge do shell,
// status inline da Seção 02, status inline do Anexo A) por uma fonte única de verdade — quantas
// alterações ainda não chegaram no Supabase, reativo via useLiveQuery (atualiza sozinho quando
// o motor de sync limpa uma dirty-flag em segundo plano).
export function useSyncStatus() {
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine)

  useEffect(() => {
    function marcarOnline() { setOnline(true) }
    function marcarOffline() { setOnline(false) }
    window.addEventListener('online', marcarOnline)
    window.addEventListener('offline', marcarOffline)
    return () => {
      window.removeEventListener('online', marcarOnline)
      window.removeEventListener('offline', marcarOffline)
    }
  }, [])

  const pendentesDiag = useLiveQuery(
    () => getDB().diagnosticos.filter(d => !!d._dirtyRespostas || !!d._dirtyAnaliseTecnica || d._op === 'insert').count(),
  )
  const pendentesEmp = useLiveQuery(
    () => getDB().empreendimentos.filter(e => !!e._dirty || e._op === 'insert').count(),
  )
  const comErro = useLiveQuery(async () => {
    const [a, b] = await Promise.all([
      getDB().diagnosticos.filter(d => !!d._erro).count(),
      getDB().empreendimentos.filter(e => !!e._erro).count(),
    ])
    return a + b
  })

  const pendentes = (pendentesDiag ?? 0) + (pendentesEmp ?? 0)
  const estado: EstadoSync = !online ? 'offline' : pendentes > 0 ? 'sincronizando' : 'tudo-sincronizado'

  return { estado, online, pendentes, comErro: comErro ?? 0 }
}
