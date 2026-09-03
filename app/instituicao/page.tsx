'use client'

import { useEffect, useRef, useState } from 'react'
import { getSupabase, UnisolBrasil } from '@/lib/supabase'
import { AppShell } from '@/components/layout/AppShell'
import { AdminGate } from '@/components/layout/AdminGate'
import { CampoTexto } from '@/components/diagnostico/campos/CampoTexto'
import { PerfilEntidadeForm } from '@/components/institucional/PerfilEntidadeForm'
import { DiretoriaAdmin } from '@/components/institucional/DiretoriaAdmin'
import { DocumentosAdmin } from '@/components/institucional/DocumentosAdmin'

export default function InstituicaoPage() {
  return (
    <AppShell>
      <AdminGate>
        <InstituicaoConteudo />
      </AdminGate>
    </AppShell>
  )
}

function InstituicaoConteudo() {
  const [dados, setDados] = useState<UnisolBrasil | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [status, setStatus] = useState<'idle' | 'salvando' | 'salvo'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    getSupabase().from('unisol_brasil').select('*').limit(1).single().then(({ data }) => {
      setDados(data as UnisolBrasil)
      setCarregando(false)
    })
  }, [])

  function set(patch: Partial<UnisolBrasil>) {
    if (!dados) return
    const novo = { ...dados, ...patch }
    setDados(novo)
    if (timer.current) clearTimeout(timer.current)
    setStatus('salvando')
    timer.current = setTimeout(async () => {
      await getSupabase().from('unisol_brasil').update(patch).eq('id', novo.id)
      setStatus('salvo')
    }, 600)
  }

  if (carregando) return <p className="text-sm text-gray-400">Carregando…</p>
  if (!dados) return <p className="text-sm text-red-500">UNISOL Brasil não encontrada — rode a migration/seed institucional.</p>

  return (
    <div className="max-w-2xl mx-auto lg:mx-0 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>Instituição — UNISOL Brasil</h1>
        {status !== 'idle' && (
          <span className="text-xs font-medium" style={{ color: status === 'salvando' ? '#9ca3af' : 'var(--primary)' }}>
            {status === 'salvando' ? 'Salvando…' : 'Salvo'}
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <CampoTexto label="Nome" value={dados.nome ?? ''} onChange={v => set({ nome: v })} />
        <PerfilEntidadeForm dados={dados} onChange={set} />
      </div>

      <DiretoriaAdmin entidadeTipo="unisol_brasil" entidadeId={dados.id} />
      <DocumentosAdmin entidadeTipo="unisol_brasil" entidadeId={dados.id} />
    </div>
  )
}
