'use client'

import { Suspense, useEffect, useState } from 'react'
import { getSupabase, Usuario } from '@/lib/supabase'
import { AppSidebar } from './AppSidebar'

const SIDEBAR_W = '224px'

export function AppShell({ children, fullBleed = false }: { children: React.ReactNode; fullBleed?: boolean }) {
  const [usuario, setUsuario] = useState<Usuario | null | undefined>(undefined)
  const [menuMobile, setMenuMobile] = useState(false)

  useEffect(() => {
    async function carregar() {
      const sb = getSupabase()
      const { data: sessao } = await sb.auth.getSession()
      if (!sessao.session) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`
        return
      }
      const { data } = await sb.from('usuarios').select('*').eq('id', sessao.session.user.id).single()
      setUsuario((data as Usuario) || null)
    }
    carregar()
  }, [])

  if (usuario === undefined) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }} />
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 h-14 flex items-center px-4 gap-3" style={{ background: '#F5F5F5', borderBottom: '1px solid #E5E5E5' }}>
        <button onClick={() => setMenuMobile(true)} className="flex flex-col gap-1.5 p-1" aria-label="Abrir menu">
          <span className="block w-5 h-0.5 rounded" style={{ background: '#4b5563' }} />
          <span className="block w-5 h-0.5 rounded" style={{ background: '#4b5563' }} />
          <span className="block w-5 h-0.5 rounded" style={{ background: '#4b5563' }} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo_unisol.png" alt="UNISOL Brasil" style={{ height: 28 }} className="w-auto object-contain" />
      </div>

      <Suspense fallback={null}>
        <AppSidebar
          nome={usuario?.nome ?? ''}
          email={usuario?.email ?? ''}
          perfil={usuario?.perfil ?? 'aplicador'}
          mobileAberto={menuMobile}
          onMobileFechar={() => setMenuMobile(false)}
        />
      </Suspense>

      <main
        className={fullBleed ? 'pt-14 lg:pt-0 lg:ml-[224px]' : 'p-4 lg:p-8 pt-[72px] lg:pt-8 lg:ml-[224px]'}
        style={{ minHeight: '100vh' }}
      >
        {children}
      </main>
    </div>
  )
}
