'use client'

import { LinhaTabela } from '@/lib/diagnostico/schema'

export interface ColunaTabela {
  key: string
  label: string
  tipo?: 'texto' | 'numero' | 'select'
  opcoes?: { value: string; label: string }[]
  placeholder?: string
}

// Cards (não <table>) de propósito — funciona igual em mobile (uso predominante em campo)
// e desktop, sem precisar de dois layouts responsivos separados.
export function TabelaRepetivel({
  colunas, linhas, onChange, minLinhas = 0, maxLinhas,
}: {
  colunas: ColunaTabela[]
  linhas: LinhaTabela[]
  onChange: (linhas: LinhaTabela[]) => void
  minLinhas?: number
  maxLinhas?: number
}) {
  const linhasAtuais = linhas.length ? linhas : Array.from({ length: minLinhas }, (): LinhaTabela => ({}))

  function atualizarLinha(i: number, key: string, valor: string | number) {
    const novas = linhasAtuais.map((l, idx) => idx === i ? { ...l, [key]: valor } : l)
    onChange(novas)
  }

  function removerLinha(i: number) {
    onChange(linhasAtuais.filter((_, idx) => idx !== i))
  }

  function adicionarLinha() {
    onChange([...linhasAtuais, {}])
  }

  return (
    <div className="space-y-2">
      {linhasAtuais.map((linha, i) => (
        <div key={i} className="border border-gray-100 rounded-lg p-2.5 relative">
          {linhasAtuais.length > minLinhas && (
            <button type="button" onClick={() => removerLinha(i)}
              className="absolute top-2 right-2 text-gray-300 hover:text-red-500 text-xs">✕</button>
          )}
          <div className="grid grid-cols-2 gap-2 pr-5">
            {colunas.map(col => (
              <div key={col.key} className={col.tipo === 'texto' && colunas.length <= 2 ? 'col-span-2' : ''}>
                <label className="block text-[10px] text-gray-500 mb-0.5">{col.label}</label>
                {col.tipo === 'select' ? (
                  <select
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-[var(--primary)]"
                    value={(linha[col.key] as string) ?? ''}
                    onChange={e => atualizarLinha(i, col.key, e.target.value)}
                  >
                    <option value="">…</option>
                    {col.opcoes?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input
                    type={col.tipo === 'numero' ? 'number' : 'text'}
                    placeholder={col.placeholder}
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-[var(--primary)]"
                    value={(linha[col.key] as string | number) ?? ''}
                    onChange={e => atualizarLinha(i, col.key, col.tipo === 'numero' ? Number(e.target.value) : e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {(!maxLinhas || linhasAtuais.length < maxLinhas) && (
        <button type="button" onClick={adicionarLinha}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-dashed"
          style={{ color: 'var(--primary)', borderColor: 'var(--primary-light)' }}>
          + Adicionar linha
        </button>
      )}
    </div>
  )
}
