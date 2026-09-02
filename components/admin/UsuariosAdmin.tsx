'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Usuario, UnisolEstadual, Perfil } from '@/lib/supabase'

function gerarSenhaTemp() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let s = ''
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s + '!1'
}

export function UsuariosAdmin() {
  const [lista, setLista] = useState<Usuario[]>([])
  const [estaduais, setEstaduais] = useState<UnisolEstadual[]>([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [perfil, setPerfil] = useState<Perfil>('aplicador')
  const [instituicao, setInstituicao] = useState('')
  const [estadualId, setEstadualId] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [criado, setCriado] = useState<{ email: string; senha: string } | null>(null)

  async function carregar() {
    const sb = getSupabase()
    const [{ data: u }, { data: e }] = await Promise.all([
      sb.from('usuarios').select('*').order('nome'),
      sb.from('unisol_estaduais').select('*').order('nome'),
    ])
    setLista((u as Usuario[]) || [])
    setEstaduais((e as UnisolEstadual[]) || [])
  }
  useEffect(() => { carregar() }, [])

  async function criarTecnico() {
    setErro(''); setCriado(null)
    if (!nome.trim() || !email.trim()) { setErro('Nome e email são obrigatórios.'); return }
    setSalvando(true)
    const senha = gerarSenhaTemp()
    const sb = getSupabase()
    const { data: sessao } = await sb.auth.getSession()
    const token = sessao.session?.access_token

    const res = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nome, email, senha, perfil, instituicao, unisol_estadual_id: estadualId || null }),
    })
    const json = await res.json()
    if (!res.ok) { setErro(json.error || 'Erro ao criar usuário.'); setSalvando(false); return }

    setCriado({ email, senha })
    setNome(''); setEmail(''); setInstituicao(''); setEstadualId('')
    carregar()
    setSalvando(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <h2 className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Usuários (técnicos, coordenadores…)</h2>

      <div className="grid grid-cols-2 gap-2">
        <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo"
          className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email"
          className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
        <select value={perfil} onChange={e => setPerfil(e.target.value as Perfil)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]">
          <option value="aplicador">Aplicador (técnico de campo)</option>
          <option value="tecnico">Técnico (também analisa/edita tudo)</option>
          <option value="admin">Admin</option>
        </select>
        <select value={estadualId} onChange={e => setEstadualId(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]">
          <option value="">UNISOL Estadual (opcional)</option>
          {estaduais.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
        </select>
        <input value={instituicao} onChange={e => setInstituicao(e.target.value)} placeholder="Instituição (texto livre)"
          className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
      </div>

      <button onClick={criarTecnico} disabled={salvando}
        className="w-full text-sm font-semibold text-white rounded-lg py-2 disabled:opacity-60" style={{ background: 'var(--primary)' }}>
        {salvando ? 'Criando…' : '+ Criar usuário'}
      </button>

      {erro && <p className="text-xs text-red-600">{erro}</p>}
      {criado && (
        <div className="rounded-lg p-3 text-xs" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
          <p className="font-semibold">Usuário criado — repasse essa senha por um canal seguro (WhatsApp, etc):</p>
          <p className="mt-1">Email: <span className="font-mono">{criado.email}</span></p>
          <p>Senha temporária: <span className="font-mono">{criado.senha}</span></p>
          <p className="mt-1 opacity-80">A pessoa pode trocar a senha depois em &quot;Esqueci minha senha&quot;.</p>
        </div>
      )}

      <ul className="divide-y divide-gray-50">
        {lista.map(u => (
          <li key={u.id} className="py-1.5 text-sm">
            <span className="font-medium text-gray-800">{u.nome}</span>
            <span className="text-gray-400"> — {u.email} — {u.perfil}</span>
          </li>
        ))}
        {lista.length === 0 && <li className="py-2 text-xs text-gray-400">Nenhum usuário ainda.</li>}
      </ul>
    </div>
  )
}
