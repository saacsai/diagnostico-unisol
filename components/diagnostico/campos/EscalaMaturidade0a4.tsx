'use client'

import { Escala0a4 } from '@/lib/diagnostico/schema'

const NIVEIS: { valor: Escala0a4; label: string }[] = [
  { valor: 0, label: 'Inexistente' },
  { valor: 1, label: 'Inicial' },
  { valor: 2, label: 'Parcial' },
  { valor: 3, label: 'Estruturado' },
  { valor: 4, label: 'Consolidado' },
  { valor: null, label: 'N/A' },
]

export function EscalaMaturidade0a4({
  label, valor, onChange, comEvidencia = false, evidencia = '', onEvidenciaChange,
}: {
  label: string
  valor: Escala0a4
  onChange: (v: Escala0a4) => void
  comEvidencia?: boolean
  evidencia?: string
  onEvidenciaChange?: (v: string) => void
}) {
  return (
    <div className="py-2">
      <p className="text-xs font-medium text-gray-600 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {NIVEIS.map(n => {
          const ativo = valor === n.valor
          return (
            <button
              key={String(n.valor)}
              type="button"
              onClick={() => onChange(n.valor)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors"
              style={ativo
                ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }
                : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }}
            >
              {n.valor !== null ? `${n.valor} — ${n.label}` : n.label}
            </button>
          )
        })}
      </div>
      {comEvidencia && (
        <input
          type="text"
          placeholder="Evidência principal…"
          className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[var(--primary)]"
          value={evidencia}
          onChange={e => onEvidenciaChange?.(e.target.value)}
        />
      )}
    </div>
  )
}
