'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Diagnostico, Empreendimento, UnisolEstadual } from '@/lib/supabase'
import { calcularCompletude } from '@/lib/diagnostico/completude'
import { Drawer } from '@/components/layout/Drawer'
import { NovoDiagnostico } from './NovoDiagnostico'

type DiagnosticoComEmpreendimento = Diagnostico & { empreendimentos: Empreendimento | null }

export function ListaDiagnosticos() {
  const [lista, setLista] = useState<DiagnosticoComEmpreendimento[]>([])
  const [estaduais, setEstaduais] = useState<UnisolEstadual[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filiacao, setFiliacao] = useState('todos')
  const [drawer, setDrawer] = useState(false)
  const [idsComAnexoA, setIdsComAnexoA] = useState<Set<string>>(new Set())

  async function carregar() {
    setCarregando(true)
    const sb = getSupabase()
    const [{ data }, { data: ests }] = await Promise.all([
      sb.from('diagnosticos').select('*, empreendimentos(*)').order('created_at', { ascending: false }),
      sb.from('unisol_estaduais').select('*').eq('status', 'formalizada').order('nome'),
    ])
    const diags = (data as DiagnosticoComEmpreendimento[]) || []
    setLista(diags)
    setEstaduais((ests as UnisolEstadual[]) || [])

    if (diags.length > 0) {
      const { data: docs } = await sb
        .from('documentos_institucionais')
        .select('entidade_id')
        .eq('entidade_tipo', 'diagnostico')
        .in('entidade_id', diags.map(d => d.id))
      setIdsComAnexoA(new Set((docs || []).map((d: { entidade_id: string }) => d.entidade_id)))
    }
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  const porFiliacao = lista.filter(d => {
    if (filiacao === 'todos') return true
    if (filiacao === 'nacional') return d.empreendimentos?.vinculacao_unisol === 'filiado'
    return d.empreendimentos?.unisol_estadual_id === filiacao
  })

  const filtrados = porFiliacao.filter(d => {
    if (!busca) return true
    const alvo = `${d.empreendimentos?.nome_fantasia ?? ''} ${d.empreendimentos?.razao_social ?? ''} ${d.empreendimentos?.municipio ?? ''} ${d.empreendimentos?.uf ?? ''}`.toLowerCase()
    return alvo.includes(busca.toLowerCase())
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>Diagnósticos</h1>
        <button onClick={() => setDrawer(true)}
          className="text-sm font-medium text-white rounded-lg px-4 py-2" style={{ background: 'var(--primary)' }}>
          + Novo diagnóstico
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        <select value={filiacao} onChange={e => setFiliacao(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] bg-white">
          <option value="todos">Todos</option>
          <option value="nacional">Nacional</option>
          {estaduais.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
        </select>
        <input
          value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por empreendimento, município ou UF…"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
        />
      </div>

      {carregando ? (
        <p className="text-sm text-gray-400">Carregando…</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Empreendimento</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Local</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Progresso</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(d => {
                const { feitas, total, pct } = calcularCompletude(d, d.empreendimentos, idsComAnexoA.has(d.id))
                return (
                  <tr key={d.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => window.location.href = `/diagnosticos?id=${d.id}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {d.empreendimentos?.nome_fantasia || d.empreendimentos?.razao_social || 'Empreendimento sem nome'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {d.empreendimentos?.municipio}{d.empreendimentos?.uf ? `/${d.empreendimentos.uf}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{d.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {pct}% <span className="text-gray-400">({feitas}/{total})</span>
                    </td>
                  </tr>
                )
              })}
              {filtrados.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">
                  {lista.length === 0 ? 'Nenhum diagnóstico ainda. Clique em "+ Novo diagnóstico" pra começar.' : 'Nenhum resultado pra essa busca.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Novo diagnóstico">
        <NovoDiagnostico onCancelar={() => setDrawer(false)} />
      </Drawer>
    </div>
  )
}
