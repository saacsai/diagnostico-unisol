'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { DiagnosticoWizardShell } from '@/components/diagnostico/wizard/DiagnosticoWizardShell'
import { ListaDiagnosticos } from '@/components/diagnostico/wizard/ListaDiagnosticos'

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
  return id ? <DiagnosticoWizardShell diagnosticoId={id} /> : <ListaDiagnosticos />
}
