'use client'

import { useSyncStatus } from '@/lib/offline/useSyncStatus'

export function SyncStatusBadge() {
  const { estado, pendentes, comErro } = useSyncStatus()

  if (estado === 'tudo-sincronizado' && comErro === 0) return null

  const config = {
    offline: { texto: pendentes > 0 ? `Offline — ${pendentes} alteração(ões) pendente(s)` : 'Offline', cor: '#b45309', bg: '#fef3c7' },
    sincronizando: { texto: `Sincronizando… (${pendentes})`, cor: '#1d4ed8', bg: '#dbeafe' },
    'tudo-sincronizado': { texto: 'Tudo sincronizado', cor: '#15803d', bg: '#dcfce7' },
  }[estado]

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: config.bg, color: config.cor }}>
        {config.texto}
      </span>
      {comErro > 0 && (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
          {comErro} com erro de envio
        </span>
      )}
    </div>
  )
}
