'use client'

import { useEffect, useState } from 'react'
import { carregarTotaisAdmin, carregarAguardandoValidacao, TotaisAdmin, DiagnosticoAguardandoValidacao } from '@/lib/dashboard/queries'

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

export function DashboardAdmin({ onCarregado }: { onCarregado?: (t: TotaisAdmin) => void }) {
  const [totais, setTotais] = useState<TotaisAdmin | null>(null)
  const [aguardando, setAguardando] = useState<DiagnosticoAguardandoValidacao[] | null>(null)

  useEffect(() => {
    carregarTotaisAdmin().then(t => { setTotais(t); onCarregado?.(t) })
    carregarAguardandoValidacao().then(setAguardando)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const cards = [
    { label: 'Diagnósticos validados', valor: totais?.diagnosticosConcluidos, href: '/diagnosticos', icone: 'M20 6 9 17l-5-5' },
    { label: 'Diagnósticos em aberto', valor: totais?.diagnosticosEmAberto, href: '/diagnosticos', icone: 'M12 8v4l3 3M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z' },
    { label: 'Filiadas', valor: totais?.filiadas, href: '/filiadas', icone: 'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
    { label: 'Projetos ativos', valor: totais?.projetosAtivos, href: '/projetos', icone: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
  ]

  return (
    <div>
      <h1 className="text-base font-bold text-gray-900 mb-3">Visão geral</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(c => (
          <a key={c.label} href={c.href} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[var(--primary-light)] transition-colors">
            <Icon d={c.icone} />
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--primary)' }}>{c.valor ?? '—'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </a>
        ))}
      </div>

      {aguardando && aguardando.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3">
            Aguardando sua validação <span className="font-normal text-gray-400">({aguardando.length})</span>
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
            {aguardando.map(d => (
              <a key={d.id} href={`/filiadas/${d.empreendimento_id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{d.nome_empreendimento}</p>
                  <p className="text-xs text-gray-400">
                    {d.municipio}{d.uf ? `/${d.uf}` : ''} · enviado por {d.enviado_por_nome} em {new Date(d.enviado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">Validar</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
