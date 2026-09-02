'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Usuario } from '@/lib/supabase'
import { UsuariosAdmin } from '@/components/admin/UsuariosAdmin'
import { UnisolEstaduaisAdmin } from '@/components/admin/UnisolEstaduaisAdmin'
import { AppShell } from '@/components/layout/AppShell'

export default function AdminPage() {
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

  return (
    <AppShell>
      {usuario === undefined ? null : usuario?.perfil !== 'admin' ? (
        <p className="text-sm text-gray-500">Acesso restrito a administradores.</p>
      ) : (
        <div className="max-w-lg mx-auto lg:mx-0 space-y-4">
          <h1 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>Administração</h1>
          <UsuariosAdmin />
          <UnisolEstaduaisAdmin />
        </div>
      )}
    </AppShell>
  )
}
