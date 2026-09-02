'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Usuario } from '@/lib/supabase'
import { UsuariosAdmin } from '@/components/admin/UsuariosAdmin'
import { UnisolEstaduaisAdmin } from '@/components/admin/UnisolEstaduaisAdmin'

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

  if (usuario === undefined) return null

  if (usuario?.perfil !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--background)' }}>
        <p className="text-sm text-gray-500">Acesso restrito a administradores.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'var(--background)' }}>
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>Administração</h1>
          <a href="/diagnosticos" className="text-xs text-gray-400 hover:text-gray-600">← Diagnósticos</a>
        </div>
        <UsuariosAdmin />
        <UnisolEstaduaisAdmin />
      </div>
    </div>
  )
}
