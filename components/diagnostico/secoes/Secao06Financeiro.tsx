'use client'

import { MatrizFixa } from '../campos/MatrizFixa'
import { EscalaMaturidade0a4 } from '../campos/EscalaMaturidade0a4'
import { CampoTexto } from '../campos/CampoTexto'
import { CampoSelect } from '../campos/CampoSelect'

const COL_FIN = [
  { key: 'valor', label: 'Valor (R$)', tipo: 'numero' as const },
  { key: 'observacao', label: 'Fonte/observação', tipo: 'texto' as const },
]
const LINHAS_FIN = [
  { chave: 'faturamento', label: 'Faturamento bruto total' },
  { chave: 'custos', label: 'Custos/despesas totais' },
  { chave: 'resultado', label: 'Resultado/sobra estimada' },
  { chave: 'distribuido', label: 'Total distribuído/retiradas' },
  { chave: 'dividas', label: 'Dívidas/parcelamentos atuais' },
  { chave: 'credito_acessado', label: 'Recursos de crédito acessados' },
  { chave: 'investimentos', label: 'Investimentos realizados' },
]

export function Secao06Financeiro({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <CampoSelect label="6.1 Possui conta bancária em nome do empreendimento?" value={dados.conta_bancaria ?? ''} onChange={v => set({ conta_bancaria: v })}
        opcoes={[{ value: 'sim', label: 'Sim' }, { value: 'nao', label: 'Não' }, { value: 'em_abertura', label: 'Em abertura' }]} />
      <CampoSelect label="6.2 Possui contabilidade regular?" value={dados.contabilidade ?? ''} onChange={v => set({ contabilidade: v })}
        opcoes={[{ value: 'contador_contratado', label: 'Contador contratado' }, { value: 'apoio_parceiro', label: 'Apoio parceiro' }, { value: 'interna', label: 'Interna' }, { value: 'nao_possui', label: 'Não possui' }]} />
      <CampoSelect label="6.3 Registra receitas, despesas e retiradas?" value={dados.registra_receitas_despesas ?? ''} onChange={v => set({ registra_receitas_despesas: v })}
        opcoes={[{ value: 'mensalmente', label: 'Mensalmente' }, { value: 'as_vezes', label: 'Às vezes' }, { value: 'nao', label: 'Não' }, { value: 'nao_sabe', label: 'Não sabe' }]} />
      <CampoSelect label="6.4 Elabora fluxo de caixa?" value={dados.fluxo_caixa ?? ''} onChange={v => set({ fluxo_caixa: v })}
        opcoes={[{ value: 'sim_atualiza', label: 'Sim e atualiza' }, { value: 'sim_desatualizado', label: 'Sim, desatualizado' }, { value: 'nao', label: 'Não' }]} />
      <CampoSelect label="6.5 Calcula custos e forma preços?" value={dados.calcula_custos_precos ?? ''} onChange={v => set({ calcula_custos_precos: v })}
        opcoes={[{ value: 'todos', label: 'Para todos os produtos' }, { value: 'alguns', label: 'Para alguns' }, { value: 'nao', label: 'Não' }]} />
      <CampoSelect label="6.6 Separa finanças do empreendimento das pessoais?" value={dados.separa_financas ?? ''} onChange={v => set({ separa_financas: v })}
        opcoes={[{ value: 'sempre', label: 'Sempre' }, { value: 'parcialmente', label: 'Parcialmente' }, { value: 'nao', label: 'Não' }]} />
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Indicador financeiro — últimos 12 meses</p>
        <MatrizFixa linhas={LINHAS_FIN} colunas={COL_FIN} valores={dados.indicadores_financeiros || {}}
          onChange={(chave, linha) => set({ indicadores_financeiros: { ...(dados.indicadores_financeiros || {}), [chave]: linha } })} />
      </div>
      <CampoTexto label="6.7 Receita média mensal e meses de maior/menor receita" multiline value={dados.receita_media_mensal ?? ''} onChange={v => set({ receita_media_mensal: v })} />
      <CampoSelect label="6.8 Acessou crédito nos últimos 3 anos?" value={dados.acessou_credito ?? ''} onChange={v => set({ acessou_credito: v })}
        opcoes={[{ value: 'sim', label: 'Sim' }, { value: 'tentou_nao_conseguiu', label: 'Tentou e não conseguiu' }, { value: 'nao_tentou', label: 'Não tentou' }, { value: 'sem_interesse', label: 'Não tem interesse' }]} />
      <CampoTexto label="6.9 Fonte, valor, finalidade, prazo e situação do crédito" multiline value={dados.credito_detalhe ?? ''} onChange={v => set({ credito_detalhe: v })} />
      <CampoTexto label="6.10 Necessidade atual de financiamento e capacidade estimada de pagamento" multiline value={dados.necessidade_financiamento ?? ''} onChange={v => set({ necessidade_financiamento: v })} />
      <EscalaMaturidade0a4 label="6.11 Maturidade geral da gestão financeira" valor={dados.maturidade_financeira ?? null} onChange={v => set({ maturidade_financeira: v })} />
    </div>
  )
}
