'use client'

import { useEffect, useRef, useState } from 'react'
import { getSupabase, UnisolEstadual } from '@/lib/supabase'
import { AppShell } from '@/components/layout/AppShell'
import { AdminGate } from '@/components/layout/AdminGate'
import { CampoTexto } from '@/components/diagnostico/campos/CampoTexto'
import { CampoSelect } from '@/components/diagnostico/campos/CampoSelect'
import { PerfilEntidadeForm, CamposPerfilEntidade } from '@/components/institucional/PerfilEntidadeForm'
import { DiretoriaAdmin } from '@/components/institucional/DiretoriaAdmin'
import { DocumentosAdmin } from '@/components/institucional/DocumentosAdmin'

export default function EstadualDetalhePage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <AdminGate>
        <EstadualConteudo id={params.id} />
      </AdminGate>
    </AppShell>
  )
}

function EstadualConteudo({ id }: { id: string }) {
  const [dados, setDados] = useState<UnisolEstadual | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [status, setStatus] = useState<'idle' | 'salvando' | 'salvo'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    getSupabase().from('unisol_estaduais').select('*').eq('id', id).single().then(({ data }) => {
      setDados(data as UnisolEstadual)
      setCarregando(false)
    })
  }, [id])

  function set(patch: Partial<UnisolEstadual> | Partial<CamposPerfilEntidade>) {
    if (!dados) return
    const novo = { ...dados, ...patch } as UnisolEstadual
    setDados(novo)
    if (timer.current) clearTimeout(timer.current)
    setStatus('salvando')
    timer.current = setTimeout(async () => {
      await getSupabase().from('unisol_estaduais').update(patch).eq('id', id)
      setStatus('salvo')
    }, 600)
  }

  if (carregando) return <p className="text-sm text-gray-400">Carregando…</p>
  if (!dados) return <p className="text-sm text-red-500">Estadual não encontrada.</p>

  return (
    <div className="max-w-2xl mx-auto lg:mx-0 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <a href="/admin/estaduais" className="text-xs text-gray-400 hover:text-gray-600">← Estaduais</a>
          <h1 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{dados.nome}</h1>
        </div>
        {status !== 'idle' && (
          <span className="text-xs font-medium" style={{ color: status === 'salvando' ? '#9ca3af' : 'var(--primary)' }}>
            {status === 'salvando' ? 'Salvando…' : 'Salvo'}
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <CampoTexto label="Nome" value={dados.nome ?? ''} onChange={v => set({ nome: v })} />
          <CampoSelect label="Status" value={dados.status} onChange={v => set({ status: v as UnisolEstadual['status'] })}
            opcoes={[{ value: 'formalizada', label: 'Formalizada' }, { value: 'em_constituicao', label: 'Em constituição' }]} />
        </div>
        <PerfilEntidadeForm dados={dados} onChange={set} />
      </div>

      <DiretoriaAdmin entidadeTipo="unisol_estadual" entidadeId={dados.id} />
      <DocumentosAdmin entidadeTipo="unisol_estadual" entidadeId={dados.id} />
    </div>
  )
}
