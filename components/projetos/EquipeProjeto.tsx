'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Tecnico, EquipeProjeto as EquipeProjetoRow, NivelAcesso, ProjetoExecutante, UnisolEstadual } from '@/lib/supabase'
import { Drawer } from '@/components/layout/Drawer'
import { LABEL_AREA } from '@/components/tecnicos/TecnicosLista'

type Alocacao = EquipeProjetoRow & { tecnicos: Tecnico | null }

const LABEL_NIVEL: Record<NivelAcesso, string> = {
  nacional: 'Nacional',
  regional: 'Regional',
  extensionista: 'Extensionista',
}

function nomeExecutante(e: ProjetoExecutante, estaduais: UnisolEstadual[]) {
  if (!e.unisol_estadual_id) return 'UNISOL Brasil'
  return estaduais.find(u => u.id === e.unisol_estadual_id)?.nome || 'Estadual removida'
}

export function EquipeProjeto({ projetoId }: { projetoId: string }) {
  const [lista, setLista] = useState<Alocacao[]>([])
  const [executantes, setExecutantes] = useState<ProjetoExecutante[]>([])
  const [estaduais, setEstaduais] = useState<UnisolEstadual[]>([])
  const [carregando, setCarregando] = useState(true)
  const [drawer, setDrawer] = useState(false)

  async function carregar() {
    setCarregando(true)
    const sb = getSupabase()
    const [{ data }, { data: execs }, { data: todasEstaduais }] = await Promise.all([
      sb.from('equipe_projeto').select('*, tecnicos(*)').eq('projeto_id', projetoId).order('created_at'),
      sb.from('projeto_executantes').select('*').eq('projeto_id', projetoId),
      sb.from('unisol_estaduais').select('*'),
    ])
    setLista((data as Alocacao[]) || [])
    setExecutantes((execs as ProjetoExecutante[]) || [])
    setEstaduais((todasEstaduais as UnisolEstadual[]) || [])
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [projetoId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function desalocar(id: string, nome: string) {
    if (!confirm(`Remover ${nome} da equipe deste projeto?`)) return
    await getSupabase().from('equipe_projeto').delete().eq('id', id)
    carregar()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Equipe</h2>
        <button onClick={() => setDrawer(true)} className="text-xs font-medium text-white rounded-lg px-3 py-1.5" style={{ background: 'var(--primary)' }}>
          + Alocar técnico
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
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Área</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Cargo/função</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Nível de acesso</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {lista.map(a => {
                const executante = executantes.find(e => e.id === a.projeto_executante_id)
                return (
                  <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-3 py-2 font-medium text-gray-900">{a.tecnicos?.nome || '(removido)'}</td>
                    <td className="px-3 py-2 text-gray-500">{a.tecnicos?.area_atuacao ? LABEL_AREA[a.tecnicos.area_atuacao] : '—'}</td>
                    <td className="px-3 py-2 text-gray-500">{a.cargo || '—'}</td>
                    <td className="px-3 py-2 text-gray-500">
                      {a.nivel_acesso ? LABEL_NIVEL[a.nivel_acesso] : '—'}
                      {executante && <span className="text-gray-400"> · {nomeExecutante(executante, estaduais)}</span>}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => desalocar(a.id, a.tecnicos?.nome || 'técnico')} className="text-xs font-medium text-red-600 hover:opacity-80">Remover</button>
                    </td>
                  </tr>
                )
              })}
              {lista.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-gray-400">Nenhum técnico alocado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AlocarTecnicoDrawer projetoId={projetoId} executantes={executantes} estaduais={estaduais} aberto={drawer} onFechar={() => setDrawer(false)} onAlocado={carregar} />
    </div>
  )
}

function AlocarTecnicoDrawer({
  projetoId, executantes, estaduais, aberto, onFechar, onAlocado,
}: {
  projetoId: string
  executantes: ProjetoExecutante[]
  estaduais: UnisolEstadual[]
  aberto: boolean
  onFechar: () => void
  onAlocado: () => void
}) {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [busca, setBusca] = useState('')
  const [tecnicoId, setTecnicoId] = useState('')
  const [cargo, setCargo] = useState('')
  const [nivelAcesso, setNivelAcesso] = useState<NivelAcesso | ''>('')
  const [executanteId, setExecutanteId] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!aberto) return
    setTecnicoId(''); setCargo(''); setNivelAcesso(''); setExecutanteId(''); setErro(''); setBusca('')
    getSupabase().from('tecnicos').select('*').order('nome').then(({ data }) => {
      setTecnicos((data as Tecnico[]) || [])
    })
  }, [aberto])

  const filtrados = tecnicos.filter(t => !busca || `${t.nome} ${t.email ?? ''}`.toLowerCase().includes(busca.toLowerCase()))
  const precisaExecutante = nivelAcesso === 'regional' || nivelAcesso === 'extensionista'

  async function alocar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!tecnicoId) { setErro('Selecione um técnico.'); return }
    if (precisaExecutante && !executanteId) { setErro('Selecione o Executante (território) desse técnico.'); return }
    setSalvando(true)
    const { error } = await getSupabase().from('equipe_projeto').insert({
      projeto_id: projetoId, tecnico_id: tecnicoId, cargo: cargo || null,
      nivel_acesso: nivelAcesso || null,
      projeto_executante_id: precisaExecutante ? executanteId : null,
    })
    setSalvando(false)
    if (error) { setErro(error.message.includes('duplicate') ? 'Esse técnico já está alocado neste projeto.' : error.message); return }
    onFechar(); onAlocado()
  }

  return (
    <Drawer open={aberto} onClose={onFechar} title="Alocar técnico no projeto">
      <form onSubmit={alocar} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Técnico *</label>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou email…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] mb-2" />
          <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto bg-white">
            {filtrados.length === 0 && (
              <p className="text-xs text-gray-400 p-3">
                Nenhum técnico encontrado. Cadastre em <a href="/tecnicos" className="underline" style={{ color: 'var(--primary)' }}>Técnicos</a>.
              </p>
            )}
            {filtrados.map(t => (
              <button key={t.id} type="button" onClick={() => setTecnicoId(t.id)}
                className="block w-full text-left px-3 py-2 text-sm border-b border-gray-50 last:border-0"
                style={tecnicoId === t.id ? { background: 'var(--primary-light)' } : {}}>
                {t.nome}
                <span className="block text-[11px] text-gray-400">{t.area_atuacao ? LABEL_AREA[t.area_atuacao] : 'Área não definida'}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Cargo/função no projeto</label>
          <input value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Ex: Coordenador Regional, Técnico ATER…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nível de acesso</label>
          <select value={nivelAcesso} onChange={e => { setNivelAcesso(e.target.value as NivelAcesso | ''); setExecutanteId('') }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] bg-white">
            <option value="">Sem restrição (vê tudo do projeto)</option>
            <option value="nacional">Nacional (vê tudo do projeto)</option>
            <option value="regional">Regional (coordenador — só o território do Executante)</option>
            <option value="extensionista">Extensionista (só o território do Executante)</option>
          </select>
        </div>
        {precisaExecutante && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Executante (território) *</label>
            <select value={executanteId} onChange={e => setExecutanteId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--primary)] bg-white">
              <option value="">Selecione…</option>
              {executantes.filter(e => e.eh_executante).map(e => (
                <option key={e.id} value={e.id}>{nomeExecutante(e, estaduais)}</option>
              ))}
            </select>
            {executantes.filter(e => e.eh_executante).length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1">Nenhum Executante cadastrado ainda nesse projeto (seção &quot;Execução em rede&quot; acima).</p>
            )}
          </div>
        )}
        {erro && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{erro}</p>}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onFechar} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={salvando}
            className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50" style={{ background: 'var(--primary)' }}>
            {salvando ? 'Alocando…' : 'Alocar'}
          </button>
        </div>
      </form>
    </Drawer>
  )
}
