'use client'

import { useEffect, useState } from 'react'
import { getSupabase, UnisolEstadual } from '@/lib/supabase'

export function UnisolEstaduaisAdmin() {
  const [lista, setLista] = useState<UnisolEstadual[]>([])
  const [nome, setNome] = useState('')
  const [uf, setUf] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    const { data } = await getSupabase().from('unisol_estaduais').select('*').order('nome')
    setLista((data as UnisolEstadual[]) || [])
  }
  useEffect(() => { carregar() }, [])

  async function adicionar() {
    setErro('')
    if (!nome.trim() || uf.trim().length !== 2) { setErro('Informe nome e UF (2 letras).'); return }
    setSalvando(true)
    const { error } = await getSupabase().from('unisol_estaduais').insert({ nome: nome.trim(), uf: uf.trim().toUpperCase() })
    if (error) setErro(error.message)
    else { setNome(''); setUf(''); carregar() }
    setSalvando(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <h2 className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>UNISOLs Estaduais</h2>
      <div className="flex gap-2">
        <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome (ex: UNISOL SP)"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
        <input value={uf} onChange={e => setUf(e.target.value)} placeholder="UF" maxLength={2}
          className="w-16 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
        <button onClick={adicionar} disabled={salvando}
          className="text-sm font-medium text-white rounded-lg px-3 py-2 disabled:opacity-60" style={{ background: 'var(--primary)' }}>
          + Adicionar
        </button>
      </div>
      {erro && <p className="text-xs text-red-600">{erro}</p>}
      <ul className="divide-y divide-gray-50">
        {lista.map(e => (
          <li key={e.id} className="py-1.5 text-sm text-gray-700 flex justify-between">
            <span>{e.nome}</span>
            <span className="text-gray-400">{e.uf}</span>
          </li>
        ))}
        {lista.length === 0 && <li className="py-2 text-xs text-gray-400">Nenhuma cadastrada ainda.</li>}
      </ul>
    </div>
  )
}
