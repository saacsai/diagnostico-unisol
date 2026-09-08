'use client'

export function DashboardHero({
  nome, numeroDestaque, labelDestaque,
}: {
  nome: string
  numeroDestaque: number | null
  labelDestaque: string
}) {
  const primeiroNome = nome.split(' ')[0] || nome

  return (
    <div className="pt-14 lg:pt-8 lg:ml-[224px] px-4 lg:px-8 pb-10" style={{ background: 'var(--primary-dark)' }}>
      <div className="flex items-center justify-between pt-2">
        <p className="text-white text-lg font-bold">Olá, {primeiroNome || 'tudo bem'}.</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="UNISOL Brasil" className="w-9 h-9 rounded-full object-cover" />
      </div>

      <a href="/diagnosticos" className="block mt-5 rounded-2xl p-4" style={{ background: 'var(--primary)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-3xl font-bold">{numeroDestaque === null ? '—' : numeroDestaque}</p>
            <p className="text-white text-sm opacity-90 mt-0.5">{labelDestaque}</p>
          </div>
          <span className="text-white text-xs font-medium whitespace-nowrap">Ver diagnósticos →</span>
        </div>
      </a>
    </div>
  )
}
