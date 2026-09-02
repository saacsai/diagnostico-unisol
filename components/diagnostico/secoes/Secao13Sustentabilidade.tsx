'use client'

import { MatrizFixa } from '../campos/MatrizFixa'
import { CampoTexto } from '../campos/CampoTexto'

const COL_PRATICA = [
  { key: 'nivel', label: 'Nível', tipo: 'select' as const, opcoes: [{ value: 'nao', label: 'Não' }, { value: 'parcial', label: 'Parcial' }, { value: 'sim', label: 'Sim' }] },
  { key: 'descricao', label: 'Descrição/evidência', tipo: 'texto' as const },
]
const LINHAS_PRATICA = [
  { chave: 'agroecologica', label: 'Produção agroecológica/orgânica' },
  { chave: 'conservacao_solo_agua', label: 'Conservação de solo e água' },
  { chave: 'sementes_crioulas', label: 'Uso de sementes crioulas/sistemas biodiversos' },
  { chave: 'sociobiodiversidade', label: 'Uso sustentável da sociobiodiversidade' },
  { chave: 'reuso_agua', label: 'Redução/reuso de água' },
  { chave: 'energia_renovavel', label: 'Eficiência/energia renovável' },
  { chave: 'residuos', label: 'Separação e destinação de resíduos' },
  { chave: 'subprodutos', label: 'Reaproveitamento de subprodutos/economia circular' },
  { chave: 'embalagens_reciclaveis', label: 'Embalagens recicláveis/retornáveis' },
  { chave: 'plano_reducao_perdas', label: 'Plano para reduzir perdas' },
]

export function Secao13Sustentabilidade({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <MatrizFixa linhas={LINHAS_PRATICA} colunas={COL_PRATICA} valores={dados.praticas || {}}
        onChange={(chave, linha) => set({ praticas: { ...(dados.praticas || {}), [chave]: linha } })} />
      <CampoTexto label="13.1 % estimado das unidades produtivas com práticas agroecológicas/rastreáveis" value={dados.pct_unidades_agroecologicas ?? ''} onChange={v => set({ pct_unidades_agroecologicas: v })} />
      <CampoTexto label="13.2 % estimado de perdas e resíduos produtivos — linha de base" value={dados.pct_perdas_residuos ?? ''} onChange={v => set({ pct_perdas_residuos: v })} />
      <CampoTexto label="13.3 Riscos climáticos e ambientais que afetam a produção" multiline value={dados.riscos_climaticos ?? ''} onChange={v => set({ riscos_climaticos: v })} />
      <CampoTexto label="13.4 Tecnologias sociais ou soluções ambientais já utilizadas" multiline value={dados.tecnologias_sociais ?? ''} onChange={v => set({ tecnologias_sociais: v })} />
      <CampoTexto label="13.5 Metas ambientais possíveis para os próximos 12 meses" multiline value={dados.metas_ambientais_12meses ?? ''} onChange={v => set({ metas_ambientais_12meses: v })} />
    </div>
  )
}
