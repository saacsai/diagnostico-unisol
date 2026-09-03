'use client'

import { usePathname, useSearchParams } from 'next/navigation'
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
  estaduais: <Icon d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" circle={{ cx: 12, cy: 10, r: 3 }} />,
  instituicao: <Icon d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M9 13h1M14 9h1M14 13h1M9 21v-4h6v4" />,
  projetos: <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" d2="M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4" />,
  filiadas: <Icon d="M12 2 2 7l10 5 10-5-10-5z" d2="M2 17l10 5 10-5M2 12l10 5 10-5" />,
  tecnicos: <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" circle={{ cx: 12, cy: 7, r: 4 }} />,
  documento: <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" d2="M14 2v6h6M9 13h6M9 17h6" />,
}

interface NavItem { href: string; label: string; iconKey: keyof typeof ICONS; perfis: Perfil[] }
interface NavSection { label: string; items: NavItem[] }

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'DIAGNÓSTICOS',
    items: [
      { href: '/diagnosticos', label: 'Diagnósticos', iconKey: 'diagnosticos', perfis: ['aplicador', 'tecnico', 'admin'] },
    ],
  },
  {
    label: 'CADASTROS',
    items: [
      { href: '/instituicao', label: 'Nacional', iconKey: 'instituicao', perfis: ['admin'] },
      { href: '/admin/estaduais', label: 'Estaduais', iconKey: 'estaduais', perfis: ['admin'] },
      { href: '/filiadas', label: 'Filiadas', iconKey: 'filiadas', perfis: ['admin'] },
      { href: '/tecnicos', label: 'Técnicos', iconKey: 'tecnicos', perfis: ['admin'] },
    ],
  },
  {
    label: 'PROJETOS',
    items: [
      { href: '/projetos?categoria=emenda', label: 'Emendas', iconKey: 'documento', perfis: ['admin'] },
      { href: '/projetos?categoria=mrosc', label: 'MROSC', iconKey: 'documento', perfis: ['admin'] },
      { href: '/projetos?categoria=outro', label: 'Outros', iconKey: 'documento', perfis: ['admin'] },
    ],
  },
  {
    label: 'ADMINISTRAÇÃO',
    items: [
      { href: '/admin/usuarios', label: 'Usuários', iconKey: 'usuarios', perfis: ['admin'] },
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
  const searchParams = useSearchParams()

  function estaAtivo(href: string) {
    const [path, query] = href.split('?')
    if (pathname !== path) return false
    if (!query) return !searchParams.get('categoria')
    const params = new URLSearchParams(query)
    return searchParams.get('categoria') === params.get('categoria')
  }

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
        style={{ width: SIDEBAR_W, minWidth: SIDEBAR_W, background: '#F5F5F5', borderRight: '1px solid #E5E5E5' }}
        className={`fixed left-0 top-0 h-screen flex flex-col z-30 transition-transform duration-200 ease-in-out
          ${mobileAberto ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="pt-6 pb-5 flex justify-center" style={{ paddingLeft: 30, paddingRight: 30 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_unisol.png" alt="UNISOL Brasil" className="w-full h-auto object-contain" />
        </div>

        <div style={{ borderTop: '1px solid #E5E5E5' }} />

        <nav className="flex-1 px-2 py-3 overflow-y-auto">
          {NAV_SECTIONS.map((section, si) => {
            const itens = section.items.filter(n => n.perfis.includes(perfil))
            if (itens.length === 0) return null
            return (
              <div key={section.label} className={si > 0 ? 'mt-3' : ''}>
                <p className="px-3 mb-1 text-[10px] font-semibold tracking-widest text-gray-400">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {itens.map(item => {
                    const ativo = estaAtivo(item.href)
                    return (
                      <a key={item.href} href={item.href}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
                        style={{
                          background: ativo ? '#E5E5E5' : 'transparent',
                          color: ativo ? 'var(--primary-dark)' : '#4b5563',
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

        <div style={{ borderTop: '1px solid #E5E5E5' }} />
        <div className="px-2 py-2">
          <AvatarMenu nome={nome} email={email} onSair={sair} />
        </div>
      </aside>
    </>
  )
}
