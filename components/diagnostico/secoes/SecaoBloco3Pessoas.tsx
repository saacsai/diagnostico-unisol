'use client'

import { EscalaMaturidade0a4 } from '../campos/EscalaMaturidade0a4'
import { CampoTexto } from '../campos/CampoTexto'
import { CampoSelect } from '../campos/CampoSelect'

export function SecaoBloco3Pessoas({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">
        Foco nas práticas internas de gestão de pessoas do empreendimento. Os dados quantitativos sobre o
        perfil das pessoas vinculadas estão na Parte B — Beneficiários.
      </p>
      <CampoSelect label="3.1 Critérios de admissão, remuneração e desligamento formalizados?" value={dados.criterios_formalizados ?? ''}
        onChange={v => set({ criterios_formalizados: v })}
        opcoes={[{ value: 'sim', label: 'Sim, formalizados' }, { value: 'parcialmente', label: 'Parcialmente' }, { value: 'nao', label: 'Não' }, { value: 'na', label: 'N/A' }]} />
      <CampoSelect label="3.2 Separa finanças/retiradas pessoais das finanças do empreendimento?" value={dados.separa_financas_pessoais ?? ''}
        onChange={v => set({ separa_financas_pessoais: v })}
        opcoes={[{ value: 'sempre', label: 'Sempre' }, { value: 'parcialmente', label: 'Parcialmente' }, { value: 'nao', label: 'Não' }]} />
      <CampoTexto label="3.3 Riscos de segurança do trabalho e EPIs necessários" multiline value={dados.riscos_seguranca_epis ?? ''} onChange={v => set({ riscos_seguranca_epis: v })} />
      <CampoTexto label="3.4 Necessidade de mão de obra adicional (permanente/temporária) nos próximos 12 meses" multiline
        value={dados.necessidade_mao_obra_12meses ?? ''} onChange={v => set({ necessidade_mao_obra_12meses: v })} />
      <EscalaMaturidade0a4 label="3.5 Maturidade da gestão de pessoas" valor={dados.maturidade_gestao_pessoas ?? null} onChange={v => set({ maturidade_gestao_pessoas: v })} />
      <EscalaMaturidade0a4
        label="Régua de Maturidade do Bloco — Gestão de Pessoas"
        valor={dados.regua_classificacao ?? null}
        onChange={v => set({ regua_classificacao: v })}
        comEvidencia
        evidencia={dados.regua_evidencia ?? ''}
        onEvidenciaChange={v => set({ regua_evidencia: v })}
      />
    </div>
  )
}
