'use client'

import { useEffect, useRef, useState } from 'react'

function IconLogout() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function IconChevron({ up }: { up: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {up ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
    </svg>
  )
}

function iniciais(nome: string) {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('')
}

export function AvatarMenu({ nome, email, onSair }: { nome: string; email: string; onSair: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function fora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [])

  return (
    <div ref={ref} className="relative">
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 mx-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
          <div className="px-3 py-2.5">
            <div className="text-sm font-semibold text-gray-900 truncate">{nome}</div>
            <div className="text-xs text-gray-500 truncate">{email}</div>
          </div>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => { setOpen(false); onSair() }}
            className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2.5"
          >
            <span className="text-red-400"><IconLogout /></span>
            Sair
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left"
        style={{ background: open ? '#E5E5E5' : 'transparent' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#E5E5E5')}
        onMouseLeave={e => (e.currentTarget.style.background = open ? '#E5E5E5' : 'transparent')}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
          style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
          {iniciais(nome || email)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate text-gray-800">{nome || email}</div>
          <div className="text-xs truncate text-gray-500">{email}</div>
        </div>
        <span className="text-gray-400"><IconChevron up={open} /></span>
      </button>
    </div>
  )
}
