'use client'

import { EscalaMaturidade0a4 } from '../campos/EscalaMaturidade0a4'
import { CampoTexto } from '../campos/CampoTexto'
import { CampoSelect } from '../campos/CampoSelect'

const OPCOES_BSR = ['Logística', 'Armazenamento', 'Beneficiamento', 'Comercialização', 'Formação', 'Assessoria', 'Todos']

export function Secao11Logistica({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  const selecionados: string[] = dados.interesse_bsr_cnd || []
  function toggleBsr(op: string) {
    const novo = selecionados.includes(op) ? selecionados.filter(s => s !== op) : [...selecionados, op]
    set({ interesse_bsr_cnd: novo })
  }

  return (
    <div className="space-y-4">
      <CampoSelect label="11.1 Transporte utilizado" value={dados.transporte ?? ''} onChange={v => set({ transporte: v })}
        opcoes={[{ value: 'proprio', label: 'Próprio' }, { value: 'alugado', label: 'Alugado' }, { value: 'terceirizado', label: 'Terceirizado' }, { value: 'parceiro', label: 'Parceiro' }, { value: 'comprador_retira', label: 'Comprador retira' }, { value: 'nao_possui', label: 'Não possui' }]} />
      <CampoTexto label="11.2 Rotas, frequência, distâncias e custo médio mensal" multiline value={dados.rotas_frequencia_custo ?? ''} onChange={v => set({ rotas_frequencia_custo: v })} />
      <CampoSelect label="11.3 Necessita cadeia fria?" value={dados.cadeia_fria ?? ''} onChange={v => set({ cadeia_fria: v })}
        opcoes={[{ value: 'sim_possui', label: 'Sim e possui' }, { value: 'sim_nao_possui', label: 'Sim e não possui' }, { value: 'nao', label: 'Não' }]} />
      <CampoTexto label="11.4 Capacidade e tempo máximo de armazenamento" value={dados.capacidade_armazenamento ?? ''} onChange={v => set({ capacidade_armazenamento: v })} />
      <CampoTexto label="11.5 Perdas pós-colheita/pós-produção: percentual, causas e produtos afetados" multiline value={dados.perdas_pos_colheita ?? ''} onChange={v => set({ perdas_pos_colheita: v })} />
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">11.6 Interesse em utilizar a BSR e o CND</label>
        <div className="flex flex-wrap gap-1.5">
          {OPCOES_BSR.map(op => {
            const ativo = selecionados.includes(op)
            return (
              <button key={op} type="button" onClick={() => toggleBsr(op)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium border"
                style={ativo ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' } : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }}>
                {op}
              </button>
            )
          })}
        </div>
      </div>
      <CampoTexto label="11.7 Produtos que podem integrar circuitos inter-regionais (volume e frequência)" multiline value={dados.produtos_circuitos_inter_regionais ?? ''} onChange={v => set({ produtos_circuitos_inter_regionais: v })} />
      <CampoTexto label="11.8 Insumos, serviços ou equipamentos que podem ser compartilhados" multiline value={dados.insumos_compartilhaveis ?? ''} onChange={v => set({ insumos_compartilhaveis: v })} />
      <CampoTexto label="11.9 Empreendimentos/redes com que já coopera e forma da parceria" multiline value={dados.parcerias_existentes ?? ''} onChange={v => set({ parcerias_existentes: v })} />
      <EscalaMaturidade0a4 label="11.10 Prontidão para logística compartilhada e intercooperação" valor={dados.prontidao_logistica_compartilhada ?? null} onChange={v => set({ prontidao_logistica_compartilhada: v })} />
    </div>
  )
}
