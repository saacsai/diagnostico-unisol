'use client'

import { CampoTexto } from '../campos/CampoTexto'

export function SecaoBloco12Devolutiva({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <CampoTexto label="12.1 Forma da devolutiva ao empreendimento (presencial, relatório escrito, reunião com a rede etc.)" multiline value={dados.forma_devolutiva ?? ''} onChange={v => set({ forma_devolutiva: v })} />
      <CampoTexto label="12.2 Responsável pela devolutiva e data prevista" multiline value={dados.responsavel_data_devolutiva ?? ''} onChange={v => set({ responsavel_data_devolutiva: v })} />
      <CampoTexto label="12.3 Compromissos assumidos pelo empreendimento" multiline value={dados.compromissos_empreendimento ?? ''} onChange={v => set({ compromissos_empreendimento: v })} />
      <CampoTexto label="12.4 Compromissos assumidos pela BSR/Coordenação Nacional EcoUni" multiline value={dados.compromissos_bsr_ecouni ?? ''} onChange={v => set({ compromissos_bsr_ecouni: v })} />
    </div>
  )
}
