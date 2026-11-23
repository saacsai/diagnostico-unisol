'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Diagnostico, Empreendimento, Usuario } from '@/lib/supabase'
import { getDB, DiagnosticoLocal, EmpreendimentoLocal } from '@/lib/offline/db'
import { secaoAtual } from '@/lib/diagnostico/secoesConfig'
import { calcularCompletude } from '@/lib/diagnostico/completude'
import { rotuloVersao, enviarParaValidacao, cancelarEnvioValidacao } from '@/lib/diagnostico/validacao'
import { useAutosaveDiagnostico } from '@/lib/diagnostico/useAutosave'
import { SyncStatusBadge } from '@/components/layout/SyncStatusBadge'
import { SidebarSecoes } from './SidebarSecoes'
import { renderSecao } from './renderSecao'

function estaOnline() {
  return typeof navigator === 'undefined' || navigator.onLine
}

// Dexie-primeiro: lê o que já existe localmente na hora (funciona sem sinal); se online,
// também busca do Supabase e mescla — mas nunca sobrescreve um campo com edição local ainda
// não sincronizada (_dirty*). Se offline e nada local, devolve null (shell mostra aviso).
async function carregarDoDexieOuSupabase(diagnosticoId: string) {
  const db = getDB()
  const localDiag = await db.diagnosticos.get(diagnosticoId)
  let diag: DiagnosticoLocal | null = localDiag ?? null
  let temAnexoA = false

  if (estaOnline()) {
    try {
      const sb = getSupabase()
      const { data: remoto } = await sb.from('diagnosticos').select('*').eq('id', diagnosticoId).single()
      if (remoto) {
        const mesclado: DiagnosticoLocal = {
          ...(remoto as Diagnostico),
          respostas: localDiag?._dirtyRespostas ? localDiag.respostas : remoto.respostas,
          analise_tecnica: localDiag?._dirtyAnaliseTecnica ? localDiag.analise_tecnica : remoto.analise_tecnica,
          _dirtyRespostas: localDiag?._dirtyRespostas,
          _dirtyAnaliseTecnica: localDiag?._dirtyAnaliseTecnica,
        }
        await db.diagnosticos.put(mesclado)
        diag = mesclado
      }
      const { count } = await sb.from('documentos_institucionais').select('id', { count: 'exact', head: true })
        .eq('entidade_tipo', 'diagnostico').eq('entidade_id', diagnosticoId)
      temAnexoA = !!count && count > 0
    } catch {
      // navigator.onLine mentiu (sinal fraco) — segue só com o que já tinha local
    }
  }

  if (!diag) return { diagnostico: null, empreendimento: null, temAnexoA: false }

  const localEmp = await db.empreendimentos.get(diag.empreendimento_id)
  let emp: EmpreendimentoLocal | null = localEmp ?? null
  if (estaOnline()) {
    try {
      const { data: remotoEmp } = await getSupabase().from('empreendimentos').select('*').eq('id', diag.empreendimento_id).single()
      if (remotoEmp) {
        const mesclado: EmpreendimentoLocal = localEmp?._dirty ? localEmp : { ...(remotoEmp as Empreendimento) }
        await db.empreendimentos.put(mesclado)
        emp = mesclado
      }
    } catch { /* idem — segue local */ }
  }

  return { diagnostico: diag, empreendimento: emp, temAnexoA }
}

export function DiagnosticoWizardShell({ diagnosticoId }: { diagnosticoId: string }) {
  const [carregando, setCarregando] = useState(true)
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null)
  const [empreendimento, setEmpreendimento] = useState<Empreendimento | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [secaoId, setSecaoId] = useState('parteA')
  const [respostas, setRespostas] = useState<Record<string, unknown>>({})
  const [analiseTecnica, setAnaliseTecnica] = useState<Record<string, unknown>>({})
  const [temAnexoA, setTemAnexoA] = useState(false)
  const [processandoEnvio, setProcessandoEnvio] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')

  const { salvarRespostas, salvarAnaliseTecnica } = useAutosaveDiagnostico(diagnosticoId)

  useEffect(() => {
    async function carregar() {
      const { diagnostico: diag, empreendimento: emp, temAnexoA: anexo } = await carregarDoDexieOuSupabase(diagnosticoId)
      if (diag) {
        setDiagnostico(diag)
        setRespostas((diag.respostas as Record<string, unknown>) || {})
        setAnaliseTecnica((diag.analise_tecnica as Record<string, unknown>) || {})
        setEmpreendimento(emp)
        setTemAnexoA(anexo)
      }

      const sb = getSupabase()
      const cache = await getDB().sessaoUsuario.get('atual').catch(() => undefined)
      try {
        const { data: sessao } = await sb.auth.getSession()
        const userId = sessao.session?.user.id
        const { data: userRow } = userId
          ? await sb.from('usuarios').select('*').eq('id', userId).single()
          : { data: null }
        setUsuario((userRow as Usuario) || (cache ? { id: cache.usuarioId, nome: cache.nome, perfil: cache.perfil, email: '', instituicao: null, unisol_estadual_id: null, tecnico_id: null, ativo: true, created_at: '' } : null))
      } catch {
        setUsuario(cache ? { id: cache.usuarioId, nome: cache.nome, perfil: cache.perfil, email: '', instituicao: null, unisol_estadual_id: null, tecnico_id: null, ativo: true, created_at: '' } : null)
      }

      setCarregando(false)
    }
    carregar()
  }, [diagnosticoId])

  async function recarregarEnvio() {
    const sb = getSupabase()
    const { data } = await sb.from('diagnosticos').select('enviado_em, enviado_por, validado_em, validado_por').eq('id', diagnosticoId).single()
    if (data) setDiagnostico(d => d ? { ...d, ...data } : d)
  }

  async function enviarDiagnostico() {
    if (!confirm('Ao enviar, as respostas atuais vão para validação da diretoria e a edição trava até a decisão. Confirma o envio?')) return
    setProcessandoEnvio(true)
    setErroEnvio('')
    const resultado = await enviarParaValidacao(diagnosticoId)
    if ('error' in resultado) { setErroEnvio(resultado.error); setProcessandoEnvio(false); return }
    await recarregarEnvio()
    setProcessandoEnvio(false)
  }

  async function cancelarEnvioDiagnostico() {
    if (!confirm('Cancelar o envio? O diagnóstico volta a ficar editável, sem gerar nenhuma versão.')) return
    setProcessandoEnvio(true)
    setErroEnvio('')
    const resultado = await cancelarEnvioValidacao(diagnosticoId)
    if ('error' in resultado) { setErroEnvio(resultado.error); setProcessandoEnvio(false); return }
    await recarregarEnvio()
    setProcessandoEnvio(false)
  }

  const atualizarSecaoRespostas = useCallback((id: string, dados: unknown) => {
    setRespostas(prev => {
      const novo = { ...prev, [id]: dados }
      salvarRespostas(novo)
      return novo
    })
  }, [salvarRespostas])

  const atualizarSecaoAnalise = useCallback((id: string, dados: unknown) => {
    setAnaliseTecnica(prev => {
      const novo = { ...prev, [id]: dados }
      salvarAnaliseTecnica(novo)
      return novo
    })
  }, [salvarAnaliseTecnica])

  const atualizarEmpreendimento = useCallback((novo: Empreendimento) => {
    setEmpreendimento(novo)
  }, [])

  if (carregando) return <div className="p-8 text-sm text-gray-400">Carregando…</div>
  if (!diagnostico) return (
    <div className="p-8 text-sm text-red-500">
      {estaOnline()
        ? 'Diagnóstico não encontrado.'
        : 'Este diagnóstico ainda não está salvo neste aparelho. Abra-o com internet ao menos uma vez antes de ir a campo.'}
    </div>
  )

  if (empreendimento && empreendimento.diagnostico_liberado === false) return (
    <div className="p-8 max-w-md">
      <p className="text-sm font-medium text-gray-900 mb-1">Diagnóstico congelado</p>
      <p className="text-sm text-gray-500">
        O diagnóstico de {empreendimento.nome_fantasia || empreendimento.razao_social || 'esta Filiada'} está
        temporariamente congelado e não pode ser editado agora. Os dados já preenchidos continuam salvos —
        fale com a coordenação se precisar reabrir.
      </p>
      <a href="/diagnosticos" className="inline-block mt-4 text-xs text-gray-400 hover:text-gray-600">← Voltar</a>
    </div>
  )

  const { completas, pct } = calcularCompletude({ respostas, analise_tecnica: analiseTecnica }, empreendimento, temAnexoA)

  const cfg = secaoAtual(secaoId)
  const perfilUsuario = usuario?.perfil ?? 'aplicador'
  const podeSubmeter = perfilUsuario === 'tecnico' || perfilUsuario === 'admin'

  // Fica no rodapé da lista de seções (depois do último ticket verdinho) — ponto mais didático
  // de "terminei, posso enviar" do que escondido dentro do conteúdo do Anexo B (Luciano, 2026-11-23).
  const rodapeEnvio = (
    <div>
      <p className="text-xs text-gray-900 font-medium">
        {pct}% preenchido <span className="text-gray-400 font-normal">· {rotuloVersao(diagnostico)}</span>
      </p>
      {diagnostico.validado_em ? (
        <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Validado</span>
      ) : diagnostico.enviado_em ? (
        <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Aguardando validação da diretoria</span>
      ) : null}
      {erroEnvio && <p className="text-xs text-red-600 mt-1">{erroEnvio}</p>}
      <div className="flex flex-col gap-2 mt-2">
        {!diagnostico.validado_em && diagnostico.enviado_em && podeSubmeter && (
          <button onClick={cancelarEnvioDiagnostico} disabled={processandoEnvio}
            className="text-xs font-medium rounded-lg px-3 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Cancelar envio
          </button>
        )}
        {pct === 100 && !diagnostico.enviado_em && !diagnostico.validado_em && podeSubmeter && (
          <button onClick={enviarDiagnostico} disabled={processandoEnvio || !estaOnline()}
            title={!estaOnline() ? 'Precisa de conexão pra enviar' : undefined}
            className="text-xs font-medium rounded-lg px-3 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            {processandoEnvio ? 'Enviando…' : 'Enviar para validação'}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="h-[calc(100vh-56px)] lg:h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--primary)' }}>
            {empreendimento?.nome_fantasia || empreendimento?.razao_social || 'Novo diagnóstico'}
          </p>
          <p className="text-[11px] text-gray-400">Status: {diagnostico.status}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <SyncStatusBadge />
          <a href="/diagnosticos" className="text-xs text-gray-400 hover:text-gray-600">Fechar</a>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        <SidebarSecoes ativa={secaoId} onSelecionar={setSecaoId} completas={completas} perfilUsuario={perfilUsuario} rodape={rodapeEnvio} />

        {/* pb-[88px] reserva espaço pra MobileTabBar (56px + respiro) não cobrir o fim do
            conteúdo ao rolar — a barra é fixed, então quem precisa da folga é a área de
            rolagem, não a altura do container. */}
        <main className="flex-1 overflow-y-auto p-4 pb-[88px] md:p-6 lg:pb-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-base font-bold text-gray-900 mb-4">
              Seção {cfg.numero} — {cfg.titulo}
            </h1>
            {cfg.perfil === 'tecnico' && perfilUsuario === 'aplicador' ? (
              <p className="text-sm text-gray-400 bg-gray-50 border border-gray-100 rounded-lg p-4">
                Esta seção é preenchida pela equipe técnica após a entrevista.
              </p>
            ) : (
              renderSecao(cfg.id, {
                diagnosticoId,
                empreendimento,
                setEmpreendimento: atualizarEmpreendimento,
                respostas,
                analiseTecnica,
                setRespostaSecao: atualizarSecaoRespostas,
                setAnaliseSecao: atualizarSecaoAnalise,
              })
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
