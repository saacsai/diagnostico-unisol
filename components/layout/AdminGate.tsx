'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Usuario } from '@/lib/supabase'

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null | undefined>(undefined)

  useEffect(() => {
    async function carregar() {
      const sb = getSupabase()
      const { data: sessao } = await sb.auth.getSession()
      if (!sessao.session) { window.location.href = '/login?next=/admin'; return }
      const { data } = await sb.from('usuarios').select('*').eq('id', sessao.session.user.id).single()
      setUsuario((data as Usuario) || null)
    }
    carregar()
  }, [])

  if (usuario === undefined) return null
  if (usuario?.perfil !== 'admin') return <p className="text-sm text-gray-500">Acesso restrito a administradores.</p>
  return <>{children}</>
}
