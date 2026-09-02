'use client'

import { MatrizFixa } from '../campos/MatrizFixa'
import { CampoTexto } from '../campos/CampoTexto'
import { CampoSelect } from '../campos/CampoSelect'

const COL_TEMA = [
  { key: 'necessidade', label: 'Necessidade (0-4)', tipo: 'select' as const, opcoes: [0, 1, 2, 3, 4].map(n => ({ value: String(n), label: String(n) })) },
  { key: 'quem_participa', label: 'Quem deve participar', tipo: 'texto' as const },
  { key: 'modalidade', label: 'Modalidade preferida', tipo: 'texto' as const },
  { key: 'resultado', label: 'Resultado esperado', tipo: 'texto' as const },
]
const LINHAS_TEMA = [
  { chave: 'planejamento', label: 'Planejamento estratégico' },
  { chave: 'autogestao', label: 'Autogestão e governança' },
  { chave: 'contabilidade', label: 'Contabilidade/finanças' },
  { chave: 'juridico', label: 'Jurídico/regularização' },
  { chave: 'credito_projetos', label: 'Crédito e projetos' },
  { chave: 'gestao_produtiva', label: 'Gestão produtiva/qualidade' },
  { chave: 'agroecologia', label: 'Agroecologia/sustentabilidade' },
  { chave: 'rotulagem', label: 'Rotulagem/certificação/rastreabilidade' },
  { chave: 'paa_pnae', label: 'PAA/PNAE e vendas privadas' },
  { chave: 'marketing', label: 'Marketing/comunicação digital' },
  { chave: 'ia', label: 'Inteligência artificial' },
  { chave: 'logistica', label: 'Logística/intercooperação' },
  { chave: 'genero_juventude', label: 'Igualdade de gênero e juventude' },
]

export function Secao14Formacao({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <MatrizFixa linhas={LINHAS_TEMA} colunas={COL_TEMA} valores={dados.temas || {}}
        onChange={(chave, linha) => set({ temas: { ...(dados.temas || {}), [chave]: linha } })} />
      <CampoTexto label="14.1 Formações realizadas nos últimos dois anos e resultados" multiline value={dados.formacoes_realizadas ?? ''} onChange={v => set({ formacoes_realizadas: v })} />
      <CampoTexto label="14.2 Saberes e boas práticas que o empreendimento pode compartilhar" multiline value={dados.saberes_compartilhar ?? ''} onChange={v => set({ saberes_compartilhar: v })} />
      <CampoSelect label="14.3 Condições para formação online" value={dados.condicoes_formacao_online ?? ''} onChange={v => set({ condicoes_formacao_online: v })}
        opcoes={[{ value: 'boas', label: 'Boas' }, { value: 'parciais', label: 'Parciais' }, { value: 'insuficientes', label: 'Insuficientes' }, { value: 'sem_acesso', label: 'Não possui acesso' }]} />
      <CampoTexto label="14.4 Dias, horários, acessibilidade e apoios necessários" multiline value={dados.dias_horarios_apoios ?? ''} onChange={v => set({ dias_horarios_apoios: v })} />
    </div>
  )
}
