'use client'

import { EscalaMaturidade0a4 } from '../campos/EscalaMaturidade0a4'
import { CampoTexto } from '../campos/CampoTexto'

export function SecaoBloco2Governanca({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <EscalaMaturidade0a4 label="2.1 Participação do quadro social nas decisões" valor={dados.participacao_quadro_social ?? null} onChange={v => set({ participacao_quadro_social: v })} />
      <EscalaMaturidade0a4 label="2.2 Regularidade de assembleias/reuniões e registros em ata" valor={dados.regularidade_assembleias ?? null} onChange={v => set({ regularidade_assembleias: v })} />
      <EscalaMaturidade0a4 label="2.3 Transparência e prestação de contas aos integrantes" valor={dados.transparencia_prestacao_contas ?? null} onChange={v => set({ transparencia_prestacao_contas: v })} />
      <EscalaMaturidade0a4 label="2.4 Divisão de responsabilidades e continuidade da gestão" valor={dados.divisao_responsabilidades ?? null} onChange={v => set({ divisao_responsabilidades: v })} />
      <EscalaMaturidade0a4 label="2.5 Planejamento estratégico e acompanhamento de metas" valor={dados.planejamento_estrategico ?? null} onChange={v => set({ planejamento_estrategico: v })} />
      <EscalaMaturidade0a4 label="2.6 Gestão de conflitos e canais de escuta" valor={dados.gestao_conflitos ?? null} onChange={v => set({ gestao_conflitos: v })} />
      <CampoTexto label="2.7 Frequência das reuniões e percentual médio de participação" value={dados.frequencia_reunioes ?? ''} onChange={v => set({ frequencia_reunioes: v })} />
      <CampoTexto label="2.8 Decisões mais importantes tomadas coletivamente no último ano" multiline value={dados.decisoes_ultimo_ano ?? ''} onChange={v => set({ decisoes_ultimo_ano: v })} />
      <CampoTexto label="2.9 Principais conquistas dos últimos três anos" multiline value={dados.conquistas_3anos ?? ''} onChange={v => set({ conquistas_3anos: v })} />
      <CampoTexto label="2.10 Principais dificuldades ou crises dos últimos três anos" multiline value={dados.dificuldades_3anos ?? ''} onChange={v => set({ dificuldades_3anos: v })} />
      <CampoTexto label="2.11 Relações com a comunidade e impactos percebidos" multiline value={dados.relacoes_comunidade ?? ''} onChange={v => set({ relacoes_comunidade: v })} />
      <CampoTexto label="2.12 Quais princípios da economia solidária são praticados no cotidiano?" multiline value={dados.principios_praticados ?? ''} onChange={v => set({ principios_praticados: v })} />
      <CampoTexto label="2.13 Principais necessidades jurídicas e institucionais" multiline value={dados.necessidades_juridicas ?? ''} onChange={v => set({ necessidades_juridicas: v })} />
      <EscalaMaturidade0a4
        label="Régua de Maturidade do Bloco — Gestão e Governança"
        valor={dados.regua_classificacao ?? null}
        onChange={v => set({ regua_classificacao: v })}
        comEvidencia
        evidencia={dados.regua_evidencia ?? ''}
        onEvidenciaChange={v => set({ regua_evidencia: v })}
      />
    </div>
  )
}
