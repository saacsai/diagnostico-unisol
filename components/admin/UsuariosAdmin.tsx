'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Usuario, UnisolEstadual, Perfil } from '@/lib/supabase'
import { Drawer } from '@/components/layout/Drawer'

function gerarSenhaTemp() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let s = ''
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s + '!1'
}

const VAZIO = { nome: '', email: '', perfil: 'aplicador' as Perfil, instituicao: '', unisol_estadual_id: '' }

const LABEL_PERFIL: Record<Perfil, string> = {
  aplicador: 'Aplicador (técnico de campo)',
  tecnico: 'Técnico (também analisa/edita tudo)',
  admin: 'Admin',
}

export function UsuariosAdmin() {
  const [lista, setLista] = useState<Usuario[]>([])
  const [estaduais, setEstaduais] = useState<UnisolEstadual[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState(VAZIO)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [criado, setCriado] = useState<{ email: string; senha: string } | null>(null)

  async function carregar() {
    setCarregando(true)
    const sb = getSupabase()
    const [{ data: u }, { data: e }] = await Promise.all([
      sb.from('usuarios').select('*').order('nome'),
      sb.from('unisol_estaduais').select('*').order('nome'),
    ])
    setLista((u as Usuario[]) || [])
    setEstaduais((e as UnisolEstadual[]) || [])
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [])

  function abrirNovo() {
    setForm(VAZIO); setErro(''); setCriado(null); setDrawer(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro(''); setCriado(null)
    if (!form.nome.trim() || !form.email.trim()) { setErro('Nome e email são obrigatórios.'); return }
    setSalvando(true)
    const senha = gerarSenhaTemp()
    const sb = getSupabase()
    const { data: sessao } = await sb.auth.getSession()
    const token = sessao.session?.access_token

    const res = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, senha, unisol_estadual_id: form.unisol_estadual_id || null }),
    })
    const json = await res.json()
    if (!res.ok) { setErro(json.error || 'Erro ao criar usuário.'); setSalvando(false); return }

    setCriado({ email: form.email, senha })
    setSalvando(false)
    carregar()
  }

  const nomeEstadual = (id: string | null) => estaduais.find(e => e.id === id)?.nome || '—'
  const filtrados = lista.filter(u => !busca || `${u.nome} ${u.email} ${u.perfil}`.toLowerCase().includes(busca.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>Usuários</h1>
          <p className="text-xs text-gray-400 mt-0.5">Técnicos, coordenadores e administradores</p>
        </div>
        <button onClick={abrirNovo} className="text-sm font-medium text-white rounded-lg px-4 py-2" style={{ background: 'var(--primary)' }}>
          + Cadastrar
        </button>
      </div>

      <input
        value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome, email ou perfil…"
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Perfil</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Estadual</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(u => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.nome}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{u.perfil}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{nomeEstadual(u.unisol_estadual_id)}</td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">Nenhum usuário cadastrado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Cadastrar usuário">
        {criado ? (
          <div className="space-y-3">
            <div className="rounded-lg p-3 text-xs" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
              <p className="font-semibold">Usuário criado — repasse essa senha por um canal seguro (WhatsApp, etc):</p>
              <p className="mt-1">Email: <span className="font-mono">{criado.email}</span></p>
              <p>Senha temporária: <span className="font-mono">{criado.senha}</span></p>
              <p className="mt-1 opacity-80">A pessoa pode trocar a senha depois em &quot;Esqueci minha senha&quot;.</p>
            </div>
            <button onClick={() => setDrawer(false)} className="w-full rounded-lg py-2 text-sm font-medium text-white" style={{ background: 'var(--primary)' }}>
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={salvar} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nome completo *</label>
              <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} required autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Perfil</label>
              <select value={form.perfil} onChange={e => setForm(p => ({ ...p, perfil: e.target.value as Perfil }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]">
                {(Object.keys(LABEL_PERFIL) as Perfil[]).map(p => <option key={p} value={p}>{LABEL_PERFIL[p]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">UNISOL Estadual (opcional)</label>
              <select value={form.unisol_estadual_id} onChange={e => setForm(p => ({ ...p, unisol_estadual_id: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]">
                <option value="">— Direto na Nacional —</option>
                {estaduais.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Instituição (texto livre)</label>
              <input value={form.instituicao} onChange={e => setForm(p => ({ ...p, instituicao: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
            </div>
            {erro && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{erro}</p>}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setDrawer(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={salvando}
                className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50" style={{ background: 'var(--primary)' }}>
                {salvando ? 'Criando…' : 'Criar usuário'}
              </button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  )
}
