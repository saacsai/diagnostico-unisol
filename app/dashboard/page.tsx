'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

export default function DashboardPage() {
  const [email, setEmail] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = '/login'
        return
      }
      setEmail(data.session.user.email ?? null)
    })
  }, [])

  async function sair() {
    await getSupabase().auth.signOut()
    window.location.href = '/login'
  }

  if (email === undefined) return null

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--background)' }}>
      <div className="max-w-md mx-auto space-y-4">
        <div className="rounded-xl bg-white shadow-sm p-5 space-y-2">
          <p className="text-sm text-gray-500">Logado como</p>
          <p className="font-semibold" style={{ color: 'var(--primary)' }}>{email}</p>
        </div>
        <div className="rounded-xl bg-white shadow-sm p-5">
          <p className="text-sm text-gray-600">
            O wizard do diagnóstico entra aqui na Fase 2 (offline com Dexie + sync). Por
            enquanto, esta tela confirma que login e sessão estão funcionando ponta a ponta.
          </p>
        </div>
        <button
          onClick={sair}
          className="text-sm font-medium rounded-lg px-4 py-2 border"
          style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
        >
          Sair
        </button>
      </div>
    </div>
  )
}
