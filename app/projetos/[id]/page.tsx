'use client'

import { useEffect, useRef, useState } from 'react'
import { getSupabase, Projeto, StatusProjeto } from '@/lib/supabase'
import { AppShell } from '@/components/layout/AppShell'
import { AdminGate } from '@/components/layout/AdminGate'
import { CampoTexto } from '@/components/diagnostico/campos/CampoTexto'
import { CampoSelect } from '@/components/diagnostico/campos/CampoSelect'
import { CampoData } from '@/components/diagnostico/campos/CampoData'
import { DocumentosAdmin } from '@/components/institucional/DocumentosAdmin'
import { FiliadosVinculados } from '@/components/projetos/FiliadosVinculados'

export default function ProjetoDetalhePage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <AdminGate>
        <ProjetoConteudo id={params.id} />
      </AdminGate>
    </AppShell>
  )
}

function ProjetoConteudo({ id }: { id: string }) {
  const [dados, setDados] = useState<Projeto | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [status, setStatus] = useState<'idle' | 'salvando' | 'salvo'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    getSupabase().from('projetos').select('*').eq('id', id).single().then(({ data }) => {
      setDados(data as Projeto)
      setCarregando(false)
    })
  }, [id])

  function set(patch: Partial<Projeto>) {
    if (!dados) return
    const novo = { ...dados, ...patch }
    setDados(novo)
    if (timer.current) clearTimeout(timer.current)
    setStatus('salvando')
    timer.current = setTimeout(async () => {
      await getSupabase().from('projetos').update(patch).eq('id', id)
      setStatus('salvo')
    }, 600)
  }

  if (carregando) return <p className="text-sm text-gray-400">Carregando…</p>
  if (!dados) return <p className="text-sm text-red-500">Projeto não encontrado.</p>

  return (
    <div className="max-w-2xl mx-auto lg:mx-0 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <a href="/projetos" className="text-xs text-gray-400 hover:text-gray-600">← Projetos</a>
          <h1 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{dados.nome}</h1>
        </div>
        {status !== 'idle' && (
          <span className="text-xs font-medium" style={{ color: status === 'salvando' ? '#9ca3af' : 'var(--primary)' }}>
            {status === 'salvando' ? 'Salvando…' : 'Salvo'}
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <CampoTexto label="Nome" value={dados.nome ?? ''} onChange={v => set({ nome: v })} />
        <CampoTexto label="Resumo" multiline value={dados.resumo ?? ''} onChange={v => set({ resumo: v })} />
        <div className="grid grid-cols-2 gap-3">
          <CampoTexto label="Financiador" value={dados.financiador ?? ''} onChange={v => set({ financiador: v })} />
          <CampoTexto label="Órgão responsável" value={dados.orgao_responsavel ?? ''} onChange={v => set({ orgao_responsavel: v })} />
          <CampoTexto label="Tipo de instrumento" value={dados.tipo_instrumento ?? ''} onChange={v => set({ tipo_instrumento: v })} />
          <CampoSelect label="Status" value={dados.status} onChange={v => set({ status: v as StatusProjeto })}
            opcoes={[
              { value: 'em_concorrencia', label: 'Em concorrência' },
              { value: 'em_fase_aprovacao', label: 'Em fase de aprovação' },
              { value: 'em_execucao', label: 'Em execução' },
              { value: 'encerrado', label: 'Encerrado' },
            ]} />
          <CampoTexto label="Nº Termo de Fomento" value={dados.numero_termo_fomento ?? ''} onChange={v => set({ numero_termo_fomento: v })} />
          <CampoTexto label="Nº Transferegov" value={dados.numero_transferegov ?? ''} onChange={v => set({ numero_transferegov: v })} />
          <CampoData label="Início da execução" value={dados.data_inicio_execucao ?? ''} onChange={v => set({ data_inicio_execucao: v })} />
          <CampoData label="Fim da execução" value={dados.data_fim_execucao ?? ''} onChange={v => set({ data_fim_execucao: v })} />
        </div>
      </div>

      <FiliadosVinculados projetoId={dados.id} />
      <DocumentosAdmin entidadeTipo="projeto" entidadeId={dados.id} />
    </div>
  )
}
