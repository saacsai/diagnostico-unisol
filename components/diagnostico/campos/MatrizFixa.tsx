'use client'

import { LinhaTabela } from '@/lib/diagnostico/schema'

export interface LinhaFixa { chave: string; label: string }
export interface ColunaMatriz {
  key: string
  label: string
  tipo?: 'texto' | 'numero' | 'select'
  opcoes?: { value: string; label: string }[]
}

// Matriz de categorias PRÉ-DEFINIDAS (sem add/remove linha) × colunas editáveis —
// cobre as tabelas do formulário onde as linhas já vêm nomeadas pelo próprio instrumento
// (categorias de vínculo, faixas etárias, documentos, canais de venda etc.)
export function MatrizFixa({
  linhas, colunas, valores, onChange,
}: {
  linhas: LinhaFixa[]
  colunas: ColunaMatriz[]
  valores: Record<string, LinhaTabela>
  onChange: (chave: string, linha: LinhaTabela) => void
}) {
  return (
    <div className="space-y-2">
      {linhas.map(l => {
        const linha = valores[l.chave] || {}
        return (
          <div key={l.chave} className="border border-gray-100 rounded-lg p-2.5">
            <p className="text-xs font-medium text-gray-700 mb-1.5">{l.label}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {colunas.map(c => (
                <div key={c.key}>
                  <label className="block text-[10px] text-gray-500 mb-0.5">{c.label}</label>
                  {c.tipo === 'select' ? (
                    <select className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-[var(--primary)]"
                      value={(linha[c.key] as string) ?? ''}
                      onChange={e => onChange(l.chave, { ...linha, [c.key]: e.target.value })}>
                      <option value="">…</option>
                      {c.opcoes?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      type={c.tipo === 'numero' ? 'number' : 'text'}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-[var(--primary)]"
                      value={(linha[c.key] as string | number) ?? ''}
                      onChange={e => onChange(l.chave, { ...linha, [c.key]: c.tipo === 'numero' ? Number(e.target.value) : e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
