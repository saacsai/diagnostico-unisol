'use client'

import { MatrizFixa } from '../campos/MatrizFixa'
import { CampoTexto } from '../campos/CampoTexto'

const COL_PARCEIRO = [
  { key: 'tipo_apoio', label: 'Tipo de apoio/relação', tipo: 'texto' as const },
  { key: 'situacao', label: 'Situação', tipo: 'texto' as const },
  { key: 'proximo_passo', label: 'Próximo passo', tipo: 'texto' as const },
]
const LINHAS_PARCEIRO = [
  { chave: 'prefeitura_estado', label: 'Prefeitura/governo estadual' },
  { chave: 'mda_federais', label: 'MDA/órgãos federais' },
  { chave: 'universidade', label: 'Universidade/IF/incubadora' },
  { chave: 'movimentos', label: 'Movimentos e fóruns' },
  { chave: 'instituicao_financeira', label: 'Instituição financeira/fundo solidário' },
  { chave: 'empresas', label: 'Empresas/compradores' },
  { chave: 'outros_empreendimentos', label: 'Outros empreendimentos/redes' },
]

export function Secao16Parcerias({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <MatrizFixa linhas={LINHAS_PARCEIRO} colunas={COL_PARCEIRO} valores={dados.parceiros || {}}
        onChange={(chave, linha) => set({ parceiros: { ...(dados.parceiros || {}), [chave]: linha } })} />
      <CampoTexto label="16.1 Políticas públicas já acessadas e resultados" multiline value={dados.politicas_acessadas ?? ''} onChange={v => set({ politicas_acessadas: v })} />
      <CampoTexto label="16.2 Demandas de articulação institucional e incidência" multiline value={dados.demandas_articulacao ?? ''} onChange={v => set({ demandas_articulacao: v })} />
    </div>
  )
}
