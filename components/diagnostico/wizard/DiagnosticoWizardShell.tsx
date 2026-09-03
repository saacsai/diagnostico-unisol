'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Diagnostico, Empreendimento, Usuario } from '@/lib/supabase'
import { secaoAtual } from '@/lib/diagnostico/secoesConfig'
import { calcularCompletude } from '@/lib/diagnostico/completude'
import { useAutosaveDiagnostico } from '@/lib/diagnostico/useAutosave'
import { SidebarSecoes } from './SidebarSecoes'
import { renderSecao } from './renderSecao'

export function DiagnosticoWizardShell({ diagnosticoId }: { diagnosticoId: string }) {
  const [carregando, setCarregando] = useState(true)
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null)
  const [empreendimento, setEmpreendimento] = useState<Empreendimento | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [secaoId, setSecaoId] = useState('secao01')
  const [respostas, setRespostas] = useState<Record<string, unknown>>({})
  const [analiseTecnica, setAnaliseTecnica] = useState<Record<string, unknown>>({})
  const [temAnexoA, setTemAnexoA] = useState(false)

  const { status, salvarRespostas, salvarAnaliseTecnica } = useAutosaveDiagnostico(diagnosticoId)

  useEffect(() => {
    async function carregar() {
      const sb = getSupabase()
      const { data: sessao } = await sb.auth.getSession()
      const userId = sessao.session?.user.id
      const [{ data: diag }, { data: userRow }] = await Promise.all([
        sb.from('diagnosticos').select('*').eq('id', diagnosticoId).single(),
        userId ? sb.from('usuarios').select('*').eq('id', userId).single() : Promise.resolve({ data: null }),
      ])
      if (diag) {
        setDiagnostico(diag as Diagnostico)
        setRespostas((diag.respostas as Record<string, unknown>) || {})
        setAnaliseTecnica((diag.analise_tecnica as Record<string, unknown>) || {})
        const { data: emp } = await sb.from('empreendimentos').select('*').eq('id', diag.empreendimento_id).single()
        setEmpreendimento(emp as Empreendimento)
        const { count } = await sb.from('documentos_institucionais').select('id', { count: 'exact', head: true })
          .eq('entidade_tipo', 'diagnostico').eq('entidade_id', diagnosticoId)
        setTemAnexoA(!!count && count > 0)
      }
      setUsuario(userRow as Usuario)
      setCarregando(false)
    }
    carregar()
  }, [diagnosticoId])

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
  if (!diagnostico) return <div className="p-8 text-sm text-red-500">Diagnóstico não encontrado.</div>

  const { completas } = calcularCompletude({ respostas, analise_tecnica: analiseTecnica }, empreendimento, temAnexoA)

  const cfg = secaoAtual(secaoId)
  const perfilUsuario = usuario?.perfil ?? 'aplicador'

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
          <SyncBadge status={status} />
          <a href="/diagnosticos" className="text-xs text-gray-400 hover:text-gray-600">Fechar</a>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        <SidebarSecoes ativa={secaoId} onSelecionar={setSecaoId} completas={completas} perfilUsuario={perfilUsuario} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
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

function SyncBadge({ status }: { status: string }) {
  const map: Record<string, { texto: string; cor: string }> = {
    idle: { texto: '', cor: '#9ca3af' },
    salvando: { texto: 'Salvando…', cor: '#9ca3af' },
    salvo: { texto: 'Salvo', cor: 'var(--primary)' },
    erro: { texto: 'Erro ao salvar', cor: '#dc2626' },
  }
  const s = map[status] ?? map.idle
  if (!s.texto) return null
  return <span className="text-[11px] font-medium" style={{ color: s.cor }}>{s.texto}</span>
}
