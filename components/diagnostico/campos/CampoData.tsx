'use client'

export function CampoData({
  label, value, onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="date"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] bg-white"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}
