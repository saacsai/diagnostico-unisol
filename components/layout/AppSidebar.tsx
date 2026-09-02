'use client'

import { usePathname } from 'next/navigation'
import { getSupabase, Perfil } from '@/lib/supabase'
import { AvatarMenu } from './AvatarMenu'

const SIDEBAR_W = '224px'

function Icon({ d, d2, circle }: { d: string; d2?: string; circle?: { cx: number; cy: number; r: number } }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
      {d2 && <path d={d2} />}
      {circle && <circle cx={circle.cx} cy={circle.cy} r={circle.r} />}
    </svg>
  )
}

const ICONS = {
  diagnosticos: <Icon d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" d2="M9 12h6M9 16h4M9 3h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />,
  usuarios: <Icon d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" circle={{ cx: 9, cy: 7, r: 4 }} />,
}

interface NavItem { href: string; label: string; iconKey: keyof typeof ICONS; perfis: Perfil[] }
interface NavSection { label: string; items: NavItem[] }

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'DIAGNÓSTICO',
    items: [
      { href: '/diagnosticos', label: 'Diagnósticos', iconKey: 'diagnosticos', perfis: ['aplicador', 'tecnico', 'admin'] },
    ],
  },
  {
    label: 'ADMINISTRAÇÃO',
    items: [
      { href: '/admin', label: 'Usuários e UNISOLs', iconKey: 'usuarios', perfis: ['admin'] },
    ],
  },
]

export function AppSidebar({
  nome, email, perfil, mobileAberto = false, onMobileFechar,
}: {
  nome: string
  email: string
  perfil: Perfil
  mobileAberto?: boolean
  onMobileFechar?: () => void
}) {
  const pathname = usePathname()

  async function sair() {
    await getSupabase().auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      {mobileAberto && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onMobileFechar} />
      )}
      <aside
        style={{ width: SIDEBAR_W, minWidth: SIDEBAR_W, background: 'var(--primary)' }}
        className={`fixed left-0 top-0 h-screen flex flex-col z-30 transition-transform duration-200 ease-in-out
          ${mobileAberto ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="px-4 pt-5 pb-4">
          <p className="text-white font-bold text-sm tracking-tight leading-tight">Diagnóstico<br />UNISOL Brasil</p>
          <p className="mt-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>CooperaMais</p>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />

        <nav className="flex-1 px-2 py-3 overflow-y-auto">
          {NAV_SECTIONS.map((section, si) => {
            const itens = section.items.filter(n => n.perfis.includes(perfil))
            if (itens.length === 0) return null
            return (
              <div key={section.label} className={si > 0 ? 'mt-3' : ''}>
                <p className="px-3 mb-1 text-[10px] font-semibold tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {itens.map(item => {
                    const ativo = pathname === item.href
                    return (
                      <a key={item.href} href={item.href}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
                        style={{
                          background: ativo ? 'rgba(255,255,255,0.15)' : 'transparent',
                          color: ativo ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                          fontWeight: ativo ? 600 : 400,
                        }}>
                        <span className="flex-shrink-0">{ICONS[item.iconKey]}</span>
                        <span className="text-[13px]">{item.label}</span>
                      </a>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
        <div className="px-2 py-2">
          <AvatarMenu nome={nome} email={email} onSair={sair} />
        </div>
      </aside>
    </>
  )
}
