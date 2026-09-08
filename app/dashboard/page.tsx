'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Usuario } from '@/lib/supabase'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import { DashboardAdmin } from '@/components/dashboard/DashboardAdmin'
import { DashboardTecnico } from '@/components/dashboard/DashboardTecnico'

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [numeroDestaque, setNumeroDestaque] = useState<number | null>(null)

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data }) => {
      const userId = data.session?.user.id
      if (!userId) return
      getSupabase().from('usuarios').select('*').eq('id', userId).single().then(({ data }) => {
        setUsuario((data as Usuario) || null)
      })
    })
  }, [])

  const ehTecnico = usuario?.perfil === 'tecnico'

  return (
    <AppShell fullBleed>
      <DashboardHero
        nome={usuario?.nome ?? ''}
        numeroDestaque={numeroDestaque}
        labelDestaque={ehTecnico ? 'diagnósticos em aberto sob sua responsabilidade' : 'diagnósticos em aberto no sistema'}
      />
      <div className="relative -mt-6 bg-white rounded-t-3xl px-4 pt-6 pb-24 lg:mx-8 lg:-mt-8 lg:rounded-3xl lg:shadow-sm lg:mb-8 lg:pb-8">
        {!usuario ? (
          <p className="text-sm text-gray-400">Carregando…</p>
        ) : ehTecnico ? (
          <DashboardTecnico usuarioId={usuario.id} tecnicoId={usuario.tecnico_id} onCarregado={t => setNumeroDestaque(t.emAberto)} />
        ) : (
          <DashboardAdmin onCarregado={t => setNumeroDestaque(t.diagnosticosEmAberto)} />
        )}
      </div>
    </AppShell>
  )
}
