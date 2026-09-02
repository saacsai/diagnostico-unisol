'use client'

import { CampoTexto } from '../campos/CampoTexto'
import { CampoSelect } from '../campos/CampoSelect'

export function Secao04Historico({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <CampoTexto label="4.1 Como surgiu o empreendimento e quais necessidades buscava enfrentar" multiline
        value={dados.origem_necessidades ?? ''} onChange={v => set({ origem_necessidades: v })} />
      <CampoTexto label="4.2 Missão ou propósito coletivo" multiline value={dados.missao ?? ''} onChange={v => set({ missao: v })} />
      <CampoTexto label="4.3 Principais conquistas dos últimos três anos" multiline value={dados.conquistas_3anos ?? ''} onChange={v => set({ conquistas_3anos: v })} />
      <CampoTexto label="4.4 Principais dificuldades ou crises dos últimos três anos" multiline value={dados.dificuldades_3anos ?? ''} onChange={v => set({ dificuldades_3anos: v })} />
      <CampoTexto label="4.5 Relações com a comunidade e impactos percebidos" multiline value={dados.relacoes_comunidade ?? ''} onChange={v => set({ relacoes_comunidade: v })} />
      <CampoSelect label="4.6 O empreendimento se reconhece como parte da economia solidária?" value={dados.reconhece_economia_solidaria ?? ''}
        onChange={v => set({ reconhece_economia_solidaria: v })}
        opcoes={[{ value: 'sim', label: 'Sim' }, { value: 'parcialmente', label: 'Parcialmente' }, { value: 'nao', label: 'Não' }, { value: 'nao_sabe', label: 'Não sabe' }]} />
      <CampoTexto label="4.7 Quais princípios da economia solidária são praticados no cotidiano?" multiline
        value={dados.principios_praticados ?? ''} onChange={v => set({ principios_praticados: v })} />
    </div>
  )
}
