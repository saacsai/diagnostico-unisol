'use client'

import { useEffect, useState } from 'react'
import { getSupabase, UnisolEstadual } from '@/lib/supabase'
import { Drawer } from '@/components/layout/Drawer'

const VAZIO = { nome: '', uf: '' }

export function EstaduaisAdmin() {
  const [lista, setLista] = useState<UnisolEstadual[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState(VAZIO)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    const { data } = await getSupabase().from('unisol_estaduais').select('*').order('nome')
    setLista((data as UnisolEstadual[]) || [])
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [])

  function abrirNovo() {
    setForm(VAZIO); setErro(''); setDrawer(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!form.nome.trim() || form.uf.trim().length !== 2) { setErro('Informe nome e UF (2 letras).'); return }
    setSalvando(true)
    const { error } = await getSupabase().from('unisol_estaduais').insert({ nome: form.nome.trim(), uf: form.uf.trim().toUpperCase() })
    if (error) { setErro(error.message); setSalvando(false); return }
    setDrawer(false); setSalvando(false); carregar()
  }

  const filtrados = lista.filter(e => !busca || `${e.nome} ${e.uf}`.toLowerCase().includes(busca.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>Estaduais</h1>
          <p className="text-xs text-gray-400 mt-0.5">UNISOL SP, UNISOL BA, UNISOL RS…</p>
        </div>
        <button onClick={abrirNovo} className="text-sm font-medium text-white rounded-lg px-4 py-2" style={{ background: 'var(--primary)' }}>
          + Cadastrar
        </button>
      </div>

      <input
        value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou UF…"
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">UF</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(e => (
                <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{e.nome}</td>
                  <td className="px-4 py-3 text-gray-500">{e.uf}</td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={2} className="px-4 py-8 text-center text-sm text-gray-400">Nenhuma estadual cadastrada ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Cadastrar estadual">
        <form onSubmit={salvar} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nome *</label>
            <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} required autoFocus
              placeholder="ex: UNISOL SP"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">UF *</label>
            <input value={form.uf} onChange={e => setForm(p => ({ ...p, uf: e.target.value }))} required maxLength={2}
              placeholder="ex: SP"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
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
