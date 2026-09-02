'use client'

export function CampoNumero({
  label, value, onChange, sufixo,
}: {
  label: string
  value: number | null
  onChange: (v: number | null) => void
  sufixo?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] bg-white"
          value={value ?? ''}
          onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
        {sufixo && <span className="text-xs text-gray-400 flex-shrink-0">{sufixo}</span>}
      </div>
    </div>
  )
}
