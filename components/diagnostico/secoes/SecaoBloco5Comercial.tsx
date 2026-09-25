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
  { chave: 'marketplace', label: 'Marketplace/e-commerce (plataforma EcoUni)' },
]

export function SecaoBloco5Comercial({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">
        Alimenta o indicador de inserção de 60% dos empreendimentos em programas públicos e mercados privados (PAA, PNAE e marketplaces solidários).
      </p>
      <MatrizFixa linhas={LINHAS_CANAL} colunas={COL_CANAL} valores={dados.canais || {}}
        onChange={(chave, linha) => set({ canais: { ...(dados.canais || {}), [chave]: linha } })} />
      <CampoTexto label="5.1 Principais clientes, municípios/estados alcançados e frequência de compra" multiline value={dados.principais_clientes ?? ''} onChange={v => set({ principais_clientes: v })} />
      <CampoSelect label="5.2 Possui catálogo e tabela de preços atualizados?" value={dados.catalogo_tabela_precos ?? ''} onChange={v => set({ catalogo_tabela_precos: v })}
        opcoes={[{ value: 'ambos', label: 'Ambos' }, { value: 'somente_catalogo', label: 'Somente catálogo' }, { value: 'somente_tabela', label: 'Somente tabela' }, { value: 'nenhum', label: 'Nenhum' }]} />
      <CampoSelect label="5.3 Emite nota fiscal?" value={dados.emite_nf ?? ''} onChange={v => set({ emite_nf: v })}
        opcoes={[{ value: 'sempre', label: 'Sempre' }, { value: 'quando_solicitado', label: 'Quando solicitado' }, { value: 'nao', label: 'Não' }, { value: 'na', label: 'Não se aplica' }]} />
      <CampoSelect label="5.4 Participa de chamadas públicas/licitações (PAA/PNAE)?" value={dados.participa_licitacoes ?? ''} onChange={v => set({ participa_licitacoes: v })}
        opcoes={[{ value: 'regularmente', label: 'Regularmente' }, { value: 'ja_participou', label: 'Já participou' }, { value: 'tem_interesse', label: 'Tem interesse' }, { value: 'sem_interesse', label: 'Não tem interesse' }]} />
      <CampoTexto label="5.5 Barreiras para PAA/PNAE e mercados privados" multiline value={dados.barreiras_paa_pnae ?? ''} onChange={v => set({ barreiras_paa_pnae: v })} />
      <div>
        <CampoTexto label="5.6 Metas comerciais para os próximos 12 meses (incluir meta de % de inserção em compras públicas)" multiline value={dados.metas_comerciais_12meses ?? ''} onChange={v => set({ metas_comerciais_12meses: v })} />
        <p className="text-xs text-gray-400 mt-1">
          Orientação para o Marco 0: metas para os próximos 12 meses são propostas de planejamento, não resultados alcançados.
          Registrar à parte a situação atual, que será comparada à situação apurada no Marco 1.
        </p>
      </div>
      <EscalaMaturidade0a4 label="5.7 Maturidade comercial e capacidade de negociação" valor={dados.maturidade_comercial ?? null} onChange={v => set({ maturidade_comercial: v })} />
      <EscalaMaturidade0a4
        label="Régua de Maturidade do Bloco — Gestão Comercial"
        valor={dados.regua_classificacao ?? null}
        onChange={v => set({ regua_classificacao: v })}
        comEvidencia
        evidencia={dados.regua_evidencia ?? ''}
        onEvidenciaChange={v => set({ regua_evidencia: v })}
      />
    </div>
  )
}
