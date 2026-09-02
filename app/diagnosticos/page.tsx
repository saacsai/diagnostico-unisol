'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { DiagnosticoWizardShell } from '@/components/diagnostico/wizard/DiagnosticoWizardShell'
import { ListaDiagnosticos } from '@/components/diagnostico/wizard/ListaDiagnosticos'
import { AppShell } from '@/components/layout/AppShell'

export default function DiagnosticosPage() {
  return (
    <Suspense>
      <DiagnosticosInner />
    </Suspense>
  )
}

function DiagnosticosInner() {
  const params = useSearchParams()
  const id = params.get('id')
  const [autenticado, setAutenticado] = useState<boolean | null>(null)

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`
        return
      }
      setAutenticado(true)
    })
  }, [])

  if (autenticado !== true) return null

  // O wizard em si é uma view imersiva de propósito (tem sua própria navegação
  // lateral entre as 18+2 seções) — não entra dentro do AppShell pra não duplicar sidebar.
  if (id) return <DiagnosticoWizardShell diagnosticoId={id} />

  return (
    <AppShell>
      <ListaDiagnosticos />
    </AppShell>
  )
}
