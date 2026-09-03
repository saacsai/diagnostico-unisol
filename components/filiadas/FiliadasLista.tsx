'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Empreendimento, UnisolEstadual, Diagnostico, Projeto } from '@/lib/supabase'
import { calcularCompletude } from '@/lib/diagnostico/completude'

export function FiliadasLista() {
  const [lista, setLista] = useState<Empreendimento[]>([])
  const [estaduais, setEstaduais] = useState<Record<string, UnisolEstadual>>({})
  const [diagPorEmp, setDiagPorEmp] = useState<Record<string, Diagnostico>>({})
  const [idsComAnexoA, setIdsComAnexoA] = useState<Set<string>>(new Set())
  const [projetosPorEmp, setProjetosPorEmp] = useState<Record<string, Projeto[]>>({})
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      const sb = getSupabase()

      const [{ data: emps }, { data: ests }] = await Promise.all([
        sb.from('empreendimentos').select('*').order('nome_fantasia'),
        sb.from('unisol_estaduais').select('*'),
      ])
      const listaEmps = (emps as Empreendimento[]) || []
      setLista(listaEmps)
      setEstaduais(Object.fromEntries(((ests as UnisolEstadual[]) || []).map(e => [e.id, e])))

      const empIds = listaEmps.map(e => e.id)
      if (empIds.length > 0) {
        const { data: diags } = await sb
          .from('diagnosticos')
          .select('*')
          .in('empreendimento_id', empIds)
          .order('versao', { ascending: false })
        const porEmp: Record<string, Diagnostico> = {}
        for (const d of (diags as Diagnostico[]) || []) {
          if (!porEmp[d.empreendimento_id]) porEmp[d.empreendimento_id] = d
        }
        setDiagPorEmp(porEmp)

        const diagIds = Object.values(porEmp).map(d => d.id)
        if (diagIds.length > 0) {
          const { data: docs } = await sb
            .from('documentos_institucionais')
            .select('entidade_id')
            .eq('entidade_tipo', 'diagnostico')
            .in('entidade_id', diagIds)
          setIdsComAnexoA(new Set((docs || []).map((d: { entidade_id: string }) => d.entidade_id)))
        }

        const { data: vincs } = await sb
          .from('empreendimento_projeto')
          .select('empreendimento_id, projetos(*)')
          .in('empreendimento_id', empIds)
        const porEmpProj: Record<string, Projeto[]> = {}
        for (const v of (vincs as unknown as { empreendimento_id: string; projetos: Projeto | null }[]) || []) {
          if (!v.projetos || v.projetos.status !== 'em_execucao') continue
          if (!porEmpProj[v.empreendimento_id]) porEmpProj[v.empreendimento_id] = []
          porEmpProj[v.empreendimento_id].push(v.projetos)
        }
        setProjetosPorEmp(porEmpProj)
      }
      setCarregando(false)
    }
    carregar()
  }, [])

  const filtrados = lista.filter(e =>
    !busca || `${e.nome_fantasia} ${e.razao_social} ${e.cnpj}`.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-lg font-bold mb-4" style={{ color: 'var(--primary)' }}>Filiadas</h1>

      <input
        value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome, razão social ou CNPJ…"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] mb-3"
      />

      {carregando ? (
        <p className="text-sm text-gray-400">Carregando…</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">CNPJ</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Filiação</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Diagnóstico</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Projetos em execução</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(e => {
                const diag = diagPorEmp[e.id]
                const badges: { texto: string; cor: string; bg: string }[] = []
                if (e.vinculacao_unisol === 'filiado') badges.push({ texto: 'Nacional', cor: '#134529', bg: '#A8D5B5' })
                if (e.unisol_estadual_id && estaduais[e.unisol_estadual_id]) {
                  badges.push({ texto: estaduais[e.unisol_estadual_id].nome, cor: '#1d4ed8', bg: '#dbeafe' })
                }
                const projs = projetosPorEmp[e.id] || []
                return (
                  <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => window.location.href = `/filiadas/${e.id}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{e.nome_fantasia || e.razao_social || 'Sem nome'}</td>
                    <td className="px-4 py-3 text-gray-500">{e.cnpj || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {badges.length === 0
                          ? <span className="text-xs text-gray-400">—</span>
                          : badges.map((b, i) => (
                            <span key={i} className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: b.bg, color: b.cor }}>{b.texto}</span>
                          ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {diag ? (
                        <>{calcularCompletude(diag, e, idsComAnexoA.has(diag.id)).pct}%{diag.rotulo_versao ? <span className="text-gray-400"> · {diag.rotulo_versao}</span> : null}</>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Não iniciado</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {projs.length === 0 ? '—' : projs.map(p => p.nome).join(', ')}
                    </td>
                  </tr>
                )
              })}
              {filtrados.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">Nenhuma Filiada encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
