'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Usuario, UnisolEstadual } from '@/lib/supabase'

const LABEL_PERFIL: Record<string, string> = {
  aplicador: 'Aplicador (técnico de campo)',
  tecnico: 'Técnico',
  admin: 'Admin',
}

export function TecnicosLista() {
  const [lista, setLista] = useState<Usuario[]>([])
  const [estaduais, setEstaduais] = useState<UnisolEstadual[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      const sb = getSupabase()
      const [{ data: u }, { data: e }] = await Promise.all([
        sb.from('usuarios').select('*').in('perfil', ['aplicador', 'tecnico']).order('nome'),
        sb.from('unisol_estaduais').select('*').order('nome'),
      ])
      setLista((u as Usuario[]) || [])
      setEstaduais((e as UnisolEstadual[]) || [])
      setCarregando(false)
    }
    carregar()
  }, [])

  const nomeEstadual = (id: string | null) => id ? (estaduais.find(e => e.id === id)?.nome || '—') : 'Direto na Nacional'
  const filtrados = lista.filter(u => !busca || `${u.nome} ${u.email} ${u.instituicao ?? ''}`.toLowerCase().includes(busca.toLowerCase()))

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>Técnicos</h1>
        <p className="text-xs text-gray-400 mt-0.5">Diretório do corpo técnico de campo — somente consulta. Para cadastrar login/acesso, use Administração → Usuários.</p>
      </div>

      <input
        value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome, email ou instituição…"
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Contato</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Perfil</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Vinculado a</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Instituição</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(u => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.nome}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{LABEL_PERFIL[u.perfil] || u.perfil}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{nomeEstadual(u.unisol_estadual_id)}</td>
                  <td className="px-4 py-3 text-gray-500">{u.instituicao || '—'}</td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">Nenhum técnico cadastrado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
