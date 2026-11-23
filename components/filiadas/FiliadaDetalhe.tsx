'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Empreendimento, Diagnostico, Usuario } from '@/lib/supabase'
import { getDB } from '@/lib/offline/db'
import { calcularCompletude } from '@/lib/diagnostico/completude'
import { calcularMaturidadeComercial, MATURIDADE_LABEL, MATURIDADE_COR } from '@/lib/diagnostico/maturidadeComercial'
import { rotuloVersao, validarDiagnostico, enviarParaValidacao, cancelarEnvioValidacao } from '@/lib/diagnostico/validacao'
import { SecaoBloco0Identificacao } from '@/components/diagnostico/secoes/SecaoBloco0Identificacao'
import { RelatorioDiagnostico } from '@/components/diagnostico/relatorio/RelatorioDiagnostico'

export function FiliadaDetalhe({ empreendimentoId }: { empreendimentoId: string }) {
  const [emp, setEmp] = useState<Empreendimento | null>(null)
  const [versoes, setVersoes] = useState<Diagnostico[]>([])
  const [idsComAnexoA, setIdsComAnexoA] = useState<Set<string>>(new Set())
  const [urlAnexo, setUrlAnexo] = useState<Record<string, string>>({})
  const [nomesPorUsuario, setNomesPorUsuario] = useState<Record<string, string>>({})
  const [meuPerfil, setMeuPerfil] = useState<Usuario['perfil'] | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [iniciando, setIniciando] = useState(false)
  const [processando, setProcessando] = useState(false)
  const [erroAcao, setErroAcao] = useState('')
  const [relatorioAberto, setRelatorioAberto] = useState<Diagnostico | null>(null)

  const souAdmin = meuPerfil === 'admin'
  const podeSubmeter = meuPerfil === 'tecnico' || meuPerfil === 'admin'

  async function carregar() {
    setCarregando(true)
    const sb = getSupabase()
    const { data: sessao } = await sb.auth.getSession()
    if (sessao.session) {
      const { data: usuarioAtual } = await sb.from('usuarios').select('perfil').eq('id', sessao.session.user.id).single()
      setMeuPerfil((usuarioAtual as Pick<Usuario, 'perfil'> | null)?.perfil ?? null)
    }

    const { data: dadosEmp } = await sb.from('empreendimentos').select('*').eq('id', empreendimentoId).single()
    setEmp(dadosEmp as Empreendimento)
    // useAutosaveEmpreendimento grava via Dexie .update(), que só funciona se o registro já
    // existir localmente — sem isso, editar um empreendimento nunca aberto antes neste
    // navegador (ex: um dos 151 importados da planilha real) falha em silêncio ao salvar.
    if (dadosEmp) await getDB().empreendimentos.put(dadosEmp as Empreendimento)

    const { data: diags } = await sb
      .from('diagnosticos')
      .select('*')
      .eq('empreendimento_id', empreendimentoId)
      .order('versao', { ascending: false })
    const lista = (diags as Diagnostico[]) || []
    setVersoes(lista)

    const idsPessoas = Array.from(new Set(
      lista.flatMap(d => [d.validado_por, d.enviado_por]).filter((id): id is string => !!id)
    ))
    if (idsPessoas.length > 0) {
      const { data: usuariosNomeados } = await sb.from('usuarios').select('id, nome').in('id', idsPessoas)
      const mapa: Record<string, string> = {}
      for (const u of (usuariosNomeados as Pick<Usuario, 'id' | 'nome'>[] | null) || []) mapa[u.id] = u.nome
      setNomesPorUsuario(mapa)
    }

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

  async function validar(diagnosticoId: string) {
    setProcessando(true)
    setErroAcao('')
    const resultado = await validarDiagnostico(diagnosticoId)
    if ('error' in resultado) { setErroAcao(resultado.error); setProcessando(false); return }
    setProcessando(false)
    await carregar()
  }

  async function enviar(diagnosticoId: string) {
    if (!confirm('Ao enviar, as respostas atuais vão para validação da diretoria e a edição trava até a decisão. Confirma o envio?')) return
    setProcessando(true)
    setErroAcao('')
    const resultado = await enviarParaValidacao(diagnosticoId)
    if ('error' in resultado) { setErroAcao(resultado.error); setProcessando(false); return }
    setProcessando(false)
    await carregar()
  }

  async function cancelarEnvio(diagnosticoId: string) {
    if (!confirm('Cancelar o envio? O diagnóstico volta a ficar editável, sem gerar nenhuma versão.')) return
    setProcessando(true)
    setErroAcao('')
    const resultado = await cancelarEnvioValidacao(diagnosticoId)
    if ('error' in resultado) { setErroAcao(resultado.error); setProcessando(false); return }
    setProcessando(false)
    await carregar()
  }

  async function alternarCongelamento() {
    if (!emp) return
    const novoValor = !(emp.diagnostico_liberado === false)
    const sb = getSupabase()
    const { error } = await sb.from('empreendimentos').update({ diagnostico_liberado: novoValor }).eq('id', emp.id)
    if (error) { alert(`Erro ao atualizar: ${error.message}`); return }
    setEmp({ ...emp, diagnostico_liberado: novoValor })
  }

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
  const maturidade = atual ? calcularMaturidadeComercial(atual.respostas) : null

  return (
    <div className="max-w-3xl mx-auto lg:mx-0 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <a href="/filiadas" className="text-xs text-gray-400 hover:text-gray-600">← Filiadas</a>
          <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            {emp.nome_fantasia || emp.razao_social || 'Sem nome'}
            {emp.diagnostico_liberado === false && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">🔒 Congelado</span>
            )}
          </h1>
        </div>
        <button onClick={alternarCongelamento}
          className="text-xs font-medium rounded-lg px-3 py-1.5 border border-gray-200 text-gray-500 hover:bg-gray-50 flex-shrink-0">
          {emp.diagnostico_liberado === false ? 'Descongelar diagnóstico' : 'Congelar diagnóstico'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--primary)' }}>Cadastro</h2>
        <SecaoBloco0Identificacao empreendimento={emp} onChange={setEmp} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--primary)' }}>Diagnóstico</h2>
        {!atual ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {emp.diagnostico_liberado === false ? 'Diagnóstico congelado — descongele pra iniciar.' : 'Nenhum diagnóstico iniciado ainda.'}
            </p>
            <button onClick={iniciarDiagnostico} disabled={iniciando || emp.diagnostico_liberado === false}
              className="text-sm font-medium text-white rounded-lg px-4 py-2 disabled:opacity-50" style={{ background: 'var(--primary)' }}>
              {iniciando ? 'Criando…' : 'Iniciar Diagnóstico'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900 font-medium">
                {completude!.pct}% <span className="text-gray-400 font-normal">({completude!.feitas}/{completude!.total})</span>
                <span className="text-gray-400 font-normal"> · {rotuloVersao(atual)}</span>
                {atual.validado_em ? (
                  <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Validado</span>
                ) : atual.enviado_em ? (
                  <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Aguardando validação da diretoria</span>
                ) : null}
              </p>
              {maturidade?.nivel && (
                <p className="mt-1.5">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: MATURIDADE_COR[maturidade.nivel].bg, color: MATURIDADE_COR[maturidade.nivel].cor }}
                    title={maturidade.motivo}>
                    Maturidade comercial: {MATURIDADE_LABEL[maturidade.nivel]}
                  </span>
                </p>
              )}
              {erroAcao && <p className="text-xs text-red-600 mt-1">{erroAcao}</p>}
            </div>
            <div className="flex gap-2">
              {atual.validado_em || atual.enviado_em ? (
                <button onClick={() => setRelatorioAberto(atual)}
                  className="text-sm font-medium rounded-lg px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50">
                  Ver / imprimir
                </button>
              ) : (
                <button onClick={() => window.location.href = `/diagnosticos?id=${atual.id}`}
                  disabled={emp.diagnostico_liberado === false}
                  className="text-sm font-medium rounded-lg px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Editar
                </button>
              )}
              {!atual.validado_em && atual.enviado_em && podeSubmeter && (
                <button onClick={() => cancelarEnvio(atual.id)} disabled={processando}
                  className="text-sm font-medium rounded-lg px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                  Cancelar envio
                </button>
              )}
              {completude!.pct === 100 && !atual.enviado_em && !atual.validado_em && podeSubmeter && emp.diagnostico_liberado !== false && (
                <button onClick={() => enviar(atual.id)} disabled={processando}
                  className="text-sm font-medium rounded-lg px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                  {processando ? 'Enviando…' : 'Enviar para validação'}
                </button>
              )}
              {atual.enviado_em && !atual.validado_em && souAdmin && (
                <button onClick={() => validar(atual.id)} disabled={processando}
                  className="text-sm font-medium text-white rounded-lg px-4 py-2 disabled:opacity-50" style={{ background: 'var(--primary)' }}>
                  {processando ? 'Validando…' : 'Validar diagnóstico'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {versoes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--primary)' }}>Linha do tempo</h2>
          <div className="space-y-3">
            {versoes.map(v => {
              const c = calcularCompletude(v, emp, idsComAnexoA.has(v.id))
              return (
                <div key={v.id} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {rotuloVersao(v)}
                      {v.validado_em ? (
                        <span className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">Validado</span>
                      ) : v.enviado_em ? (
                        <span className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Aguardando validação</span>
                      ) : (
                        <span className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">Em andamento</span>
                      )}
                    </p>
                    <span className="text-xs text-gray-500">{c.pct}% ({c.feitas}/{c.total})</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                    {v.completo_em && <p>Completo em {new Date(v.completo_em).toLocaleString('pt-BR')}</p>}
                    {v.enviado_em && (
                      <p>Enviado por {(v.enviado_por && nomesPorUsuario[v.enviado_por]) || 'técnico'} em {new Date(v.enviado_em).toLocaleString('pt-BR')}</p>
                    )}
                    {v.validado_em && (
                      <p>Validado por {(v.validado_por && nomesPorUsuario[v.validado_por]) || 'administrador'} em {new Date(v.validado_em).toLocaleString('pt-BR')}</p>
                    )}
                  </div>
                  {v.relato_versao && <p className="text-xs text-gray-500 mt-1">{v.relato_versao}</p>}
                  <div className="flex gap-3 mt-1">
                    <button onClick={() => setRelatorioAberto(v)} className="text-xs font-medium hover:opacity-80" style={{ color: 'var(--primary)' }}>
                      Ver / imprimir
                    </button>
                    {!v.validado_em && !v.enviado_em && (
                      <a href={`/diagnosticos?id=${v.id}`} className="text-xs font-medium hover:opacity-80" style={{ color: 'var(--primary)' }}>Editar</a>
                    )}
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

      {relatorioAberto && emp && (
        <RelatorioDiagnostico
          diagnostico={relatorioAberto}
          empreendimento={emp}
          enviadoPorNome={(relatorioAberto.enviado_por && nomesPorUsuario[relatorioAberto.enviado_por]) || null}
          validadoPorNome={(relatorioAberto.validado_por && nomesPorUsuario[relatorioAberto.validado_por]) || null}
          onFechar={() => setRelatorioAberto(null)}
        />
      )}

    </div>
  )
}
