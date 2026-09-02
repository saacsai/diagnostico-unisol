'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Diagnostico, Empreendimento, Usuario } from '@/lib/supabase'
import { NovoDiagnostico } from './NovoDiagnostico'

type DiagnosticoComEmpreendimento = Diagnostico & { empreendimentos: Empreendimento | null }

export function ListaDiagnosticos() {
  const [lista, setLista] = useState<DiagnosticoComEmpreendimento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [criando, setCriando] = useState(false)
  const [ehAdmin, setEhAdmin] = useState(false)

  async function carregar() {
    setCarregando(true)
    const sb = getSupabase()
    const { data } = await sb
      .from('diagnosticos')
      .select('*, empreendimentos(*)')
      .order('created_at', { ascending: false })
    setLista((data as DiagnosticoComEmpreendimento[]) || [])
    const { data: sessao } = await sb.auth.getSession()
    if (sessao.session) {
      const { data: userRow } = await sb.from('usuarios').select('*').eq('id', sessao.session.user.id).single()
      setEhAdmin((userRow as Usuario | null)?.perfil === 'admin')
    }
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  if (criando) return <NovoDiagnostico onCancelar={() => setCriando(false)} />

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'var(--background)' }}>
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>Diagnósticos</h1>
          <button onClick={() => setCriando(true)}
            className="text-sm font-medium text-white rounded-lg px-4 py-2" style={{ background: 'var(--primary)' }}>
            + Novo diagnóstico
          </button>
        </div>

        {carregando ? (
          <p className="text-sm text-gray-400">Carregando…</p>
        ) : lista.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum diagnóstico ainda. Clique em &quot;Novo diagnóstico&quot; pra começar.</p>
        ) : (
          <div className="space-y-2">
            {lista.map(d => (
              <a key={d.id} href={`/diagnosticos?id=${d.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-3 hover:border-[var(--primary)]">
                <p className="text-sm font-semibold text-gray-900">
                  {d.empreendimentos?.nome_fantasia || d.empreendimentos?.razao_social || 'Empreendimento sem nome'}
                </p>
                <p className="text-xs text-gray-400">
                  {d.empreendimentos?.municipio}{d.empreendimentos?.uf ? `/${d.empreendimentos.uf}` : ''} · status: {d.status}
                </p>
              </a>
            ))}
          </div>
        )}

        {ehAdmin && (
          <a href="/admin" className="block text-center text-xs font-medium hover:underline pt-2" style={{ color: 'var(--primary)' }}>
            ⚙ Administração (usuários, UNISOL estaduais)
          </a>
        )}
      </div>
    </div>
  )
}
