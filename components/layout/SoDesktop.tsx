'use client'

import { useEffect, useState } from 'react'

const BREAKPOINT = 1024 // mesmo breakpoint `lg` usado no resto do app

// Telas de cadastro/admin são desenhadas só pra desktop, de propósito — o único fluxo pensado
// pra funcionar em campo/celular é o wizard de diagnóstico. Bloqueia de verdade, não só avisa.
export function SoDesktop({ children }: { children: React.ReactNode }) {
  const [largura, setLargura] = useState<number | null>(null)

  useEffect(() => {
    function medir() { setLargura(window.innerWidth) }
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [])

  if (largura === null) return null

  if (largura < BREAKPOINT) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-6">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--primary-light)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-800">Esta função é só no desktop</p>
        <p className="text-xs text-gray-400 mt-1 max-w-xs">
          Cadastros e telas administrativas são pensados pra tela grande. No celular, use o
          wizard de Diagnóstico normalmente — o resto abre num computador.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
