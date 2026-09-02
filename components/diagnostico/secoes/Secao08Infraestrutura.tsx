'use client'

import { MatrizFixa } from '../campos/MatrizFixa'
import { TabelaRepetivel } from '../campos/TabelaRepetivel'
import { CampoTexto } from '../campos/CampoTexto'
import { CampoSelect } from '../campos/CampoSelect'

const COL_AMBIENTE = [
  { key: 'existe', label: 'Existe?', tipo: 'select' as const, opcoes: [{ value: 'sim', label: 'Sim' }, { value: 'nao', label: 'Não' }] },
  { key: 'condicao', label: 'Condição', tipo: 'texto' as const },
  { key: 'capacidade', label: 'Capacidade', tipo: 'texto' as const },
  { key: 'adequacao', label: 'Adequação necessária', tipo: 'texto' as const },
]
const LINHAS_AMBIENTE = [
  { chave: 'recepcao', label: 'Recepção de matéria-prima' },
  { chave: 'producao', label: 'Produção/beneficiamento' },
  { chave: 'armazenamento_seco', label: 'Armazenamento seco' },
  { chave: 'refrigeracao', label: 'Refrigeração/congelamento' },
  { chave: 'embalagem', label: 'Embalagem/expedição' },
  { chave: 'administrativa', label: 'Área administrativa' },
  { chave: 'vestiario', label: 'Vestiário/sanitários' },
  { chave: 'residuos', label: 'Tratamento de resíduos/efluentes' },
]

const COL_EQUIP = [
  { key: 'nome', label: 'Equipamento prioritário', tipo: 'texto' as const },
  { key: 'qtd_existente', label: 'Qtd. existente', tipo: 'numero' as const },
  { key: 'estado', label: 'Estado', tipo: 'texto' as const },
  { key: 'qtd_necessaria', label: 'Qtd. necessária', tipo: 'numero' as const },
  { key: 'finalidade', label: 'Finalidade/custo estimado', tipo: 'texto' as const },
]

export function Secao08Infraestrutura({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <CampoSelect label="8.1 Espaço de produção/beneficiamento" value={dados.espaco_producao ?? ''} onChange={v => set({ espaco_producao: v })}
        opcoes={[{ value: 'proprio', label: 'Próprio' }, { value: 'cedido', label: 'Cedido' }, { value: 'alugado', label: 'Alugado' }, { value: 'compartilhado', label: 'Compartilhado' }, { value: 'domiciliar', label: 'Domiciliar' }, { value: 'nao_possui', label: 'Não possui' }]} />
      <CampoTexto label="8.2 Área, condições de acesso, água, energia, internet e segurança" multiline value={dados.condicoes_area ?? ''} onChange={v => set({ condicoes_area: v })} />
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Ambiente/estrutura</p>
        <MatrizFixa linhas={LINHAS_AMBIENTE} colunas={COL_AMBIENTE} valores={dados.ambientes || {}}
          onChange={(chave, linha) => set({ ambientes: { ...(dados.ambientes || {}), [chave]: linha } })} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Equipamentos</p>
        <TabelaRepetivel colunas={COL_EQUIP} linhas={dados.equipamentos || []} onChange={v => set({ equipamentos: v })} />
      </div>
      <CampoSelect label="8.3 Possui manutenção preventiva?" value={dados.manutencao_preventiva ?? ''} onChange={v => set({ manutencao_preventiva: v })}
        opcoes={[{ value: 'sim_programada', label: 'Sim, programada' }, { value: 'somente_corretiva', label: 'Somente corretiva' }, { value: 'nao', label: 'Não' }, { value: 'na', label: 'N/A' }]} />
      <CampoTexto label="8.4 Riscos de segurança do trabalho e EPIs necessários" multiline value={dados.riscos_seguranca_epis ?? ''} onChange={v => set({ riscos_seguranca_epis: v })} />
      <CampoTexto label="8.5 Adequações prioritárias para beneficiamento e armazenamento" multiline value={dados.adequacoes_prioritarias ?? ''} onChange={v => set({ adequacoes_prioritarias: v })} />
    </div>
  )
}
