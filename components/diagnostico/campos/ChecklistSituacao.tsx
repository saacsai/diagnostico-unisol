'use client'

import { LinhaTabela } from '@/lib/diagnostico/schema'

export interface ChecklistItem {
  chave: string
  label: string
}

const ESTADOS_PADRAO = [
  { valor: 'regular', label: 'Regular' },
  { valor: 'pendente', label: 'Pendente' },
  { valor: 'na', label: 'N/A' },
]

export function ChecklistSituacao({
  itens, valores, onChange, estados = ESTADOS_PADRAO, comObservacao = true,
}: {
  itens: ChecklistItem[]
  valores: Record<string, LinhaTabela>
  onChange: (chave: string, linha: LinhaTabela) => void
  estados?: { valor: string; label: string }[]
  comObservacao?: boolean
}) {
  return (
    <div className="space-y-2">
      {itens.map(item => {
        const linha = valores[item.chave] || {}
        return (
          <div key={item.chave} className="border border-gray-100 rounded-lg p-2.5">
            <p className="text-xs font-medium text-gray-700 mb-1.5">{item.label}</p>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {estados.map(e => {
                const ativo = linha.situacao === e.valor
                return (
                  <button
                    key={e.valor}
                    type="button"
                    onClick={() => onChange(item.chave, { ...linha, situacao: e.valor })}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium border"
                    style={ativo
                      ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }
                      : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }}
                  >
                    {e.label}
                  </button>
                )
              })}
            </div>
            {comObservacao && (
              <input
                type="text"
                placeholder="Observação…"
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[var(--primary)]"
                value={(linha.observacao as string) ?? ''}
                onChange={e => onChange(item.chave, { ...linha, observacao: e.target.value })}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
