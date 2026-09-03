'use client'

import { useEffect, useState } from 'react'
import { getSupabase, DocumentoInstitucional, EntidadeTipo } from '@/lib/supabase'
import { Drawer } from '@/components/layout/Drawer'
import { situacaoDocumento, LABEL_SITUACAO, TIPOS_DOCUMENTO } from '@/lib/documentos'

const VAZIO = { tipo_documento: 'estatuto', data_emissao: '', data_validade: '', observacao: '' }

export function DocumentosAdmin({ entidadeTipo, entidadeId }: { entidadeTipo: EntidadeTipo; entidadeId: string }) {
  const [lista, setLista] = useState<DocumentoInstitucional[]>([])
  const [carregando, setCarregando] = useState(true)
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState(VAZIO)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    const { data } = await getSupabase()
      .from('documentos_institucionais')
      .select('*')
      .eq('entidade_tipo', entidadeTipo)
      .eq('entidade_id', entidadeId)
      .order('created_at', { ascending: false })
    setLista((data as DocumentoInstitucional[]) || [])
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [entidadeTipo, entidadeId]) // eslint-disable-line react-hooks/exhaustive-deps

  function abrirNovo() {
    setForm(VAZIO); setArquivo(null); setErro(''); setDrawer(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!arquivo) { setErro('Selecione um arquivo.'); return }
    setSalvando(true)
    const sb = getSupabase()
    const path = `${entidadeTipo}/${entidadeId}/${crypto.randomUUID()}-${arquivo.name}`
    const { error: erroUpload } = await sb.storage.from('documentos-institucionais').upload(path, arquivo)
    if (erroUpload) { setErro(`Erro no upload: ${erroUpload.message}`); setSalvando(false); return }

    const { data: sessao } = await sb.auth.getSession()
    const { error: erroInsert } = await sb.from('documentos_institucionais').insert({
      entidade_tipo: entidadeTipo,
      entidade_id: entidadeId,
      tipo_documento: form.tipo_documento,
      nome_arquivo: arquivo.name,
      storage_path: path,
      data_emissao: form.data_emissao || null,
      data_validade: form.data_validade || null,
      observacao: form.observacao || null,
      uploaded_by: sessao.session?.user.id || null,
    })
    if (erroInsert) { setErro(erroInsert.message); setSalvando(false); return }

    setDrawer(false); setSalvando(false); carregar()
  }

  async function baixar(doc: DocumentoInstitucional) {
    const { data, error } = await getSupabase().storage.from('documentos-institucionais').createSignedUrl(doc.storage_path, 60)
    if (error || !data) { alert('Erro ao gerar link do arquivo.'); return }
    window.open(data.signedUrl, '_blank')
  }

  const labelTipo = (t: string) => TIPOS_DOCUMENTO.find(o => o.value === t)?.label || t

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Documentos</h2>
        <button onClick={abrirNovo} className="text-xs font-medium text-white rounded-lg px-3 py-1.5" style={{ background: 'var(--primary)' }}>
          + Anexar
        </button>
      </div>

      {carregando ? (
        <p className="text-xs text-gray-400">Carregando…</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Tipo</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Arquivo</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Validade</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Situação</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {lista.map(doc => {
                const sit = situacaoDocumento(doc.data_validade)
                const s = LABEL_SITUACAO[sit]
                return (
                  <tr key={doc.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-3 py-2 font-medium text-gray-900">{labelTipo(doc.tipo_documento)}</td>
                    <td className="px-3 py-2 text-gray-500 truncate max-w-[160px]">{doc.nome_arquivo}</td>
                    <td className="px-3 py-2 text-gray-500">{doc.data_validade || '—'}</td>
                    <td className="px-3 py-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.cor }}>{s.texto}</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => baixar(doc)} className="text-xs font-medium hover:opacity-80" style={{ color: 'var(--primary)' }}>Abrir</button>
                    </td>
                  </tr>
                )
              })}
              {lista.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-gray-400">Nenhum documento anexado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Anexar documento">
        <form onSubmit={salvar} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de documento</label>
            <select value={form.tipo_documento} onChange={e => setForm(p => ({ ...p, tipo_documento: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]">
              {TIPOS_DOCUMENTO.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Arquivo *</label>
            <input type="file" required onChange={e => setArquivo(e.target.files?.[0] || null)}
              className="w-full text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Data de emissão</label>
              <input type="date" value={form.data_emissao} onChange={e => setForm(p => ({ ...p, data_emissao: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Validade (se houver)</label>
              <input type="date" value={form.data_validade} onChange={e => setForm(p => ({ ...p, data_validade: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observação</label>
            <input value={form.observacao} onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
          </div>
          {erro && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{erro}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setDrawer(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={salvando}
              className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50" style={{ background: 'var(--primary)' }}>
              {salvando ? 'Enviando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
