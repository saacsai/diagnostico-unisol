'use client'

import { SECOES } from '@/lib/diagnostico/secoesConfig'

export function SidebarSecoes({
  ativa, onSelecionar, completas, perfilUsuario,
}: {
  ativa: string
  onSelecionar: (id: string) => void
  completas: Record<string, boolean>
  perfilUsuario: string
}) {
  return (
    <nav className="w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200 bg-white md:h-full overflow-y-auto">
      <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible">
        {SECOES.map(s => {
          const bloqueada = s.perfil === 'tecnico' && perfilUsuario === 'aplicador'
          const ativo = ativa === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelecionar(s.id)}
              className="flex items-center gap-2 px-3 py-2.5 text-left text-xs whitespace-nowrap md:whitespace-normal border-b border-gray-50 md:w-full flex-shrink-0"
              style={ativo ? { background: 'var(--primary-light)', color: 'var(--primary-dark)', fontWeight: 600 } : { color: bloqueada ? '#c1c9c3' : '#4b5563' }}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{ background: completas[s.id] ? 'var(--primary)' : '#e5e7eb', color: completas[s.id] ? '#fff' : '#9ca3af' }}>
                {completas[s.id] ? '✓' : s.numero}
              </span>
              <span className="truncate">{s.titulo}{bloqueada ? ' 🔒' : ''}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
