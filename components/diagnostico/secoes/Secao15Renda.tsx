'use client'

import { MatrizFixa } from '../campos/MatrizFixa'
import { CampoTexto } from '../campos/CampoTexto'

const COL_RENDA = [
  { key: 'valor', label: 'Valor atual', tipo: 'numero' as const },
  { key: 'unidade', label: 'Unidade/fonte', tipo: 'texto' as const },
]
const LINHAS_RENDA = [
  { chave: 'renda_media_pessoa', label: 'Renda média mensal gerada por pessoa vinculada (R$/pessoa/mês)' },
  { chave: 'renda_media_familia', label: 'Renda média mensal das famílias participantes (R$/família/mês)' },
  { chave: 'postos_permanentes', label: 'Postos de trabalho permanentes (pessoas)' },
  { chave: 'postos_temporarios', label: 'Postos temporários/sazonais (pessoas)' },
  { chave: 'familias_beneficiadas', label: 'Famílias diretamente beneficiadas' },
  { chave: 'pessoas_indiretas', label: 'Pessoas indiretamente beneficiadas (estimativa justificada)' },
  { chave: 'pct_renda_familiar', label: 'Percentual da renda familiar vindo do empreendimento (%)' },
]

export function Secao15Renda({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 -mt-2">Estes dados formam a linha de base pra medir aumento médio de renda — combine o conceito e mantenha nas próximas medições.</p>
      <MatrizFixa linhas={LINHAS_RENDA} colunas={COL_RENDA} valores={dados.indicadores || {}}
        onChange={(chave, linha) => set({ indicadores: { ...(dados.indicadores || {}), [chave]: linha } })} />
      <CampoTexto label="15.1 Método usado para estimar renda e período considerado" multiline value={dados.metodo_estimativa_renda ?? ''} onChange={v => set({ metodo_estimativa_renda: v })} />
      <CampoTexto label="15.2 Benefícios não monetários gerados: alimentação, autonomia, vínculos, cultura, território etc." multiline value={dados.beneficios_nao_monetarios ?? ''} onChange={v => set({ beneficios_nao_monetarios: v })} />
      <CampoTexto label="15.3 Mudanças esperadas com o projeto" multiline value={dados.mudancas_esperadas ?? ''} onChange={v => set({ mudancas_esperadas: v })} />
    </div>
  )
}
