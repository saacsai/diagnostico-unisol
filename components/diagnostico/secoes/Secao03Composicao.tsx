'use client'

import { MatrizFixa } from '../campos/MatrizFixa'
import { CampoTexto } from '../campos/CampoTexto'
import { CampoSelect } from '../campos/CampoSelect'

const COL_VINCULO = [
  { key: 'total', label: 'Total', tipo: 'numero' as const },
  { key: 'mulheres', label: 'Mulheres', tipo: 'numero' as const },
  { key: 'homens', label: 'Homens', tipo: 'numero' as const },
  { key: 'nao_binarias', label: 'Não bin./outras', tipo: 'numero' as const },
  { key: 'nao_informado', label: 'Não informado', tipo: 'numero' as const },
]
const LINHAS_VINCULO = [
  { chave: 'associadas', label: 'Pessoas associadas/cooperadas' },
  { chave: 'ativas_producao', label: 'Pessoas ativas na produção/serviços' },
  { chave: 'direcao', label: 'Pessoas na direção/coordenação' },
  { chave: 'remuneradas', label: 'Pessoas remuneradas regularmente' },
  { chave: 'voluntarias', label: 'Pessoas voluntárias' },
  { chave: 'novas_12m', label: 'Novas ingressantes últimos 12 meses' },
  { chave: 'desligadas_12m', label: 'Pessoas desligadas últimos 12 meses' },
]

const COL_FAIXA = [
  { key: 'quantidade', label: 'Quantidade', tipo: 'numero' as const },
  { key: 'observacao', label: 'Observação', tipo: 'texto' as const },
]
const LINHAS_FAIXA = [
  { chave: 'jovens_15_29', label: 'Jovens de 15 a 29 anos' },
  { chave: '30_59', label: 'Pessoas de 30 a 59 anos' },
  { chave: '60_mais', label: 'Pessoas com 60 anos ou mais' },
  { chave: 'negras', label: 'Pessoas negras (pretas e pardas)' },
  { chave: 'indigenas', label: 'Povos indígenas' },
  { chave: 'quilombolas', label: 'Quilombolas' },
  { chave: 'ribeirinhos', label: 'Ribeirinhos/as ou extrativistas' },
  { chave: 'pcd', label: 'Pessoas com deficiência' },
  { chave: 'agricultores', label: 'Agricultores/as familiares' },
  { chave: 'pescadores', label: 'Pescadores/as artesanais' },
]

const COL_INSTANCIA = [
  { key: 'total_integrantes', label: 'Total', tipo: 'numero' as const },
  { key: 'mulheres', label: 'Mulheres', tipo: 'numero' as const },
  { key: 'jovens', label: 'Jovens 15-29', tipo: 'numero' as const },
  { key: 'periodicidade', label: 'Periodicidade', tipo: 'texto' as const },
]
const LINHAS_INSTANCIA = [
  { chave: 'direcao_coordenacao', label: 'Direção/coordenação' },
  { chave: 'conselho_fiscal', label: 'Conselho fiscal' },
  { chave: 'outras', label: 'Outras instâncias' },
]

export function Secao03Composicao({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  const setMatriz = (campo: string) => (chave: string, linha: any) =>
    set({ [campo]: { ...(dados[campo] || {}), [chave]: linha } })

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Indicador — linha de base</p>
        <MatrizFixa linhas={LINHAS_VINCULO} colunas={COL_VINCULO} valores={dados.indicadores_vinculo || {}} onChange={setMatriz('indicadores_vinculo')} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Faixa/grupo — linha de base</p>
        <MatrizFixa linhas={LINHAS_FAIXA} colunas={COL_FAIXA} valores={dados.faixas_grupo || {}} onChange={setMatriz('faixas_grupo')} />
      </div>
      <CampoSelect label="3.1 Há política ou prática de inclusão e não discriminação?" value={dados.politica_inclusao ?? ''}
        onChange={v => set({ politica_inclusao: v })}
        opcoes={[{ value: 'formalizada', label: 'Sim, formalizada' }, { value: 'sim', label: 'Sim, informal' }, { value: 'nao', label: 'Não' }, { value: 'em_construcao', label: 'Em construção' }]} />
      <CampoTexto label="3.2 Como mulheres, jovens e povos/comunidades tradicionais participam das decisões?" multiline
        value={dados.participacao_decisoes ?? ''} onChange={v => set({ participacao_decisoes: v })} />
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Instâncias de participação</p>
        <MatrizFixa linhas={LINHAS_INSTANCIA} colunas={COL_INSTANCIA} valores={dados.instancias || {}} onChange={setMatriz('instancias')} />
      </div>
    </div>
  )
}
