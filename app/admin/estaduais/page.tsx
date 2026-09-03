'use client'

import { AppShell } from '@/components/layout/AppShell'
import { AdminGate } from '@/components/layout/AdminGate'
import { EstaduaisAdmin } from '@/components/admin/EstaduaisAdmin'

export default function EstaduaisPage() {
  return (
    <AppShell>
      <AdminGate>
        <EstaduaisAdmin />
      </AdminGate>
    </AppShell>
  )
}
