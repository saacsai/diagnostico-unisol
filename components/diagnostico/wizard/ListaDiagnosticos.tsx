'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Diagnostico, Empreendimento } from '@/lib/supabase'
import { calcularCompletude } from '@/lib/diagnostico/completude'
import { Drawer } from '@/components/layout/Drawer'
import { NovoDiagnostico } from './NovoDiagnostico'

type DiagnosticoComEmpreendimento = Diagnostico & { empreendimentos: Empreendimento | null }

export function ListaDiagnosticos() {
  const [lista, setLista] = useState<DiagnosticoComEmpreendimento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [drawer, setDrawer] = useState(false)

  async function carregar() {
    setCarregando(true)
    const { data } = await getSupabase()
      .from('diagnosticos')
      .select('*, empreendimentos(*)')
      .order('created_at', { ascending: false })
    setLista((data as DiagnosticoComEmpreendimento[]) || [])
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  const filtrados = lista.filter(d => {
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

      <input
        value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por empreendimento, município ou UF…"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] mb-3"
      />

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
                const { feitas, total, pct } = calcularCompletude(d, d.empreendimentos)
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
