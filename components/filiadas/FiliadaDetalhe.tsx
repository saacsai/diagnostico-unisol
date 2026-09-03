'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Empreendimento, UnisolEstadual, Diagnostico } from '@/lib/supabase'
import { calcularCompletude } from '@/lib/diagnostico/completude'
import { Drawer } from '@/components/layout/Drawer'

export function FiliadaDetalhe({ empreendimentoId }: { empreendimentoId: string }) {
  const [emp, setEmp] = useState<Empreendimento | null>(null)
  const [estadual, setEstadual] = useState<UnisolEstadual | null>(null)
  const [versoes, setVersoes] = useState<Diagnostico[]>([])
  const [idsComAnexoA, setIdsComAnexoA] = useState<Set<string>>(new Set())
  const [urlAnexo, setUrlAnexo] = useState<Record<string, string>>({})
  const [carregando, setCarregando] = useState(true)
  const [iniciando, setIniciando] = useState(false)
  const [drawer, setDrawer] = useState(false)

  async function carregar() {
    setCarregando(true)
    const sb = getSupabase()
    const { data: dadosEmp } = await sb.from('empreendimentos').select('*').eq('id', empreendimentoId).single()
    setEmp(dadosEmp as Empreendimento)

    if (dadosEmp?.unisol_estadual_id) {
      const { data: dadosEst } = await sb.from('unisol_estaduais').select('*').eq('id', dadosEmp.unisol_estadual_id).single()
      setEstadual(dadosEst as UnisolEstadual)
    } else {
      setEstadual(null)
    }

    const { data: diags } = await sb
      .from('diagnosticos')
      .select('*')
      .eq('empreendimento_id', empreendimentoId)
      .order('versao', { ascending: false })
    const lista = (diags as Diagnostico[]) || []
    setVersoes(lista)

    if (lista.length > 0) {
      const { data: docs } = await sb
        .from('documentos_institucionais')
        .select('entidade_id, storage_path')
        .eq('entidade_tipo', 'diagnostico')
        .in('entidade_id', lista.map(d => d.id))
      const docsLista = (docs as { entidade_id: string; storage_path: string }[]) || []
      setIdsComAnexoA(new Set(docsLista.map(d => d.entidade_id)))

      const urls: Record<string, string> = {}
      for (const doc of docsLista) {
        const { data } = await sb.storage.from('documentos-institucionais').createSignedUrl(doc.storage_path, 3600)
        if (data) urls[doc.entidade_id] = data.signedUrl
      }
      setUrlAnexo(urls)
    }
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [empreendimentoId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function iniciarDiagnostico() {
    setIniciando(true)
    const sb = getSupabase()
    const { data: sessao } = await sb.auth.getSession()
    const userId = sessao.session?.user.id
    if (!userId) { alert('Sessão expirada, faça login de novo.'); setIniciando(false); return }
    const novoId = crypto.randomUUID()
    const { error } = await sb.from('diagnosticos').insert({
      id: novoId,
      empreendimento_id: empreendimentoId,
      aplicador_id: userId,
      status: 'rascunho',
      versao: 1,
      respostas: {},
      analise_tecnica: {},
    })
    if (error) { alert(`Erro ao criar diagnóstico: ${error.message}`); setIniciando(false); return }
    window.location.href = `/diagnosticos?id=${novoId}`
  }

  const atual = versoes[0]

  if (carregando) return <p className="text-sm text-gray-400">Carregando…</p>
  if (!emp) return <p className="text-sm text-red-500">Filiada não encontrada.</p>

  const completude = atual ? calcularCompletude(atual, emp, idsComAnexoA.has(atual.id)) : null

  return (
    <div className="max-w-3xl mx-auto lg:mx-0 space-y-6">
      <div>
        <a href="/filiadas" className="text-xs text-gray-400 hover:text-gray-600">← Filiadas</a>
        <h1 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{emp.nome_fantasia || emp.razao_social || 'Sem nome'}</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div><span className="text-gray-400 text-xs block">Razão social</span>{emp.razao_social || '—'}</div>
          <div><span className="text-gray-400 text-xs block">CNPJ</span>{emp.cnpj || '—'}</div>
          <div><span className="text-gray-400 text-xs block">Município/UF</span>{emp.municipio}{emp.uf ? `/${emp.uf}` : ''}</div>
          <div><span className="text-gray-400 text-xs block">Forma organizativa</span>{emp.forma_organizativa || '—'}</div>
          <div>
            <span className="text-gray-400 text-xs block">Filiação</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {emp.vinculacao_unisol === 'filiado' && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: '#A8D5B5', color: '#134529' }}>Nacional</span>
              )}
              {estadual && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: '#dbeafe', color: '#1d4ed8' }}>{estadual.nome}</span>
              )}
              {emp.vinculacao_unisol !== 'filiado' && !estadual && <span className="text-xs text-gray-400">—</span>}
            </div>
          </div>
          <div><span className="text-gray-400 text-xs block">Pessoa de referência</span>{emp.pessoa_referencia_nome || '—'}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--primary)' }}>Diagnóstico</h2>
        {!atual ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Nenhum diagnóstico iniciado ainda.</p>
            <button onClick={iniciarDiagnostico} disabled={iniciando}
              className="text-sm font-medium text-white rounded-lg px-4 py-2 disabled:opacity-50" style={{ background: 'var(--primary)' }}>
              {iniciando ? 'Criando…' : 'Iniciar Diagnóstico'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900 font-medium">
                {completude!.pct}% <span className="text-gray-400 font-normal">({completude!.feitas}/{completude!.total})</span>
                {atual.rotulo_versao ? <span className="text-gray-400 font-normal"> · {atual.rotulo_versao}</span> : null}
              </p>
              <p className="text-xs text-gray-400">Status: {atual.status}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => window.location.href = `/diagnosticos?id=${atual.id}`}
                className="text-sm font-medium rounded-lg px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50">
                Editar
              </button>
              {completude!.pct === 100 && (
                <button onClick={() => setDrawer(true)}
                  className="text-sm font-medium text-white rounded-lg px-4 py-2" style={{ background: 'var(--primary)' }}>
                  Atualizar diagnóstico
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {versoes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--primary)' }}>Histórico de atualizações</h2>
          <div className="space-y-3">
            {versoes.map(v => {
              const c = calcularCompletude(v, emp, idsComAnexoA.has(v.id))
              return (
                <div key={v.id} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {v.rotulo_versao || `Versão ${v.versao}`} <span className="text-gray-400 font-normal text-xs">— {new Date(v.created_at).toLocaleDateString('pt-BR')}</span>
                    </p>
                    <span className="text-xs text-gray-500">{c.pct}% ({c.feitas}/{c.total})</span>
                  </div>
                  {v.relato_versao && <p className="text-xs text-gray-500 mt-1">{v.relato_versao}</p>}
                  <div className="flex gap-3 mt-1">
                    <a href={`/diagnosticos?id=${v.id}`} className="text-xs font-medium hover:opacity-80" style={{ color: 'var(--primary)' }}>Ver diagnóstico</a>
                    {urlAnexo[v.id] && (
                      <a href={urlAnexo[v.id]} target="_blank" rel="noreferrer" className="text-xs font-medium hover:opacity-80" style={{ color: 'var(--primary)' }}>
                        Relatório anexado
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {atual && (
        <AtualizarDiagnosticoDrawer
          aberto={drawer} onFechar={() => setDrawer(false)}
          empreendimentoId={empreendimentoId} diagnosticoAtual={atual}
          onAtualizado={novoId => window.location.href = `/diagnosticos?id=${novoId}`}
        />
      )}
    </div>
  )
}

function AtualizarDiagnosticoDrawer({
  aberto, onFechar, empreendimentoId, diagnosticoAtual, onAtualizado,
}: {
  aberto: boolean
  onFechar: () => void
  empreendimentoId: string
  diagnosticoAtual: Diagnostico
  onAtualizado: (novoId: string) => void
}) {
  const [rotulo, setRotulo] = useState('')
  const [relato, setRelato] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    const sb = getSupabase()
    const { data: sessao } = await sb.auth.getSession()
    const userId = sessao.session?.user.id
    if (!userId) { setErro('Sessão expirada, faça login de novo.'); setSalvando(false); return }

    const novoId = crypto.randomUUID()
    const { error: erroDiag } = await sb.from('diagnosticos').insert({
      id: novoId,
      empreendimento_id: empreendimentoId,
      aplicador_id: userId,
      status: 'rascunho',
      versao: diagnosticoAtual.versao + 1,
      rotulo_versao: rotulo || null,
      relato_versao: relato || null,
      respostas: diagnosticoAtual.respostas,
      analise_tecnica: diagnosticoAtual.analise_tecnica,
    })
    if (erroDiag) { setErro(erroDiag.message); setSalvando(false); return }

    if (arquivo) {
      const path = `diagnostico/${novoId}/${crypto.randomUUID()}-${arquivo.name}`
      const { error: erroUpload } = await sb.storage.from('documentos-institucionais').upload(path, arquivo)
      if (!erroUpload) {
        await sb.from('documentos_institucionais').insert({
          entidade_tipo: 'diagnostico',
          entidade_id: novoId,
          tipo_documento: 'relatorio_evolucao',
          nome_arquivo: arquivo.name,
          storage_path: path,
          observacao: relato || null,
          uploaded_by: userId,
        })
      }
    }

    setSalvando(false)
    onAtualizado(novoId)
  }

  return (
    <Drawer open={aberto} onClose={onFechar} title="Atualizar diagnóstico">
      <form onSubmit={salvar} className="space-y-4">
        <p className="text-xs text-gray-400">
          Cria uma nova versão do diagnóstico deste Filiado (versão {diagnosticoAtual.versao} → {diagnosticoAtual.versao + 1}), a partir das respostas atuais.
        </p>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Rótulo da versão (ex: T1-2027)</label>
          <input value={rotulo} onChange={e => setRotulo(e.target.value)} placeholder="T1-2027"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Relato da evolução</label>
          <textarea rows={3} value={relato} onChange={e => setRelato(e.target.value)}
            placeholder="O que mudou desde a versão anterior…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Relatório anexo (opcional)</label>
          <input type="file" onChange={e => setArquivo(e.target.files?.[0] || null)} className="w-full text-sm" />
        </div>
        {erro && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{erro}</p>}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onFechar} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={salvando}
            className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50" style={{ background: 'var(--primary)' }}>
            {salvando ? 'Criando…' : 'Criar nova versão'}
          </button>
        </div>
      </form>
    </Drawer>
  )
}
