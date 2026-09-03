'use client'

import { AppShell } from '@/components/layout/AppShell'
import { AdminGate } from '@/components/layout/AdminGate'
import { SoDesktop } from '@/components/layout/SoDesktop'
import { FiliadaDetalhe } from '@/components/filiadas/FiliadaDetalhe'

export default function FiliadaDetalhePage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <AdminGate>
        <SoDesktop><FiliadaDetalhe empreendimentoId={params.id} /></SoDesktop>
      </AdminGate>
    </AppShell>
  )
}
