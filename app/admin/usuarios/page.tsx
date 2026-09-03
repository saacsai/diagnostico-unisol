'use client'

import { AppShell } from '@/components/layout/AppShell'
import { AdminGate } from '@/components/layout/AdminGate'
import { SoDesktop } from '@/components/layout/SoDesktop'
import { UsuariosAdmin } from '@/components/admin/UsuariosAdmin'

export default function UsuariosPage() {
  return (
    <AppShell>
      <AdminGate>
        <SoDesktop><UsuariosAdmin /></SoDesktop>
      </AdminGate>
    </AppShell>
  )
}
