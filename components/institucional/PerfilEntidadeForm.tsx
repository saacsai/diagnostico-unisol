'use client'

import { CampoTexto } from '@/components/diagnostico/campos/CampoTexto'
import { BuscarCnpjBotao } from './BuscarCnpjBotao'

export interface CamposPerfilEntidade {
  cnpj: string | null
  endereco: string | null
  municipio: string | null
  uf: string | null
  cep: string | null
  site: string | null
  representante_nome: string | null
  representante_cargo: string | null
  representante_rg: string | null
  representante_cpf: string | null
  representante_tel: string | null
  representante_email: string | null
}

export function PerfilEntidadeForm({
  dados, onChange,
}: {
  dados: CamposPerfilEntidade
  onChange: (patch: Partial<CamposPerfilEntidade>) => void
}) {
  const set = (patch: Partial<CamposPerfilEntidade>) => onChange(patch)

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <CampoTexto label="CNPJ" value={dados.cnpj ?? ''} onChange={v => set({ cnpj: v })} placeholder="00.000.000/0000-00" />
        </div>
        <div className="pb-0.5">
          <BuscarCnpjBotao cnpj={dados.cnpj ?? ''} onDados={d => set({
            endereco: d.endereco || dados.endereco,
            municipio: d.municipio || dados.municipio,
            uf: d.uf || dados.uf,
            cep: d.cep || dados.cep,
          })} />
        </div>
      </div>
      <CampoTexto label="Endereço" value={dados.endereco ?? ''} onChange={v => set({ endereco: v })} />
      <div className="grid grid-cols-3 gap-3">
        <CampoTexto label="Município" value={dados.municipio ?? ''} onChange={v => set({ municipio: v })} />
        <CampoTexto label="UF" value={dados.uf ?? ''} onChange={v => set({ uf: v.toUpperCase().slice(0, 2) })} />
        <CampoTexto label="CEP" value={dados.cep ?? ''} onChange={v => set({ cep: v })} />
      </div>
      <CampoTexto label="Site" value={dados.site ?? ''} onChange={v => set({ site: v })} />

      <p className="text-xs font-semibold text-gray-500 pt-2">Representante legal</p>
      <div className="grid grid-cols-2 gap-3">
        <CampoTexto label="Nome" value={dados.representante_nome ?? ''} onChange={v => set({ representante_nome: v })} />
        <CampoTexto label="Cargo" value={dados.representante_cargo ?? ''} onChange={v => set({ representante_cargo: v })} />
        <CampoTexto label="RG" value={dados.representante_rg ?? ''} onChange={v => set({ representante_rg: v })} />
        <CampoTexto label="CPF" value={dados.representante_cpf ?? ''} onChange={v => set({ representante_cpf: v })} />
        <CampoTexto label="Telefone" value={dados.representante_tel ?? ''} onChange={v => set({ representante_tel: v })} />
        <CampoTexto label="Email" value={dados.representante_email ?? ''} onChange={v => set({ representante_email: v })} />
      </div>
    </div>
  )
}
