'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { AdminGate } from '@/components/layout/AdminGate'
import { SoDesktop } from '@/components/layout/SoDesktop'
import { ProjetosLista } from '@/components/projetos/ProjetosLista'
import { CategoriaInstrumento } from '@/lib/supabase'

const CATEGORIAS_VALIDAS: CategoriaInstrumento[] = ['emenda', 'mrosc', 'outro']

function ProjetosConteudo() {
  const params = useSearchParams()
  const categoriaParam = params.get('categoria')
  const categoria = CATEGORIAS_VALIDAS.includes(categoriaParam as CategoriaInstrumento)
    ? (categoriaParam as CategoriaInstrumento)
    : undefined
  return <ProjetosLista categoria={categoria} />
}

export default function ProjetosPage() {
  return (
    <AppShell>
      <AdminGate>
        <SoDesktop>
          <Suspense fallback={null}>
            <ProjetosConteudo />
          </Suspense>
        </SoDesktop>
      </AdminGate>
    </AppShell>
  )
}
