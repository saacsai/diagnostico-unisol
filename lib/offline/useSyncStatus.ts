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
  const errosDetalhe = useLiveQuery(async () => {
    const [diags, emps] = await Promise.all([
      getDB().diagnosticos.filter(d => !!d._erro).toArray(),
      getDB().empreendimentos.filter(e => !!e._erro).toArray(),
    ])
    return [
      ...diags.map(d => ({ tipo: 'Diagnóstico' as const, id: d.id, mensagem: d._erro! })),
      ...emps.map(e => ({ tipo: 'Filiada' as const, id: e.id, mensagem: e._erro! })),
    ]
  })

  const comErro = errosDetalhe?.length ?? 0
  const pendentes = (pendentesDiag ?? 0) + (pendentesEmp ?? 0)
  const estado: EstadoSync = !online ? 'offline' : pendentes > 0 ? 'sincronizando' : 'tudo-sincronizado'

  return { estado, online, pendentes, comErro, errosDetalhe: errosDetalhe ?? [] }
}
