'use client'

import { AppShell } from '@/components/layout/AppShell'
import { AdminGate } from '@/components/layout/AdminGate'
import { SoDesktop } from '@/components/layout/SoDesktop'
import { TecnicosLista } from '@/components/tecnicos/TecnicosLista'

export default function TecnicosPage() {
  return (
    <AppShell>
      <AdminGate>
        <SoDesktop><TecnicosLista /></SoDesktop>
      </AdminGate>
    </AppShell>
  )
}
