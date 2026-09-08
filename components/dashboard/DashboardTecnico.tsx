'use client'

import { useEffect, useState } from 'react'
import { carregarTotaisTecnico, TotaisTecnico } from '@/lib/dashboard/tecnicoQueries'

export function DashboardTecnico({
  usuarioId, tecnicoId, onCarregado,
}: {
  usuarioId: string
  tecnicoId: string | null
  onCarregado?: (t: TotaisTecnico) => void
}) {
  const [totais, setTotais] = useState<TotaisTecnico | null>(null)

  useEffect(() => {
    carregarTotaisTecnico(usuarioId, tecnicoId).then(t => { setTotais(t); onCarregado?.(t) })
  }, [usuarioId, tecnicoId]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h1 className="text-base font-bold text-gray-900 mb-3">Meus diagnósticos</h1>

      {totais?.semVinculo && (
        <p className="text-xs rounded-lg p-2 mb-3 bg-amber-50 text-amber-700 border border-amber-200">
          Peça a um administrador pra vincular seu usuário a um cadastro de Técnico (em Administração
          → Usuários) — sem isso, esses números não incluem as Filiadas atribuídas a você, só o que
          você já mexeu diretamente.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <a href="/diagnosticos" className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{totais?.concluidos ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-0.5">Concluídos</p>
        </a>
        <a href="/diagnosticos" className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{totais?.emAberto ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-0.5">Em aberto</p>
        </a>
      </div>
    </div>
  )
}
