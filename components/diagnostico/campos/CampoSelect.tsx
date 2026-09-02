'use client'

export function CampoSelect({
  label, value, onChange, opcoes,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  opcoes: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] bg-white"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">Selecione…</option>
        {opcoes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
