'use client'

import { usePathname } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'

// Altura fixa da barra, em px — usada aqui e no cálculo de altura do wizard
// (DiagnosticoWizardShell) pra reservar espaço e não cobrir conteúdo com a barra fixa.
export const ALTURA_TAB_BAR = 56

export function MobileTabBar() {
  const pathname = usePathname()
  const ativo = pathname?.startsWith('/diagnosticos')

  async function sair() {
    await getSupabase().auth.signOut()
    window.location.href = '/login'
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex"
      style={{ background: '#F5F5F5', borderTop: '1px solid #E5E5E5', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <a href="/diagnosticos" className="flex-1 flex flex-col items-center justify-center gap-0.5" style={{ height: ALTURA_TAB_BAR }}>
        <IconeDiagnosticos ativo={!!ativo} />
        <span className="text-[10px] font-medium" style={{ color: ativo ? 'var(--primary-dark)' : '#6b7280' }}>Diagnósticos</span>
      </a>
      <button onClick={sair} type="button" className="flex-1 flex flex-col items-center justify-center gap-0.5" style={{ height: ALTURA_TAB_BAR }}>
        <IconeSair />
        <span className="text-[10px] font-medium text-gray-500">Sair</span>
      </button>
    </nav>
  )
}

function IconeDiagnosticos({ ativo }: { ativo: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ativo ? 'var(--primary-dark)' : '#6b7280'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <path d="M9 12h6M9 16h4M9 3h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    </svg>
  )
}

function IconeSair() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
