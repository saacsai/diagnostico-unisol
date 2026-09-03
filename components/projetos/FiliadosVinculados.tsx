'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Empreendimento, Diagnostico, EmpreendimentoProjeto } from '@/lib/supabase'
import { calcularCompletude } from '@/lib/diagnostico/completude'
import { Drawer } from '@/components/layout/Drawer'

type Vinculo = EmpreendimentoProjeto & { empreendimentos: Empreendimento | null }

export function FiliadosVinculados({ projetoId }: { projetoId: string }) {
  const [vinculos, setVinculos] = useState<Vinculo[]>([])
  const [diagnosticosPorEmp, setDiagnosticosPorEmp] = useState<Record<string, Diagnostico>>({})
  const [idsComAnexoA, setIdsComAnexoA] = useState<Set<string>>(new Set())
  const [carregando, setCarregando] = useState(true)
  const [drawer, setDrawer] = useState(false)

  async function carregar() {
    setCarregando(true)
    const sb = getSupabase()
    const { data: vincs } = await sb
      .from('empreendimento_projeto')
      .select('*, empreendimentos(*)')
      .eq('projeto_id', projetoId)
    const lista = (vincs as Vinculo[]) || []
    setVinculos(lista)

    const empIds = lista.map(v => v.empreendimento_id)
    if (empIds.length > 0) {
      const { data: diags } = await sb
        .from('diagnosticos')
        .select('*')
        .in('empreendimento_id', empIds)
        .order('versao', { ascending: false })
      const porEmp: Record<string, Diagnostico> = {}
      for (const d of (diags as Diagnostico[]) || []) {
        if (!porEmp[d.empreendimento_id]) porEmp[d.empreendimento_id] = d // primeiro = maior versão
      }
      setDiagnosticosPorEmp(porEmp)

      const diagIds = Object.values(porEmp).map(d => d.id)
      if (diagIds.length > 0) {
        const { data: docs } = await sb
          .from('documentos_institucionais')
          .select('entidade_id')
          .eq('entidade_tipo', 'diagnostico')
          .in('entidade_id', diagIds)
        setIdsComAnexoA(new Set((docs || []).map((d: { entidade_id: string }) => d.entidade_id)))
      }
    } else {
      setDiagnosticosPorEmp({})
    }
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [projetoId]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Filiados vinculados</h2>
        <button onClick={() => setDrawer(true)} className="text-xs font-medium text-white rounded-lg px-3 py-1.5" style={{ background: 'var(--primary)' }}>
          + Vincular Filiado
        </button>
      </div>

      {carregando ? (
        <p className="text-xs text-gray-400">Carregando…</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Filiado</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Local</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Diagnóstico</th>
              </tr>
            </thead>
            <tbody>
              {vinculos.map(v => {
                const emp = v.empreendimentos
                const diag = emp ? diagnosticosPorEmp[emp.id] : undefined
                const nome = emp?.nome_fantasia || emp?.razao_social || 'Empreendimento sem nome'
                if (!diag) {
                  return (
                    <tr key={v.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-2 font-medium text-gray-900">{nome}</td>
                      <td className="px-3 py-2 text-gray-500">{emp?.municipio}{emp?.uf ? `/${emp.uf}` : ''}</td>
                      <td className="px-3 py-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Sem diagnóstico</span>
                      </td>
                    </tr>
                  )
                }
                const { feitas, total, pct } = calcularCompletude(diag, emp, idsComAnexoA.has(diag.id))
                return (
                  <tr key={v.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => window.location.href = `/diagnosticos?id=${diag.id}`}>
                    <td className="px-3 py-2 font-medium text-gray-900">{nome}</td>
                    <td className="px-3 py-2 text-gray-500">{emp?.municipio}{emp?.uf ? `/${emp.uf}` : ''}</td>
                    <td className="px-3 py-2 text-gray-600">
                      {pct}% <span className="text-gray-400">({feitas}/{total}){diag.rotulo_versao ? ` · ${diag.rotulo_versao}` : ''}</span>
                    </td>
                  </tr>
                )
              })}
              {vinculos.length === 0 && (
                <tr><td colSpan={3} className="px-3 py-6 text-center text-xs text-gray-400">Nenhum Filiado vinculado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <VincularFiliadoDrawer projetoId={projetoId} aberto={drawer} onFechar={() => setDrawer(false)} onVinculado={carregar} />
    </div>
  )
}

function VincularFiliadoDrawer({
  projetoId, aberto, onFechar, onVinculado,
}: {
  projetoId: string
  aberto: boolean
  onFechar: () => void
  onVinculado: () => void
}) {
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([])
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState('')
  const [vinculando, setVinculando] = useState<string | null>(null)

  useEffect(() => {
    if (!aberto) return
    getSupabase().from('empreendimentos').select('*').order('nome_fantasia').then(({ data }) => {
      setEmpreendimentos((data as Empreendimento[]) || [])
    })
  }, [aberto])

  const filtrados = empreendimentos.filter(e =>
    !busca || `${e.nome_fantasia} ${e.razao_social}`.toLowerCase().includes(busca.toLowerCase())
  )

  async function vincular(empId: string) {
    setErro(''); setVinculando(empId)
    const { error } = await getSupabase().from('empreendimento_projeto').upsert(
      { empreendimento_id: empId, projeto_id: projetoId },
      { onConflict: 'empreendimento_id,projeto_id', ignoreDuplicates: true }
    )
    setVinculando(null)
    if (error) { setErro(error.message); return }
    onFechar()
    onVinculado()
  }

  return (
    <Drawer open={aberto} onClose={onFechar} title="Vincular Filiado ao projeto">
      <div className="space-y-3">
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar empreendimento…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
        {erro && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{erro}</p>}
        <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
          {filtrados.map(e => (
            <button key={e.id} onClick={() => vincular(e.id)} disabled={vinculando === e.id}
              className="block w-full text-left px-3 py-2 text-sm border-b border-gray-50 last:border-0 hover:bg-gray-50 disabled:opacity-50">
              {e.nome_fantasia || e.razao_social || '(sem nome)'}
              <span className="block text-[11px] text-gray-400">{e.municipio}{e.uf ? `/${e.uf}` : ''} {vinculando === e.id ? '— vinculando…' : ''}</span>
            </button>
          ))}
          {filtrados.length === 0 && <p className="text-xs text-gray-400 p-3">Nenhum empreendimento encontrado.</p>}
        </div>
      </div>
    </Drawer>
  )
}
