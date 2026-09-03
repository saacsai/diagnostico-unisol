'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Projeto, StatusProjeto } from '@/lib/supabase'
import { Drawer } from '@/components/layout/Drawer'

const VAZIO = { nome: '', resumo: '', financiador: '', status: 'em_execucao' as StatusProjeto }

const LABEL_STATUS: Record<StatusProjeto, { texto: string; cor: string; bg: string }> = {
  em_concorrencia: { texto: 'Em concorrência', cor: '#6b7280', bg: '#f3f4f6' },
  em_fase_aprovacao: { texto: 'Em fase de aprovação', cor: '#b45309', bg: '#fef3c7' },
  em_execucao: { texto: 'Em execução', cor: '#15803d', bg: '#dcfce7' },
  encerrado: { texto: 'Encerrado', cor: '#6b7280', bg: '#f3f4f6' },
}

export function ProjetosLista() {
  const [lista, setLista] = useState<Projeto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState(VAZIO)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    const { data } = await getSupabase().from('projetos').select('*').order('nome')
    setLista((data as Projeto[]) || [])
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [])

  function abrirNovo() {
    setForm(VAZIO); setErro(''); setDrawer(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!form.nome.trim()) { setErro('Informe o nome do projeto.'); return }
    setSalvando(true)
    const { error } = await getSupabase().from('projetos').insert(form)
    if (error) { setErro(error.message); setSalvando(false); return }
    setDrawer(false); setSalvando(false); carregar()
  }

  const filtrados = lista.filter(p => !busca || `${p.nome} ${p.financiador ?? ''}`.toLowerCase().includes(busca.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>Projetos</h1>
        <button onClick={abrirNovo} className="text-sm font-medium text-white rounded-lg px-4 py-2" style={{ background: 'var(--primary)' }}>
          + Novo projeto
        </button>
      </div>

      <input
        value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou financiador…"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] mb-3"
      />

      {carregando ? (
        <p className="text-sm text-gray-400">Carregando…</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Financiador</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 cursor-pointer"
                  onClick={() => window.location.href = `/projetos/${p.id}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.nome}</td>
                  <td className="px-4 py-3 text-gray-500">{p.financiador || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: LABEL_STATUS[p.status].bg, color: LABEL_STATUS[p.status].cor }}>
                      {LABEL_STATUS[p.status].texto}
                    </span>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">Nenhum projeto cadastrado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Novo projeto">
        <form onSubmit={salvar} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nome *</label>
            <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} required autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Resumo</label>
            <textarea rows={3} value={form.resumo} onChange={e => setForm(p => ({ ...p, resumo: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Financiador</label>
            <input value={form.financiador} onChange={e => setForm(p => ({ ...p, financiador: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as StatusProjeto }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]">
              {(Object.keys(LABEL_STATUS) as StatusProjeto[]).map(s => <option key={s} value={s}>{LABEL_STATUS[s].texto}</option>)}
            </select>
          </div>
          <p className="text-xs text-gray-400">Os demais dados (nº do termo de fomento, Transferegov, datas de execução, anexos) você preenche no detalhe do projeto.</p>
          {erro && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{erro}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setDrawer(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={salvando}
              className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50" style={{ background: 'var(--primary)' }}>
              {salvando ? 'Criando…' : 'Criar'}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
