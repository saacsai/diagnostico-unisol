'use client'

import { MatrizFixa } from '../campos/MatrizFixa'
import { EscalaMaturidade0a4 } from '../campos/EscalaMaturidade0a4'
import { CampoTexto } from '../campos/CampoTexto'
import { CampoSelect } from '../campos/CampoSelect'

const COL_CANAL = [
  { key: 'usa', label: 'Usa?', tipo: 'select' as const, opcoes: [{ value: 'sim', label: 'Sim' }, { value: 'nao', label: 'Não' }] },
  { key: 'pct_vendas', label: '% vendas', tipo: 'numero' as const },
  { key: 'valor_anual', label: 'Valor anual R$', tipo: 'numero' as const },
  { key: 'desafio', label: 'Principal desafio', tipo: 'texto' as const },
]
const LINHAS_CANAL = [
  { chave: 'venda_direta', label: 'Venda direta/feiras' },
  { chave: 'lojas_proprias', label: 'Lojas/pontos próprios' },
  { chave: 'varejo_privado', label: 'Comércio varejista privado' },
  { chave: 'atacado', label: 'Atacado/distribuidores' },
  { chave: 'restaurantes', label: 'Restaurantes/empresas' },
  { chave: 'paa', label: 'PAA' },
  { chave: 'pnae', label: 'PNAE' },
  { chave: 'outras_compras_publicas', label: 'Outras compras públicas' },
  { chave: 'redes_ecosol', label: 'Redes de economia solidária' },
  { chave: 'redes_sociais', label: 'Redes sociais/WhatsApp' },
  { chave: 'marketplace', label: 'Marketplace/e-commerce' },
]

export function Secao10Comercializacao({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <MatrizFixa linhas={LINHAS_CANAL} colunas={COL_CANAL} valores={dados.canais || {}}
        onChange={(chave, linha) => set({ canais: { ...(dados.canais || {}), [chave]: linha } })} />
      <CampoTexto label="10.1 Principais clientes, municípios/estados alcançados e frequência de compra" multiline value={dados.principais_clientes ?? ''} onChange={v => set({ principais_clientes: v })} />
      <CampoSelect label="10.2 Possui catálogo e tabela de preços atualizados?" value={dados.catalogo_tabela_precos ?? ''} onChange={v => set({ catalogo_tabela_precos: v })}
        opcoes={[{ value: 'ambos', label: 'Ambos' }, { value: 'somente_catalogo', label: 'Somente catálogo' }, { value: 'somente_tabela', label: 'Somente tabela' }, { value: 'nenhum', label: 'Nenhum' }]} />
      <CampoSelect label="10.3 Emite nota fiscal?" value={dados.emite_nf ?? ''} onChange={v => set({ emite_nf: v })}
        opcoes={[{ value: 'sempre', label: 'Sempre' }, { value: 'quando_solicitado', label: 'Quando solicitado' }, { value: 'nao', label: 'Não' }, { value: 'na', label: 'Não se aplica' }]} />
      <CampoSelect label="10.4 Participa de chamadas públicas/licitações?" value={dados.participa_licitacoes ?? ''} onChange={v => set({ participa_licitacoes: v })}
        opcoes={[{ value: 'regularmente', label: 'Regularmente' }, { value: 'ja_participou', label: 'Já participou' }, { value: 'tem_interesse', label: 'Tem interesse' }, { value: 'sem_interesse', label: 'Não tem interesse' }]} />
      <CampoTexto label="10.5 Barreiras para PAA/PNAE e mercados privados" multiline value={dados.barreiras_paa_pnae ?? ''} onChange={v => set({ barreiras_paa_pnae: v })} />
      <CampoTexto label="10.6 Metas comerciais para os próximos 12 meses" multiline value={dados.metas_comerciais_12meses ?? ''} onChange={v => set({ metas_comerciais_12meses: v })} />
      <EscalaMaturidade0a4 label="10.7 Maturidade comercial e capacidade de negociação" valor={dados.maturidade_comercial ?? null} onChange={v => set({ maturidade_comercial: v })} />
    </div>
  )
}
