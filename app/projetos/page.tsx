'use client'

import { AppShell } from '@/components/layout/AppShell'
import { AdminGate } from '@/components/layout/AdminGate'
import { SoDesktop } from '@/components/layout/SoDesktop'
import { ProjetosLista } from '@/components/projetos/ProjetosLista'

export default function ProjetosPage() {
  return (
    <AppShell>
      <AdminGate>
        <SoDesktop><ProjetosLista /></SoDesktop>
      </AdminGate>
    </AppShell>
  )
}
