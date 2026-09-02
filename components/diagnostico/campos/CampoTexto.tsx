'use client'

export function CampoTexto({
  label, value, onChange, multiline = false, placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  placeholder?: string
}) {
  const cls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] bg-white'
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {multiline ? (
        <textarea rows={3} className={cls} value={value ?? ''} placeholder={placeholder}
          onChange={e => onChange(e.target.value)} />
      ) : (
        <input type="text" className={cls} value={value ?? ''} placeholder={placeholder}
          onChange={e => onChange(e.target.value)} />
      )}
    </div>
  )
}
