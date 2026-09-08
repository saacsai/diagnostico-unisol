'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Tecnico, Empreendimento, TecnicoEmpreendimentoProjeto } from '@/lib/supabase'
import { Drawer } from '@/components/layout/Drawer'

type Atribuicao = TecnicoEmpreendimentoProjeto & { tecnicos: Tecnico | null; empreendimentos: Empreendimento | null }

export function AtribuicoesProjeto({ projetoId }: { projetoId: string }) {
  const [lista, setLista] = useState<Atribuicao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [drawer, setDrawer] = useState(false)

  async function carregar() {
    setCarregando(true)
    const { data } = await getSupabase()
      .from('tecnico_empreendimento_projeto')
      .select('*, tecnicos(*), empreendimentos(*)')
      .eq('projeto_id', projetoId)
      .order('created_at')
    setLista((data as Atribuicao[]) || [])
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [projetoId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function remover(id: string) {
    if (!confirm('Remover essa atribuição?')) return
    await getSupabase().from('tecnico_empreendimento_projeto').delete().eq('id', id)
    carregar()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Atribuições</h2>
          <p className="text-xs text-gray-400 mt-0.5">Quem da Equipe é responsável por qual Filiada neste projeto.</p>
        </div>
        <button onClick={() => setDrawer(true)} className="text-xs font-medium text-white rounded-lg px-3 py-1.5" style={{ background: 'var(--primary)' }}>
          + Atribuir Filiada
        </button>
      </div>

      {carregando ? (
        <p className="text-xs text-gray-400">Carregando…</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Técnico</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Filiada</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Data</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {lista.map(a => (
                <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-3 py-2 font-medium text-gray-900">{a.tecnicos?.nome || '(removido)'}</td>
                  <td className="px-3 py-2 text-gray-500">{a.empreendimentos?.nome_fantasia || a.empreendimentos?.razao_social || '(removida)'}</td>
                  <td className="px-3 py-2 text-gray-500">{new Date(a.data_atribuicao).toLocaleDateString('pt-BR')}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => remover(a.id)} className="text-xs font-medium text-red-600 hover:opacity-80">Remover</button>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-xs text-gray-400">Nenhuma atribuição ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AtribuirDrawer projetoId={projetoId} aberto={drawer} onFechar={() => setDrawer(false)} onAtribuido={carregar} />
    </div>
  )
}

function AtribuirDrawer({
  projetoId, aberto, onFechar, onAtribuido,
}: {
  projetoId: string
  aberto: boolean
  onFechar: () => void
  onAtribuido: () => void
}) {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([])
  const [tecnicoId, setTecnicoId] = useState('')
  const [empreendimentoId, setEmpreendimentoId] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true)

  useEffect(() => {
    if (!aberto) return
    setTecnicoId(''); setEmpreendimentoId(''); setErro(''); setCarregandoOpcoes(true)
    const sb = getSupabase()
    Promise.all([
      sb.from('equipe_projeto').select('tecnicos(*)').eq('projeto_id', projetoId),
      sb.from('empreendimento_projeto').select('empreendimentos(*)').eq('projeto_id', projetoId),
    ]).then(([{ data: eq }, { data: vinc }]) => {
      setTecnicos((eq as unknown as { tecnicos: Tecnico | null }[] || []).map(v => v.tecnicos).filter((t): t is Tecnico => !!t))
      setEmpreendimentos((vinc as unknown as { empreendimentos: Empreendimento | null }[] || []).map(v => v.empreendimentos).filter((e): e is Empreendimento => !!e))
      setCarregandoOpcoes(false)
    })
  }, [aberto, projetoId])

  async function atribuir(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!tecnicoId || !empreendimentoId) { setErro('Selecione o técnico e a Filiada.'); return }
    setSalvando(true)
    const { error } = await getSupabase().from('tecnico_empreendimento_projeto').insert({
      tecnico_id: tecnicoId, empreendimento_id: empreendimentoId, projeto_id: projetoId,
    })
    setSalvando(false)
    if (error) { setErro(error.message.includes('duplicate') ? 'Esse técnico já está atribuído a essa Filiada neste projeto.' : error.message); return }
    onFechar(); onAtribuido()
  }

  const semPrerequisito = !carregandoOpcoes && (tecnicos.length === 0 || empreendimentos.length === 0)

  return (
    <Drawer open={aberto} onClose={onFechar} title="Atribuir Filiada a um técnico">
      {carregandoOpcoes ? (
        <p className="text-xs text-gray-400">Carregando…</p>
      ) : semPrerequisito ? (
        <p className="text-xs text-gray-400">
          Aloque um técnico na <strong>Equipe</strong> e vincule uma Filiada a este projeto (seção acima) antes de atribuir.
        </p>
      ) : (
        <form onSubmit={atribuir} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Técnico *</label>
            <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white">
              {tecnicos.map(t => (
                <button key={t.id} type="button" onClick={() => setTecnicoId(t.id)}
                  className="block w-full text-left px-3 py-2 text-sm border-b border-gray-50 last:border-0"
                  style={tecnicoId === t.id ? { background: 'var(--primary-light)' } : {}}>
                  {t.nome}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Filiada *</label>
            <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white">
              {empreendimentos.map(e => (
                <button key={e.id} type="button" onClick={() => setEmpreendimentoId(e.id)}
                  className="block w-full text-left px-3 py-2 text-sm border-b border-gray-50 last:border-0"
                  style={empreendimentoId === e.id ? { background: 'var(--primary-light)' } : {}}>
                  {e.nome_fantasia || e.razao_social || '(sem nome)'}
                </button>
              ))}
            </div>
          </div>
          {erro && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{erro}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onFechar} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={salvando}
              className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50" style={{ background: 'var(--primary)' }}>
              {salvando ? 'Atribuindo…' : 'Atribuir'}
            </button>
          </div>
        </form>
      )}
    </Drawer>
  )
}
