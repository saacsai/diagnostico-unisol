'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Usuario } from '@/lib/supabase'
import { AppSidebar } from './AppSidebar'

const SIDEBAR_W = '224px'

export function AppShell({ children }: { children: React.ReactNode }) {
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 h-14 flex items-center px-4 gap-3" style={{ background: 'var(--primary)' }}>
        <button onClick={() => setMenuMobile(true)} className="flex flex-col gap-1.5 p-1" aria-label="Abrir menu">
          <span className="block w-5 h-0.5 bg-white/80 rounded" />
          <span className="block w-5 h-0.5 bg-white/80 rounded" />
          <span className="block w-5 h-0.5 bg-white/80 rounded" />
        </button>
        <span className="text-white font-bold text-sm tracking-wide">Diagnóstico UNISOL</span>
      </div>

      <AppSidebar
        nome={usuario?.nome ?? ''}
        email={usuario?.email ?? ''}
        perfil={usuario?.perfil ?? 'aplicador'}
        mobileAberto={menuMobile}
        onMobileFechar={() => setMenuMobile(false)}
      />

      <main className="p-4 lg:p-8 pt-[72px] lg:pt-8 lg:ml-[224px]" style={{ minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
