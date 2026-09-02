'use client'

import { TabelaRepetivel } from '../campos/TabelaRepetivel'
import { EscalaMaturidade0a4 } from '../campos/EscalaMaturidade0a4'
import { CampoTexto } from '../campos/CampoTexto'
import { CampoSelect } from '../campos/CampoSelect'

const CADEIAS = [
  'Mandiocultura', 'Apicultura/meliponicultura', 'Fruticultura/polpas', 'Cacau/chocolate',
  'Leite/derivados', 'Horticultura', 'Panificados/alimentos', 'Pesca/pescado',
  'Bioeconomia amazônica', 'Biocosméticos/fitoterápicos', 'Outra',
].map(c => ({ value: c, label: c }))

const COL_PRODUTO = [
  { key: 'nome', label: 'Produto/serviço', tipo: 'texto' as const },
  { key: 'unidade', label: 'Unidade', tipo: 'texto' as const },
  { key: 'volume_mes', label: 'Volume/mês atual', tipo: 'numero' as const },
  { key: 'capacidade_mes', label: 'Capacidade/mês', tipo: 'numero' as const },
  { key: 'preco_medio', label: 'Preço médio R$', tipo: 'numero' as const },
  { key: 'sazonalidade', label: 'Sazonalidade', tipo: 'texto' as const },
]

export function Secao07Producao({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <CampoSelect label="7.1 Cadeia principal" value={dados.cadeia_principal ?? ''} onChange={v => set({ cadeia_principal: v })} opcoes={CADEIAS} />
      <CampoTexto label="7.2 Cadeias secundárias e atividades complementares" multiline value={dados.cadeias_secundarias ?? ''} onChange={v => set({ cadeias_secundarias: v })} />
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Produtos/serviços</p>
        <TabelaRepetivel colunas={COL_PRODUTO} linhas={dados.produtos || []} onChange={v => set({ produtos: v })} minLinhas={1} />
      </div>
      <CampoTexto label="7.3 Origem das matérias-primas e principais fornecedores" multiline value={dados.origem_materias_primas ?? ''} onChange={v => set({ origem_materias_primas: v })} />
      <CampoSelect label="7.4 A produção é" value={dados.tipo_producao ?? ''} onChange={v => set({ tipo_producao: v })}
        opcoes={[{ value: 'continua', label: 'Contínua' }, { value: 'sazonal', label: 'Sazonal' }, { value: 'sob_encomenda', label: 'Sob encomenda' }, { value: 'irregular', label: 'Irregular' }]} />
      <CampoTexto label="7.5 Meses de safra, entressafra ou maior produção" value={dados.meses_safra ?? ''} onChange={v => set({ meses_safra: v })} />
      <CampoTexto label="7.6 Etapas do processo produtivo — da matéria-prima ao produto final" multiline value={dados.etapas_processo ?? ''} onChange={v => set({ etapas_processo: v })} />
      <CampoTexto label="7.7 Principais gargalos produtivos e perdas" multiline value={dados.gargalos_perdas ?? ''} onChange={v => set({ gargalos_perdas: v })} />
      <EscalaMaturidade0a4 label="7.8 Padronização do processo e controle de qualidade" valor={dados.padronizacao_qualidade ?? null} onChange={v => set({ padronizacao_qualidade: v })} />
      <EscalaMaturidade0a4 label="7.9 Capacidade de planejar produção a partir da demanda" valor={dados.capacidade_planejar_demanda ?? null} onChange={v => set({ capacidade_planejar_demanda: v })} />
    </div>
  )
}
