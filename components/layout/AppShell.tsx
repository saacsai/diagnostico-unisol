'use client'

import { Suspense, useEffect, useState } from 'react'
import { getSupabase, Usuario } from '@/lib/supabase'
import { getDB } from '@/lib/offline/db'
import { iniciarSyncEngine } from '@/lib/offline/sync'
import { AppSidebar } from './AppSidebar'
import { SyncStatusBadge } from './SyncStatusBadge'

function usuarioDoCache(cache: { usuarioId: string; nome: string; perfil: Usuario['perfil'] }): Usuario {
  return {
    id: cache.usuarioId, nome: cache.nome, perfil: cache.perfil,
    email: '', instituicao: null, unisol_estadual_id: null, ativo: true, created_at: '',
  }
}

const SIDEBAR_W = '224px'

export function AppShell({ children, fullBleed = false }: { children: React.ReactNode; fullBleed?: boolean }) {
  const [usuario, setUsuario] = useState<Usuario | null | undefined>(undefined)
  const [menuMobile, setMenuMobile] = useState(false)

  useEffect(() => {
    iniciarSyncEngine()
    async function carregar() {
      const sb = getSupabase()
      const cache = await getDB().sessaoUsuario.get('atual').catch(() => undefined)

      let session = null
      try {
        const { data: sessaoData } = await sb.auth.getSession()
        session = sessaoData.session
      } catch {
        session = null
      }

      if (!session) {
        // getSession() pode falhar tentando renovar um token expirado sem sinal. Se já
        // conhecemos alguém logado neste aparelho, não expulsa no meio do trabalho — só manda
        // pro login de verdade quando não há nenhum vestígio de sessão local.
        if (cache) { setUsuario(usuarioDoCache(cache)); return }
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`
        return
      }

      try {
        const { data, error } = await sb.from('usuarios').select('*').eq('id', session.user.id).single()
        if (error) throw error
        if (data && !data.ativo) {
          await sb.auth.signOut()
          window.location.href = '/login?inativo=1'
          return
        }
        if (data) await getDB().sessaoUsuario.put({ id: 'atual', usuarioId: data.id, nome: data.nome, perfil: data.perfil })
        setUsuario((data as Usuario) || null)
      } catch {
        // Leitura de usuarios falhou (offline) — cai pro cache local em vez de travar num
        // perfil fixo, o que tiraria acesso às Seções 17-18 de um técnico de verdade.
        setUsuario(cache ? usuarioDoCache(cache) : null)
      }
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
        <div className="ml-auto"><SyncStatusBadge /></div>
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
