'use client'

import { TabelaRepetivel } from '../campos/TabelaRepetivel'
import { CampoTexto } from '../campos/CampoTexto'

const COL_ACAO = [
  { key: 'prioridade', label: 'Prioridade', tipo: 'numero' as const },
  { key: 'acao', label: 'Ação/entrega', tipo: 'texto' as const },
  { key: 'responsavel', label: 'Responsável', tipo: 'texto' as const },
  { key: 'prazo', label: 'Prazo', tipo: 'texto' as const },
  { key: 'apoio_ecouni', label: 'Apoio EcoUni/BSR', tipo: 'texto' as const },
  { key: 'indicador_conclusao', label: 'Indicador de conclusão', tipo: 'texto' as const },
]

export function SecaoBloco8Demandas({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <CampoTexto label="8.1 Três potencialidades estratégicas" multiline value={dados.potencialidades_estrategicas ?? ''} onChange={v => set({ potencialidades_estrategicas: v })} />
      <CampoTexto label="8.2 Três gargalos prioritários" multiline value={dados.gargalos_prioritarios ?? ''} onChange={v => set({ gargalos_prioritarios: v })} />
      <CampoTexto label="8.3 Riscos que podem comprometer a participação no projeto" multiline value={dados.riscos_participacao ?? ''} onChange={v => set({ riscos_participacao: v })} />
      <CampoTexto label="8.4 Necessidades de capacitação digital, IA, marketplace e comunicação" multiline value={dados.necessidades_capacitacao_digital ?? ''} onChange={v => set({ necessidades_capacitacao_digital: v })} />
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">8.5 Plano inicial de encaminhamentos priorizados</p>
        <TabelaRepetivel colunas={COL_ACAO} linhas={dados.plano_acoes || []} onChange={v => set({ plano_acoes: v })} minLinhas={1} maxLinhas={5} />
      </div>
    </div>
  )
}
