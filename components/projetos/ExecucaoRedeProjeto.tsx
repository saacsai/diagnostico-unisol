'use client'

import { useEffect, useState } from 'react'
import { getSupabase, ProjetoExecutante, ProjetoExecutanteTerritorio, UnisolEstadual, Empreendimento, Tecnico, EquipeProjeto } from '@/lib/supabase'
import { Drawer } from '@/components/layout/Drawer'
import { LABEL_AREA } from '@/components/tecnicos/TecnicosLista'

const UFS_VALIDAS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

type ExecutanteComDados = ProjetoExecutante & {
  estadual: UnisolEstadual | null
  territorio: ProjetoExecutanteTerritorio[]
  filiadas: Empreendimento[]
  tecnicos: (EquipeProjeto & { tecnicos: Tecnico | null })[]
}

function nomeExecutante(e: ExecutanteComDados, estaduais: UnisolEstadual[]) {
  if (!e.unisol_estadual_id) return 'UNISOL Brasil'
  return estaduais.find(u => u.id === e.unisol_estadual_id)?.nome || 'Estadual removida'
}

export function ExecucaoRedeProjeto({ projetoId }: { projetoId: string }) {
  const [lista, setLista] = useState<ExecutanteComDados[]>([])
  const [estaduais, setEstaduais] = useState<UnisolEstadual[]>([])
  const [carregando, setCarregando] = useState(true)
  const [drawer, setDrawer] = useState(false)
  const [vincularPara, setVincularPara] = useState<ExecutanteComDados | null>(null)
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())

  async function carregar() {
    setCarregando(true)
    const sb = getSupabase()
    const [{ data: executantes }, { data: todasEstaduais }, { data: vinculos }, { data: equipe }] = await Promise.all([
      sb.from('projeto_executantes').select('*').eq('projeto_id', projetoId).order('created_at'),
      sb.from('unisol_estaduais').select('*').order('nome'),
      sb.from('empreendimento_projeto').select('empreendimentos(*)').eq('projeto_id', projetoId),
      sb.from('equipe_projeto').select('*, tecnicos(*)').eq('projeto_id', projetoId),
    ])
    const mapaEstaduais = new Map((todasEstaduais as UnisolEstadual[] || []).map(e => [e.id, e]))
    const filiadasDoProjeto = ((vinculos as unknown as { empreendimentos: Empreendimento | null }[]) || [])
      .map(v => v.empreendimentos).filter((e): e is Empreendimento => !!e)
    const equipeDoProjeto = (equipe as (EquipeProjeto & { tecnicos: Tecnico | null })[]) || []

    const ids = (executantes as ProjetoExecutante[] || []).map(e => e.id)
    const { data: territorios } = ids.length
      ? await sb.from('projeto_executante_territorio').select('*').in('projeto_executante_id', ids)
      : { data: [] as ProjetoExecutanteTerritorio[] }

    const comDados: ExecutanteComDados[] = (executantes as ProjetoExecutante[] || []).map(e => {
      const territorio = (territorios as ProjetoExecutanteTerritorio[] || []).filter(t => t.projeto_executante_id === e.id)
      const ufs = new Set(territorio.map(t => t.uf))
      return {
        ...e,
        estadual: e.unisol_estadual_id ? mapaEstaduais.get(e.unisol_estadual_id) || null : null,
        territorio,
        filiadas: filiadasDoProjeto.filter(f => f.uf && ufs.has(f.uf)),
        tecnicos: equipeDoProjeto.filter(eq => eq.projeto_executante_id === e.id),
      }
    })

    setLista(comDados)
    setEstaduais(todasEstaduais as UnisolEstadual[] || [])
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [projetoId]) // eslint-disable-line react-hooks/exhaustive-deps

  function alternarExpandido(id: string) {
    setExpandidos(prev => {
      const novo = new Set(prev)
      if (novo.has(id)) novo.delete(id); else novo.add(id)
      return novo
    })
  }

  async function removerExecutante(id: string, nome: string) {
    if (!confirm(`Remover ${nome} deste projeto? Isso também remove o território dele.`)) return
    await getSupabase().from('projeto_executantes').delete().eq('id', id)
    carregar()
  }

  async function alternarPapel(executante: ExecutanteComDados, papel: 'eh_celebrante' | 'eh_executante') {
    await getSupabase().from('projeto_executantes').update({ [papel]: !executante[papel] }).eq('id', executante.id)
    carregar()
  }

  async function adicionarUf(executanteId: string, uf: string) {
    if (!uf) return
    await getSupabase().from('projeto_executante_territorio').insert({ projeto_executante_id: executanteId, uf })
    carregar()
  }

  async function removerUf(territorioId: string) {
    await getSupabase().from('projeto_executante_territorio').delete().eq('id', territorioId)
    carregar()
  }

  const entidadesJaUsadas = new Set(lista.map(e => e.unisol_estadual_id))

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Execução em rede</h2>
          <p className="text-xs text-gray-400 mt-0.5">Celebrante e Executantes, cada um com seu território de UFs.</p>
        </div>
        <button onClick={() => setDrawer(true)} className="text-xs font-medium text-white rounded-lg px-3 py-1.5" style={{ background: 'var(--primary)' }}>
          + Entidade
        </button>
      </div>

      {carregando ? (
        <p className="text-xs text-gray-400">Carregando…</p>
      ) : (
        <div className="space-y-2">
          {lista.map(e => (
            <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{e.estadual ? `UNISOL ${e.estadual.nome.replace(/^UNISOL /, '')}` : 'UNISOL Brasil'}</span>
                <button onClick={() => removerExecutante(e.id, e.estadual ? e.estadual.nome : 'UNISOL Brasil')} className="text-xs font-medium text-red-600 hover:opacity-80">Remover</button>
              </div>
              <div className="flex gap-2 mb-3">
                <button onClick={() => alternarPapel(e, 'eh_celebrante')}
                  className="text-xs font-medium px-2 py-1 rounded-full border"
                  style={e.eh_celebrante ? { background: 'var(--primary-light)', color: 'var(--primary-dark)', borderColor: 'transparent' } : { color: '#9ca3af', borderColor: '#e5e7eb' }}>
                  Celebrante
                </button>
                <button onClick={() => alternarPapel(e, 'eh_executante')}
                  className="text-xs font-medium px-2 py-1 rounded-full border"
                  style={e.eh_executante ? { background: 'var(--primary-light)', color: 'var(--primary-dark)', borderColor: 'transparent' } : { color: '#9ca3af', borderColor: '#e5e7eb' }}>
                  Executante
                </button>
              </div>
              {e.eh_executante && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-medium text-gray-500">Território (UFs)</p>
                    {e.territorio.length > 0 && (
                      <button onClick={() => setVincularPara(e)} className="text-[11px] font-medium" style={{ color: 'var(--primary)' }}>
                        + Vincular Filiada
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {e.territorio.map(t => (
                      <span key={t.id} className="text-xs rounded-md px-2 py-0.5 bg-gray-100 text-gray-700 flex items-center gap-1">
                        {t.uf}
                        <button onClick={() => removerUf(t.id)} className="text-gray-400 hover:text-red-600">×</button>
                      </span>
                    ))}
                    <select
                      className="text-xs border border-gray-200 rounded-md px-1.5 py-0.5 text-gray-500 bg-white outline-none"
                      value=""
                      onChange={ev => adicionarUf(e.id, ev.target.value)}
                    >
                      <option value="">+ UF</option>
                      {UFS_VALIDAS.filter(uf => !e.territorio.some(t => t.uf === uf)).map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button onClick={() => alternarExpandido(e.id)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 mt-3 pt-3 border-t border-gray-100 w-full">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: expandidos.has(e.id) ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                {e.filiadas.length} Filiada{e.filiadas.length !== 1 ? 's' : ''} · {e.tecnicos.length} técnico{e.tecnicos.length !== 1 ? 's' : ''}
              </button>

              {expandidos.has(e.id) && (
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-[11px] font-medium text-gray-400 mb-1">Filiadas</p>
                    {e.filiadas.length === 0 ? (
                      <p className="text-xs text-gray-400">Nenhuma Filiada vinculada ainda.</p>
                    ) : (
                      <div className="space-y-1">
                        {e.filiadas.map(f => (
                          <a key={f.id} href={`/filiadas/${f.id}`} className="block text-xs px-2 py-1.5 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700">
                            {f.nome_fantasia || f.razao_social || '(sem nome)'}
                            <span className="text-gray-400"> · {f.codigo || 'sem código'} · {f.municipio}{f.uf ? `/${f.uf}` : ''}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-gray-400 mb-1">Técnicos</p>
                    {e.tecnicos.length === 0 ? (
                      <p className="text-xs text-gray-400">Nenhum técnico alocado nesse Executante ainda.</p>
                    ) : (
                      <div className="space-y-1">
                        {e.tecnicos.map(t => (
                          <div key={t.id} className="text-xs px-2 py-1.5 rounded-md bg-gray-50 text-gray-700">
                            {t.tecnicos?.nome || '(removido)'}
                            <span className="text-gray-400"> · {t.tecnicos?.area_atuacao ? LABEL_AREA[t.tecnicos.area_atuacao] : 'área não definida'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {lista.length === 0 && (
            <p className="text-xs text-gray-400 bg-white rounded-xl border border-gray-200 p-4 text-center">Nenhuma entidade cadastrada ainda.</p>
          )}
        </div>
      )}

      <AdicionarEntidadeDrawer
        projetoId={projetoId}
        estaduais={estaduais}
        entidadesJaUsadas={entidadesJaUsadas}
        aberto={drawer}
        onFechar={() => setDrawer(false)}
        onAdicionado={carregar}
      />

      <VincularFiliadaExecutanteDrawer
        projetoId={projetoId}
        executante={vincularPara}
        estaduais={estaduais}
        aberto={!!vincularPara}
        onFechar={() => setVincularPara(null)}
        onVinculado={carregar}
      />
    </div>
  )
}

function VincularFiliadaExecutanteDrawer({
  projetoId, executante, estaduais, aberto, onFechar, onVinculado,
}: {
  projetoId: string
  executante: ExecutanteComDados | null
  estaduais: UnisolEstadual[]
  aberto: boolean
  onFechar: () => void
  onVinculado: () => void
}) {
  const [candidatas, setCandidatas] = useState<Empreendimento[]>([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [vinculando, setVinculando] = useState<string | null>(null)

  useEffect(() => {
    if (!aberto || !executante) return
    setBusca(''); setErro(''); setCarregando(true)
    const ufs = executante.territorio.map(t => t.uf)
    const sb = getSupabase()
    Promise.all([
      sb.from('empreendimentos').select('*').in('uf', ufs).order('nome_fantasia'),
      sb.from('empreendimento_projeto').select('empreendimento_id').eq('projeto_id', projetoId),
    ]).then(([{ data: emps }, { data: vinculos }]) => {
      const jaVinculadas = new Set((vinculos || []).map(v => v.empreendimento_id))
      setCandidatas(((emps as Empreendimento[]) || []).filter(e => !jaVinculadas.has(e.id)))
      setCarregando(false)
    })
  }, [aberto, executante, projetoId])

  const filtradas = candidatas.filter(e =>
    !busca || `${e.nome_fantasia} ${e.razao_social} ${e.codigo}`.toLowerCase().includes(busca.toLowerCase())
  )

  async function vincular(empId: string) {
    setErro(''); setVinculando(empId)
    const { error } = await getSupabase().from('empreendimento_projeto').insert({ empreendimento_id: empId, projeto_id: projetoId })
    setVinculando(null)
    if (error) { setErro(error.message); return }
    setCandidatas(c => c.filter(e => e.id !== empId))
    onVinculado()
  }

  if (!executante) return null
  const nome = nomeExecutante(executante, estaduais)
  const ufs = executante.territorio.map(t => t.uf).join(', ')

  return (
    <Drawer open={aberto} onClose={onFechar} title={`Vincular Filiada — ${nome}`}>
      <div className="space-y-3">
        <p className="text-xs text-gray-400">Só aparecem Filiadas do território desse Executante (UF: {ufs}) que ainda não estão vinculadas a este projeto.</p>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome, razão social ou código…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
        {erro && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{erro}</p>}
        <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
          {carregando && <p className="text-xs text-gray-400 p-3">Carregando…</p>}
          {!carregando && filtradas.length === 0 && (
            <p className="text-xs text-gray-400 p-3">Nenhuma Filiada disponível desse território pra vincular.</p>
          )}
          {filtradas.map(e => (
            <button key={e.id} onClick={() => vincular(e.id)} disabled={vinculando === e.id}
              className="block w-full text-left px-3 py-2 text-sm border-b border-gray-50 last:border-0 hover:bg-gray-50 disabled:opacity-50">
              {e.nome_fantasia || e.razao_social || '(sem nome)'}
              <span className="block text-[11px] text-gray-400">
                {e.codigo ? `${e.codigo} · ` : ''}{e.municipio}{e.uf ? `/${e.uf}` : ''} {vinculando === e.id ? '— vinculando…' : ''}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Drawer>
  )
}

function AdicionarEntidadeDrawer({
  projetoId, estaduais, entidadesJaUsadas, aberto, onFechar, onAdicionado,
}: {
  projetoId: string
  estaduais: UnisolEstadual[]
  entidadesJaUsadas: Set<string | null>
  aberto: boolean
  onFechar: () => void
  onAdicionado: () => void
}) {
  const [selecionado, setSelecionado] = useState<string>('') // '' = não escolhido, 'brasil' = nacional, ou id da estadual
  const [celebrante, setCelebrante] = useState(false)
  const [executante, setExecutante] = useState(true)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!aberto) return
    setSelecionado(''); setCelebrante(false); setExecutante(true); setErro('')
  }, [aberto])

  const opcoes = [
    ...(entidadesJaUsadas.has(null) ? [] : [{ value: 'brasil', label: 'UNISOL Brasil (nacional)' }]),
    ...estaduais.filter(e => !entidadesJaUsadas.has(e.id)).map(e => ({ value: e.id, label: e.nome })),
  ]

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!selecionado) { setErro('Selecione uma entidade.'); return }
    if (!celebrante && !executante) { setErro('Marque pelo menos Celebrante ou Executante.'); return }
    setSalvando(true)
    const { error } = await getSupabase().from('projeto_executantes').insert({
      projeto_id: projetoId,
      unisol_estadual_id: selecionado === 'brasil' ? null : selecionado,
      eh_celebrante: celebrante,
      eh_executante: executante,
    })
    setSalvando(false)
    if (error) { setErro(error.message); return }
    onFechar(); onAdicionado()
  }

  return (
    <Drawer open={aberto} onClose={onFechar} title="Adicionar Celebrante/Executante">
      <form onSubmit={salvar} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Entidade *</label>
          <select value={selecionado} onChange={e => setSelecionado(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] bg-white">
            <option value="">Selecione…</option>
            {opcoes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {opcoes.length === 0 && <p className="text-[11px] text-gray-400 mt-1">Todas as entidades já foram adicionadas.</p>}
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={celebrante} onChange={e => setCelebrante(e.target.checked)} />
            Celebrante
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={executante} onChange={e => setExecutante(e.target.checked)} />
            Executante
          </label>
        </div>
        {erro && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{erro}</p>}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onFechar} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={salvando}
            className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50" style={{ background: 'var(--primary)' }}>
            {salvando ? 'Salvando…' : 'Adicionar'}
          </button>
        </div>
      </form>
    </Drawer>
  )
}
