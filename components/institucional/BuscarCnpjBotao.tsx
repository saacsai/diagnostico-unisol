'use client'

import { useState } from 'react'

export interface DadosCnpj {
  razao_social?: string
  nome_fantasia?: string
  endereco?: string
  municipio?: string
  uf?: string
  cep?: string
  situacao_cadastral?: string
}

export function BuscarCnpjBotao({ cnpj, onDados }: { cnpj: string; onDados: (d: DadosCnpj) => void }) {
  const [buscando, setBuscando] = useState(false)
  const [erro, setErro] = useState('')

  async function buscar() {
    setErro('')
    const limpo = cnpj.replace(/\D/g, '')
    if (limpo.length !== 14) { setErro('Digite um CNPJ válido (14 dígitos) primeiro.'); return }
    setBuscando(true)
    const res = await fetch(`/api/cnpj-lookup?cnpj=${limpo}`)
    const json = await res.json()
    if (!res.ok) { setErro(json.error || 'Erro ao buscar CNPJ.'); setBuscando(false); return }
    onDados(json)
    setBuscando(false)
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={buscar} disabled={buscando}
        className="text-xs font-medium px-3 py-1.5 rounded-lg border disabled:opacity-60"
        style={{ color: 'var(--primary)', borderColor: 'var(--primary-light)' }}>
        {buscando ? 'Buscando…' : 'Buscar dados na Receita (CNPJ)'}
      </button>
      {erro && <span className="text-xs text-red-600">{erro}</span>}
    </div>
  )
}
