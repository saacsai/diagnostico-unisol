'use client'

import { AppShell } from '@/components/layout/AppShell'
import { AdminGate } from '@/components/layout/AdminGate'
import { SoDesktop } from '@/components/layout/SoDesktop'
import { EstaduaisAdmin } from '@/components/admin/EstaduaisAdmin'

export default function EstaduaisPage() {
  return (
    <AppShell>
      <AdminGate>
        <SoDesktop><EstaduaisAdmin /></SoDesktop>
      </AdminGate>
    </AppShell>
  )
}
