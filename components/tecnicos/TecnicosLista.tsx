'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Tecnico, UnisolEstadual, AreaAtuacao } from '@/lib/supabase'
import { Drawer } from '@/components/layout/Drawer'
import { CampoTexto } from '@/components/diagnostico/campos/CampoTexto'

export const LABEL_AREA: Record<AreaAtuacao, string> = {
  ater: 'ATER',
  administrativo: 'Administrativo',
  comunicacao: 'Comunicação',
  coordenacao: 'Coordenação',
  juridico: 'Jurídico',
  contabil: 'Contábil',
  ti: 'TI',
}

const VAZIO = { nome: '', telefone: '', email: '', area_atuacao: '', competencias: '', unisol_estadual_id: '' }

export function TecnicosLista() {
  const [lista, setLista] = useState<Tecnico[]>([])
  const [estaduais, setEstaduais] = useState<UnisolEstadual[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState(VAZIO)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    const sb = getSupabase()
    const [{ data: t }, { data: e }] = await Promise.all([
      sb.from('tecnicos').select('*').order('nome'),
      sb.from('unisol_estaduais').select('*').order('nome'),
    ])
    setLista((t as Tecnico[]) || [])
    setEstaduais((e as UnisolEstadual[]) || [])
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [])

  function abrirNovo() {
    setForm(VAZIO); setErro(''); setDrawer(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!form.nome.trim()) { setErro('Informe o nome.'); return }
    setSalvando(true)
    const { error } = await getSupabase().from('tecnicos').insert({
      nome: form.nome,
      telefone: form.telefone || null,
      email: form.email || null,
      area_atuacao: form.area_atuacao || null,
      competencias: form.competencias || null,
      unisol_estadual_id: form.unisol_estadual_id || null,
    })
    if (error) { setErro(error.message); setSalvando(false); return }
    setDrawer(false); setSalvando(false); carregar()
  }

  const nomeEstadual = (id: string | null) => id ? (estaduais.find(e => e.id === id)?.nome || '—') : 'Direto na Nacional'
  const filtrados = lista.filter(t =>
    !busca || `${t.nome} ${t.email ?? ''} ${t.competencias ?? ''}`.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>Técnicos</h1>
          <p className="text-xs text-gray-400 mt-0.5">Banco de talentos da UNISOL — área de atuação e competências, pra alocar em projetos depois.</p>
        </div>
        <button onClick={abrirNovo} className="text-sm font-medium text-white rounded-lg px-4 py-2" style={{ background: 'var(--primary)' }}>
          + Cadastrar
        </button>
      </div>

      <input
        value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome, email ou competência…"
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Área</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Competências</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Vinculado a</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(t => (
                <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.nome}</td>
                  <td className="px-4 py-3 text-gray-500">{[t.telefone, t.email].filter(Boolean).join(' · ') || '—'}</td>
                  <td className="px-4 py-3">
                    {t.area_atuacao
                      ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{LABEL_AREA[t.area_atuacao]}</span>
                      : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 truncate max-w-[220px]">{t.competencias || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{nomeEstadual(t.unisol_estadual_id)}</td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">Nenhum técnico cadastrado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Cadastrar técnico">
        <form onSubmit={salvar} className="space-y-4">
          <CampoTexto label="Nome *" value={form.nome} onChange={v => setForm(p => ({ ...p, nome: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <CampoTexto label="Telefone" value={form.telefone} onChange={v => setForm(p => ({ ...p, telefone: v }))} />
            <CampoTexto label="Email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Área prioritária de atuação</label>
            <select value={form.area_atuacao} onChange={e => setForm(p => ({ ...p, area_atuacao: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] bg-white">
              <option value="">Selecione…</option>
              {(Object.keys(LABEL_AREA) as AreaAtuacao[]).map(a => <option key={a} value={a}>{LABEL_AREA[a]}</option>)}
            </select>
          </div>
          <CampoTexto label="Competências" value={form.competencias} onChange={v => setForm(p => ({ ...p, competencias: v }))}
            multiline placeholder="Experiências, formações, especialidades…" />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vinculado a</label>
            <select value={form.unisol_estadual_id} onChange={e => setForm(p => ({ ...p, unisol_estadual_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] bg-white">
              <option value="">— Direto na Nacional —</option>
              {estaduais.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </div>
          {erro && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{erro}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setDrawer(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={salvando}
              className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50" style={{ background: 'var(--primary)' }}>
              {salvando ? 'Criando…' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
