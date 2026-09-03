'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Tecnico, EquipeProjeto as EquipeProjetoRow } from '@/lib/supabase'
import { Drawer } from '@/components/layout/Drawer'
import { LABEL_AREA } from '@/components/tecnicos/TecnicosLista'

type Alocacao = EquipeProjetoRow & { tecnicos: Tecnico | null }

export function EquipeProjeto({ projetoId }: { projetoId: string }) {
  const [lista, setLista] = useState<Alocacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [drawer, setDrawer] = useState(false)

  async function carregar() {
    setCarregando(true)
    const { data } = await getSupabase()
      .from('equipe_projeto')
      .select('*, tecnicos(*)')
      .eq('projeto_id', projetoId)
      .order('created_at')
    setLista((data as Alocacao[]) || [])
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
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Cargo/função no projeto</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {lista.map(a => (
                <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-3 py-2 font-medium text-gray-900">{a.tecnicos?.nome || '(removido)'}</td>
                  <td className="px-3 py-2 text-gray-500">{a.tecnicos?.area_atuacao ? LABEL_AREA[a.tecnicos.area_atuacao] : '—'}</td>
                  <td className="px-3 py-2 text-gray-500">{a.cargo || '—'}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => desalocar(a.id, a.tecnicos?.nome || 'técnico')} className="text-xs font-medium text-red-600 hover:opacity-80">Remover</button>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-xs text-gray-400">Nenhum técnico alocado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AlocarTecnicoDrawer projetoId={projetoId} aberto={drawer} onFechar={() => setDrawer(false)} onAlocado={carregar} />
    </div>
  )
}

function AlocarTecnicoDrawer({
  projetoId, aberto, onFechar, onAlocado,
}: {
  projetoId: string
  aberto: boolean
  onFechar: () => void
  onAlocado: () => void
}) {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [busca, setBusca] = useState('')
  const [tecnicoId, setTecnicoId] = useState('')
  const [cargo, setCargo] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!aberto) return
    setTecnicoId(''); setCargo(''); setErro(''); setBusca('')
    getSupabase().from('tecnicos').select('*').order('nome').then(({ data }) => {
      setTecnicos((data as Tecnico[]) || [])
    })
  }, [aberto])

  const filtrados = tecnicos.filter(t => !busca || `${t.nome} ${t.email ?? ''}`.toLowerCase().includes(busca.toLowerCase()))

  async function alocar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!tecnicoId) { setErro('Selecione um técnico.'); return }
    setSalvando(true)
    const { error } = await getSupabase().from('equipe_projeto').insert({
      projeto_id: projetoId, tecnico_id: tecnicoId, cargo: cargo || null,
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
