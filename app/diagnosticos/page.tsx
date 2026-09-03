'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DiagnosticoWizardShell } from '@/components/diagnostico/wizard/DiagnosticoWizardShell'
import { ListaDiagnosticos } from '@/components/diagnostico/wizard/ListaDiagnosticos'
import { AppShell } from '@/components/layout/AppShell'

// O gate de autenticação é só o do AppShell (com fallback offline-safe via cache local) — um
// segundo getSession() aqui, sem esse fallback, redirecionaria pro /login sempre que a rede
// falhasse antes do AppShell sequer montar, travando o técnico fora do próprio diagnóstico.
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

  return (
    <AppShell fullBleed={!!id}>
      {id ? <DiagnosticoWizardShell diagnosticoId={id} /> : <ListaDiagnosticos />}
    </AppShell>
  )
}
