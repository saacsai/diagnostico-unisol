'use client'

import { AppShell } from '@/components/layout/AppShell'
import { AdminGate } from '@/components/layout/AdminGate'
import { SoDesktop } from '@/components/layout/SoDesktop'
import { FiliadasLista } from '@/components/filiadas/FiliadasLista'

export default function FiliadasPage() {
  return (
    <AppShell>
      <AdminGate>
        <SoDesktop><FiliadasLista /></SoDesktop>
      </AdminGate>
    </AppShell>
  )
}
