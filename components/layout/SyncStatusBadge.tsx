'use client'

import { useState } from 'react'
import { useSyncStatus } from '@/lib/offline/useSyncStatus'

export function SyncStatusBadge() {
  const { estado, pendentes, comErro, errosDetalhe } = useSyncStatus()
  const [aberto, setAberto] = useState(false)

  if (estado === 'tudo-sincronizado' && comErro === 0) return null

  const config = {
    offline: { texto: pendentes > 0 ? `Offline — ${pendentes} alteração(ões) pendente(s)` : 'Offline', cor: '#b45309', bg: '#fef3c7' },
    sincronizando: { texto: `Sincronizando… (${pendentes})`, cor: '#1d4ed8', bg: '#dbeafe' },
    'tudo-sincronizado': { texto: 'Tudo sincronizado', cor: '#15803d', bg: '#dcfce7' },
  }[estado]

  return (
    <div className="relative flex items-center gap-2 flex-wrap">
      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: config.bg, color: config.cor }}>
        {config.texto}
      </span>
      {comErro > 0 && (
        <button
          onClick={() => setAberto(a => !a)}
          className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
        >
          {comErro} com erro de envio {aberto ? '▲' : '▼'}
        </button>
      )}
      {aberto && comErro > 0 && (
        <div className="absolute top-full right-0 mt-1 z-50 w-80 max-w-[90vw] bg-white border border-red-200 rounded-lg shadow-lg p-3 space-y-2">
          {errosDetalhe.map(e => (
            <div key={e.id} className="text-xs">
              <p className="font-semibold text-gray-700">{e.tipo}</p>
              <p className="text-red-600 break-words">{e.mensagem}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
