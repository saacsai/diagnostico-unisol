'use client'

import { TabelaRepetivel } from '../campos/TabelaRepetivel'

const COL_ACAO = [
  { key: 'prioridade', label: 'Prioridade', tipo: 'numero' as const },
  { key: 'acao', label: 'Ação/entrega', tipo: 'texto' as const },
  { key: 'responsavel', label: 'Responsável', tipo: 'texto' as const },
  { key: 'prazo', label: 'Prazo', tipo: 'texto' as const },
  { key: 'apoio_ecouni', label: 'Apoio EcoUni/BSR', tipo: 'texto' as const },
  { key: 'indicador_conclusao', label: 'Indicador de conclusão', tipo: 'texto' as const },
]

export function Secao18PlanoAcao({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 -mt-2">Prioridades pactuadas com o empreendimento — até 10 linhas.</p>
      <TabelaRepetivel colunas={COL_ACAO} linhas={dados.linhas || []} onChange={v => onChange({ ...dados, linhas: v })} minLinhas={1} maxLinhas={10} />
    </div>
  )
}
