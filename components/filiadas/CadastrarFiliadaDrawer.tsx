'use client'

import { useEffect, useState } from 'react'
import { getSupabase, UnisolEstadual } from '@/lib/supabase'
import { Drawer } from '@/components/layout/Drawer'
import { CampoTexto } from '@/components/diagnostico/campos/CampoTexto'
import { BuscarCnpjBotao } from '@/components/institucional/BuscarCnpjBotao'

const VAZIO = {
  vinculo: '',
  nome_fantasia: '',
  cnpj: '',
  razao_social: '',
  endereco: '',
  municipio: '',
  uf: '',
  cep: '',
  contato_nome: '',
  contato_tel: '',
  contato_email: '',
}

export function CadastrarFiliadaDrawer({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const [estaduais, setEstaduais] = useState<UnisolEstadual[]>([])
  const [form, setForm] = useState(VAZIO)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!aberto) return
    setForm(VAZIO); setArquivo(null); setErro('')
    getSupabase().from('unisol_estaduais').select('*').eq('status', 'formalizada').order('nome').then(({ data }) => {
      setEstaduais((data as UnisolEstadual[]) || [])
    })
  }, [aberto])

  function set(patch: Partial<typeof VAZIO>) { setForm(p => ({ ...p, ...patch })) }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!form.vinculo) { setErro('Selecione a quem a Filiada será filiada.'); return }
    if (!form.nome_fantasia.trim()) { setErro('Informe o nome fantasia.'); return }

    setSalvando(true)
    const sb = getSupabase()
    const { data: sessao } = await sb.auth.getSession()
    const userId = sessao.session?.user.id

    const novoId = crypto.randomUUID()
    const { error: erroEmp } = await sb.from('empreendimentos').insert({
      id: novoId,
      nome_fantasia: form.nome_fantasia,
      razao_social: form.razao_social || null,
      cnpj: form.cnpj || null,
      endereco: form.endereco || null,
      municipio: form.municipio || null,
      uf: form.uf || null,
      vinculacao_unisol: form.vinculo === 'nacional' ? 'filiado' : null,
      unisol_estadual_id: form.vinculo === 'nacional' ? null : form.vinculo,
      pessoa_referencia_nome: form.contato_nome || null,
      pessoa_referencia_tel: form.contato_tel || null,
      pessoa_referencia_email: form.contato_email || null,
    })
    if (erroEmp) { setErro(erroEmp.message); setSalvando(false); return }

    if (arquivo) {
      const path = `empreendimento/${novoId}/${crypto.randomUUID()}-${arquivo.name}`
      const { error: erroUpload } = await sb.storage.from('documentos-institucionais').upload(path, arquivo)
      if (!erroUpload) {
        await sb.from('documentos_institucionais').insert({
          entidade_tipo: 'empreendimento',
          entidade_id: novoId,
          tipo_documento: 'ficha_filiacao',
          nome_arquivo: arquivo.name,
          storage_path: path,
          uploaded_by: userId || null,
        })
      }
    }

    setSalvando(false)
    window.location.href = `/filiadas/${novoId}`
  }

  return (
    <Drawer open={aberto} onClose={onFechar} title="Cadastrar Filiada">
      <form onSubmit={salvar} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">A quem ela será filiada? *</label>
          <select value={form.vinculo} onChange={e => set({ vinculo: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] bg-white">
            <option value="">Selecione…</option>
            <option value="nacional">Nacional (direto, sem Estadual)</option>
            {estaduais.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>

        <CampoTexto label="Nome fantasia *" value={form.nome_fantasia} onChange={v => set({ nome_fantasia: v })} />

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <CampoTexto label="CNPJ (opcional)" value={form.cnpj} onChange={v => set({ cnpj: v })} placeholder="00.000.000/0000-00" />
          </div>
          <div className="pb-0.5">
            <BuscarCnpjBotao cnpj={form.cnpj} onDados={d => set({
              razao_social: d.razao_social || form.razao_social,
              nome_fantasia: form.nome_fantasia || d.nome_fantasia || '',
              endereco: d.endereco || form.endereco,
              municipio: d.municipio || form.municipio,
              uf: d.uf || form.uf,
              cep: d.cep || form.cep,
            })} />
          </div>
        </div>

        {form.razao_social && <CampoTexto label="Razão social" value={form.razao_social} onChange={v => set({ razao_social: v })} />}
        {(form.endereco || form.municipio || form.uf) && (
          <div className="grid grid-cols-3 gap-3">
            <CampoTexto label="Município" value={form.municipio} onChange={v => set({ municipio: v })} />
            <CampoTexto label="UF" value={form.uf} onChange={v => set({ uf: v.toUpperCase().slice(0, 2) })} />
            <CampoTexto label="CEP" value={form.cep} onChange={v => set({ cep: v })} />
          </div>
        )}

        <p className="text-xs font-semibold text-gray-500 pt-2">Contato</p>
        <div className="grid grid-cols-1 gap-3">
          <CampoTexto label="Nome do contato" value={form.contato_nome} onChange={v => set({ contato_nome: v })} />
          <div className="grid grid-cols-2 gap-3">
            <CampoTexto label="Telefone" value={form.contato_tel} onChange={v => set({ contato_tel: v })} />
            <CampoTexto label="Email" value={form.contato_email} onChange={v => set({ contato_email: v })} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Ficha de filiação (opcional)</label>
          <input type="file" onChange={e => setArquivo(e.target.files?.[0] || null)} className="w-full text-sm" />
          <p className="text-[11px] text-gray-400 mt-1">Link de cadastramento e documento pra assinatura chegam numa próxima etapa.</p>
        </div>

        {erro && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{erro}</p>}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onFechar} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={salvando}
            className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50" style={{ background: 'var(--primary)' }}>
            {salvando ? 'Criando…' : 'Cadastrar Filiada'}
          </button>
        </div>
      </form>
    </Drawer>
  )
}
