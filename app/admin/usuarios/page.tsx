'use client'

import { AppShell } from '@/components/layout/AppShell'
import { AdminGate } from '@/components/layout/AdminGate'
import { UsuariosAdmin } from '@/components/admin/UsuariosAdmin'

export default function UsuariosPage() {
  return (
    <AppShell>
      <AdminGate>
        <UsuariosAdmin />
      </AdminGate>
    </AppShell>
  )
}
