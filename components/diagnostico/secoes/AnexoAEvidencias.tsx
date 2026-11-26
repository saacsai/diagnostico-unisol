'use client'

import { useEffect, useState } from 'react'
import { getSupabase, DocumentoInstitucional } from '@/lib/supabase'
import { sanitizarNomeArquivo } from '@/lib/documentos'

const ITENS = [
  { chave: 'estatuto', label: 'Estatuto e alterações' },
  { chave: 'ata_eleicao', label: 'Ata de eleição vigente' },
  { chave: 'cnpj_cadastros', label: 'Cartão CNPJ/cadastros' },
  { chave: 'licencas', label: 'Licenças e certificados' },
  { chave: 'relacao_associados', label: 'Relação de associados/cooperados' },
  { chave: 'demonstrativos', label: 'Demonstrativos/controles financeiros' },
  { chave: 'registros_producao_vendas', label: 'Registros de produção e vendas' },
  { chave: 'catalogo_rotulos', label: 'Catálogo, rótulos e tabela de preços' },
  { chave: 'fotos', label: 'Fotos autorizadas da estrutura/produtos' },
  { chave: 'comprovantes_paa_pnae', label: 'Comprovantes de PAA/PNAE/mercados' },
  { chave: 'certificacoes', label: 'Certificações/rastreabilidade' },
  { chave: 'outros', label: 'Outros' },
]

// Anexo A agora é upload real (Storage), não mais um checklist de texto solto — cada item
// vira um documento em `documentos_institucionais` (entidade_tipo='diagnostico'). "Anexado" é
// literal: existe arquivo. Sem estado "não existe" — se não se aplica, a observação explica.
export function AnexoAEvidencias({ diagnosticoId }: { diagnosticoId: string }) {
  const [docs, setDocs] = useState<Record<string, DocumentoInstitucional>>({})
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState<string | null>(null)
  const [removendo, setRemovendo] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [erro, setErro] = useState('')

  async function carregar() {
    setCarregando(true)
    const { data } = await getSupabase()
      .from('documentos_institucionais')
      .select('*')
      .eq('entidade_tipo', 'diagnostico')
      .eq('entidade_id', diagnosticoId)
      .order('created_at', { ascending: false })
    const porTipo: Record<string, DocumentoInstitucional> = {}
    for (const d of (data as DocumentoInstitucional[]) || []) {
      if (!porTipo[d.tipo_documento]) porTipo[d.tipo_documento] = d // primeiro = mais recente (order desc)
    }
    setDocs(porTipo)
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [diagnosticoId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function anexar(chave: string, arquivo: File) {
    setErro(''); setEnviando(chave)
    const sb = getSupabase()
    const path = `diagnostico/${diagnosticoId}/${chave}-${crypto.randomUUID()}-${sanitizarNomeArquivo(arquivo.name)}`
    const { error: erroUpload } = await sb.storage.from('documentos-institucionais').upload(path, arquivo)
    if (erroUpload) { setErro(`Erro no upload: ${erroUpload.message}`); setEnviando(null); return }
    const { data: sessao } = await sb.auth.getSession()
    const { error: erroInsert } = await sb.from('documentos_institucionais').insert({
      entidade_tipo: 'diagnostico', entidade_id: diagnosticoId,
      tipo_documento: chave, nome_arquivo: arquivo.name, storage_path: path,
      uploaded_by: sessao.session?.user.id || null,
    })
    if (erroInsert) { setErro(erroInsert.message); setEnviando(null); return }
    setEnviando(null)
    carregar()
  }

  async function abrir(doc: DocumentoInstitucional) {
    const { data } = await getSupabase().storage.from('documentos-institucionais').createSignedUrl(doc.storage_path, 60)
    if (data) window.open(data.signedUrl, '_blank')
  }

  async function remover(chave: string, doc: DocumentoInstitucional) {
    setErro(''); setRemovendo(chave)
    const sb = getSupabase()
    const { error: erroStorage } = await sb.storage.from('documentos-institucionais').remove([doc.storage_path])
    if (erroStorage) { setErro(`Erro ao remover: ${erroStorage.message}`); setRemovendo(null); return }
    const { error: erroDelete } = await sb.from('documentos_institucionais').delete().eq('id', doc.id)
    if (erroDelete) { setErro(erroDelete.message); setRemovendo(null); return }
    setRemovendo(null); setConfirmando(null)
    carregar()
  }

  if (carregando) return <p className="text-xs text-gray-400">Carregando…</p>

  return (
    <div className="space-y-2">
      {erro && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{erro}</p>}
      {ITENS.map(item => {
        const doc = docs[item.chave]
        return (
          <div key={item.chave} className="border border-gray-100 rounded-lg p-2.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-700">{item.label}</p>
              {doc ? (
                <button onClick={() => abrir(doc)} className="text-[11px] hover:underline truncate block" style={{ color: 'var(--primary)' }}>
                  📎 {doc.nome_arquivo}
                </button>
              ) : (
                <span className="text-[11px] text-gray-400">Pendente</span>
              )}
            </div>
            {doc && confirmando === item.chave ? (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[11px] text-gray-500">Remover?</span>
                <button onClick={() => remover(item.chave, doc)} disabled={removendo === item.chave}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-red-200 text-red-600">
                  {removendo === item.chave ? 'Removendo…' : 'Sim'}
                </button>
                <button onClick={() => setConfirmando(null)} disabled={removendo === item.chave}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-gray-200 text-gray-500">
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <label className="text-[11px] font-medium px-2.5 py-1 rounded-full border cursor-pointer"
                  style={{ color: 'var(--primary)', borderColor: 'var(--primary-light)' }}>
                  {enviando === item.chave ? 'Enviando…' : doc ? 'Substituir' : 'Anexar'}
                  <input type="file" className="hidden" disabled={enviando === item.chave}
                    onChange={e => { const f = e.target.files?.[0]; if (f) anexar(item.chave, f) }} />
                </label>
                {doc && (
                  <button onClick={() => setConfirmando(item.chave)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-red-200 text-red-600">
                    Remover
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
