'use client'

import { MatrizFixa } from '../campos/MatrizFixa'
import { EscalaMaturidade0a4 } from '../campos/EscalaMaturidade0a4'
import { CampoTexto } from '../campos/CampoTexto'
import { CampoSelect } from '../campos/CampoSelect'

const COL_DOC = [
  { key: 'situacao', label: 'Situação', tipo: 'select' as const, opcoes: [{ value: 'regular', label: 'Regular' }, { value: 'pendente', label: 'Pendente' }, { value: 'na', label: 'N/A' }] },
  { key: 'validade', label: 'Validade/data', tipo: 'texto' as const },
  { key: 'pendencia', label: 'Pendência/providência', tipo: 'texto' as const },
]
const LINHAS_DOC = [
  { chave: 'estatuto', label: 'Estatuto/contrato social' },
  { chave: 'ata_eleicao', label: 'Ata de eleição da direção' },
  { chave: 'regimento', label: 'Regimento interno' },
  { chave: 'cnpj', label: 'CNPJ' },
  { chave: 'inscricao', label: 'Inscrição estadual/municipal' },
  { chave: 'alvara', label: 'Alvará/licença de funcionamento' },
  { chave: 'certidoes', label: 'Certidões fiscais/trabalhistas' },
  { chave: 'dap_caf', label: 'DAP/CAF jurídica ou registros AF' },
  { chave: 'sanitarios', label: 'Cadastros sanitários/ambientais' },
  { chave: 'compras_publicas', label: 'Cadastro em compras públicas' },
]

export function Secao05Governanca({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Documento/registro</p>
        <MatrizFixa linhas={LINHAS_DOC} colunas={COL_DOC} valores={dados.documentos || {}}
          onChange={(chave, linha) => set({ documentos: { ...(dados.documentos || {}), [chave]: linha } })} />
      </div>
      <EscalaMaturidade0a4 label="5.1 Participação do quadro social nas decisões" valor={dados.participacao_quadro_social ?? null} onChange={v => set({ participacao_quadro_social: v })} />
      <EscalaMaturidade0a4 label="5.2 Regularidade de assembleias/reuniões e registros em ata" valor={dados.regularidade_assembleias ?? null} onChange={v => set({ regularidade_assembleias: v })} />
      <EscalaMaturidade0a4 label="5.3 Transparência e prestação de contas aos integrantes" valor={dados.transparencia_prestacao_contas ?? null} onChange={v => set({ transparencia_prestacao_contas: v })} />
      <EscalaMaturidade0a4 label="5.4 Divisão de responsabilidades e continuidade da gestão" valor={dados.divisao_responsabilidades ?? null} onChange={v => set({ divisao_responsabilidades: v })} />
      <EscalaMaturidade0a4 label="5.5 Planejamento estratégico e acompanhamento de metas" valor={dados.planejamento_estrategico ?? null} onChange={v => set({ planejamento_estrategico: v })} />
      <EscalaMaturidade0a4 label="5.6 Gestão de conflitos e canais de escuta" valor={dados.gestao_conflitos ?? null} onChange={v => set({ gestao_conflitos: v })} />
      <CampoTexto label="5.7 Frequência das reuniões e percentual médio de participação" value={dados.frequencia_reunioes ?? ''} onChange={v => set({ frequencia_reunioes: v })} />
      <CampoTexto label="5.8 Decisões mais importantes tomadas coletivamente no último ano" multiline value={dados.decisoes_ultimo_ano ?? ''} onChange={v => set({ decisoes_ultimo_ano: v })} />
      <CampoSelect label="5.9 Interesse em integrar Comitê de Mulheres e Juventude" value={dados.interesse_comite_mulheres_juventude ?? ''}
        onChange={v => set({ interesse_comite_mulheres_juventude: v })}
        opcoes={[{ value: 'sim', label: 'Sim' }, { value: 'nao', label: 'Não' }, { value: 'talvez', label: 'Talvez' }, { value: 'ja_participa', label: 'Já participa' }]} />
      <CampoTexto label="5.10 Principais necessidades jurídicas e institucionais" multiline value={dados.necessidades_juridicas ?? ''} onChange={v => set({ necessidades_juridicas: v })} />
    </div>
  )
}
