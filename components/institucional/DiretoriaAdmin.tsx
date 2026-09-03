'use client'

import { useEffect, useState } from 'react'
import { getSupabase, DiretoriaMembro, EntidadeDiretoria } from '@/lib/supabase'
import { Drawer } from '@/components/layout/Drawer'

const VAZIO = { nome_completo: '', cargo: '', endereco: '', email: '', telefone: '', cpf: '', rg: '' }

export function DiretoriaAdmin({ entidadeTipo, entidadeId }: { entidadeTipo: EntidadeDiretoria; entidadeId: string }) {
  const [lista, setLista] = useState<DiretoriaMembro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState(VAZIO)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    const { data } = await getSupabase()
      .from('diretoria_membros')
      .select('*')
      .eq('entidade_tipo', entidadeTipo)
      .eq('entidade_id', entidadeId)
      .order('created_at')
    setLista((data as DiretoriaMembro[]) || [])
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [entidadeTipo, entidadeId]) // eslint-disable-line react-hooks/exhaustive-deps

  function abrirNovo() {
    setForm(VAZIO); setErro(''); setDrawer(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!form.nome_completo.trim()) { setErro('Informe o nome completo.'); return }
    setSalvando(true)
    const { error } = await getSupabase().from('diretoria_membros').insert({
      entidade_tipo: entidadeTipo, entidade_id: entidadeId, ...form,
    })
    if (error) { setErro(error.message); setSalvando(false); return }
    setDrawer(false); setSalvando(false); carregar()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Diretoria</h2>
        <button onClick={abrirNovo} className="text-xs font-medium text-white rounded-lg px-3 py-1.5" style={{ background: 'var(--primary)' }}>
          + Adicionar
        </button>
      </div>

      {carregando ? (
        <p className="text-xs text-gray-400">Carregando…</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Nome</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Cargo</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Contato</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(m => (
                <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-3 py-2 font-medium text-gray-900">{m.nome_completo}</td>
                  <td className="px-3 py-2 text-gray-500">{m.cargo || '—'}</td>
                  <td className="px-3 py-2 text-gray-500">{m.email || m.telefone || '—'}</td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr><td colSpan={3} className="px-3 py-6 text-center text-xs text-gray-400">Nenhum membro cadastrado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Adicionar membro da diretoria">
        <form onSubmit={salvar} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nome completo *</label>
            <input value={form.nome_completo} onChange={e => setForm(p => ({ ...p, nome_completo: e.target.value }))} required autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cargo</label>
            <input value={form.cargo} onChange={e => setForm(p => ({ ...p, cargo: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Endereço</label>
            <input value={form.endereco} onChange={e => setForm(p => ({ ...p, endereco: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Telefone</label>
              <input value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">CPF</label>
              <input value={form.cpf} onChange={e => setForm(p => ({ ...p, cpf: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">RG</label>
              <input value={form.rg} onChange={e => setForm(p => ({ ...p, rg: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
            </div>
          </div>
          {erro && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{erro}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setDrawer(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={salvando}
              className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50" style={{ background: 'var(--primary)' }}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
