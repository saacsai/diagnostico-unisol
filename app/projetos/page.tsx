'use client'

import { AppShell } from '@/components/layout/AppShell'
import { AdminGate } from '@/components/layout/AdminGate'
import { ProjetosLista } from '@/components/projetos/ProjetosLista'

export default function ProjetosPage() {
  return (
    <AppShell>
      <AdminGate>
        <ProjetosLista />
      </AdminGate>
    </AppShell>
  )
}
