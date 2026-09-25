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

const COL_RENDA = [
  { key: 'valor', label: 'Valor atual', tipo: 'numero' as const },
  { key: 'unidade', label: 'Unidade/fonte', tipo: 'texto' as const },
]
const LINHAS_RENDA = [
  { chave: 'renda_media_pessoa', label: 'Renda média mensal gerada por pessoa vinculada (R$/pessoa/mês)' },
  { chave: 'renda_media_familia', label: 'Renda média mensal das famílias participantes (R$/família/mês)' },
  { chave: 'postos_permanentes', label: 'Postos de trabalho permanentes (pessoas)' },
  { chave: 'postos_temporarios', label: 'Postos temporários/sazonais (pessoas)' },
  { chave: 'familias_beneficiadas', label: 'Famílias diretamente beneficiadas' },
  { chave: 'pessoas_indiretas', label: 'Pessoas indiretamente beneficiadas (estimativa justificada)' },
  { chave: 'pct_renda_familiar', label: 'Percentual da renda familiar vindo do empreendimento (%)' },
]

const COL_FORMACAO_IND = [
  { key: 'total', label: 'Total', tipo: 'numero' as const },
  { key: 'mulheres', label: 'Mulheres', tipo: 'numero' as const },
  { key: 'jovens', label: 'Jovens (15-29)', tipo: 'numero' as const },
]
const LINHAS_FORMACAO_IND = [
  { chave: 'proprio', label: 'Pessoas capacitadas em processos formativos do empreendimento' },
  { chave: 'bsr_ecouni', label: 'Pessoas capacitadas em oficinas/cursos da BSR/EcoUni após início do projeto (apuração separada)' },
]

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

export function SecaoParteBBeneficiarios({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  const setMatriz = (campo: string) => (chave: string, linha: any) =>
    set({ [campo]: { ...(dados[campo] || {}), [chave]: linha } })

  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-400">
        Reúne todos os dados relativos às pessoas vinculadas ao empreendimento — alimenta diretamente os
        indicadores formativos/inclusão (2.9.2) e produtivos/econômicos (2.9.3) das Metas do Plano de Trabalho.
      </p>

      {/* B.1 */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">B.1 Composição social e perfil — Indicador (linha de base)</p>
        <MatrizFixa linhas={LINHAS_VINCULO} colunas={COL_VINCULO} valores={dados.indicadores_vinculo || {}} onChange={setMatriz('indicadores_vinculo')} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Faixa/grupo — linha de base</p>
        <MatrizFixa linhas={LINHAS_FAIXA} colunas={COL_FAIXA} valores={dados.faixas_grupo || {}} onChange={setMatriz('faixas_grupo')} />
      </div>
      <CampoSelect label="B.1.1 Há política ou prática de inclusão e não discriminação?" value={dados.politica_inclusao ?? ''}
        onChange={v => set({ politica_inclusao: v })}
        opcoes={[{ value: 'formalizada', label: 'Sim, formalizada' }, { value: 'sim', label: 'Sim, informal' }, { value: 'nao', label: 'Não' }, { value: 'em_construcao', label: 'Em construção' }]} />
      <CampoTexto label="B.1.2 Como mulheres, jovens e povos/comunidades tradicionais participam das decisões?" multiline
        value={dados.participacao_decisoes ?? ''} onChange={v => set({ participacao_decisoes: v })} />

      {/* B.2 */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">B.2 Participação nas instâncias de decisão</p>
        <MatrizFixa linhas={LINHAS_INSTANCIA} colunas={COL_INSTANCIA} valores={dados.instancias || {}} onChange={setMatriz('instancias')} />
      </div>

      {/* B.3 */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-700 mb-1">B.3 Renda, trabalho e impacto socioeconômico (indicador 2.9.3)</p>
        <p className="text-xs text-gray-400 mb-2">
          Estes dados formam a linha de base pra medir a meta de aumento médio de renda de 30% e o impacto
          de 20.000 pessoas indiretamente beneficiadas. Combine previamente o conceito e mantenha-o nas
          futuras medições.
        </p>
        <MatrizFixa linhas={LINHAS_RENDA} colunas={COL_RENDA} valores={dados.renda_indicadores || {}} onChange={setMatriz('renda_indicadores')} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 border border-gray-200 rounded-lg p-3">
        <strong>B.3.1</strong> Método usado pra estimar renda e período considerado. Informar a fonte
        (registros financeiros, comprovantes ou estimativa declarada), meses usados no cálculo e número de
        pessoas ou famílias incluídas. Renda média mensal = soma da renda gerada no período ÷ número de
        meses ÷ número de pessoas/famílias considerado. Registrar alterações no grupo acompanhado entre
        Marco 0 e Marco 1.
      </p>
      <CampoTexto label="" multiline value={dados.renda_metodo_estimativa ?? ''} onChange={v => set({ renda_metodo_estimativa: v })} />
      <CampoTexto label="B.3.2 Benefícios não monetários gerados (alimentação, autonomia, vínculos, cultura, território etc.)" multiline
        value={dados.renda_beneficios_nao_monetarios ?? ''} onChange={v => set({ renda_beneficios_nao_monetarios: v })} />
      <CampoTexto label="B.3.3 Mudanças esperadas na renda com o projeto EcoUni Redes Solidárias" multiline
        value={dados.renda_mudancas_esperadas ?? ''} onChange={v => set({ renda_mudancas_esperadas: v })} />

      {/* B.4 */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-700 mb-1">B.4 Formação, lideranças e comitês de mulheres e juventude (indicador 2.9.2)</p>
        <p className="text-xs text-gray-400 mb-2">
          Registrar separadamente a formação anterior à data de corte e a formação oferecida pelo projeto.
          No Marco 0, lançar zero pra ações da EcoUni ainda não realizadas; não somar participações
          repetidas como pessoas únicas. Alimenta as metas de 4.500 beneficiários diretos capacitados
          (mínimo 53% mulheres e 20% jovens), 13 Comitês Estaduais + 1 Comitê Nacional de Mulheres e
          Juventude e 100 lideranças territoriais formadas (20 por região).
        </p>
        <MatrizFixa linhas={LINHAS_FORMACAO_IND} colunas={COL_FORMACAO_IND} valores={dados.formacao_indicador || {}} onChange={setMatriz('formacao_indicador')} />
      </div>
      <CampoSelect label="B.4.1 Interesse em integrar o Comitê Regional/Estadual de Mulheres e Juventude" value={dados.interesse_comite_mulheres_juventude ?? ''}
        onChange={v => set({ interesse_comite_mulheres_juventude: v })}
        opcoes={[{ value: 'sim', label: 'Sim' }, { value: 'nao', label: 'Não' }, { value: 'talvez', label: 'Talvez' }, { value: 'ja_participa', label: 'Já participa' }]} />
      <CampoTexto label="B.4.2 Pessoas indicadas como lideranças territoriais para formação (até 2 nomes, função e contato)" multiline
        value={dados.liderancas_indicadas ?? ''} onChange={v => set({ liderancas_indicadas: v })} />
      <MatrizFixa linhas={LINHAS_TEMA} colunas={COL_TEMA} valores={dados.formacao_temas || {}}
        onChange={setMatriz('formacao_temas')} />
      <CampoSelect label="B.4.3 Condições para formação online" value={dados.formacao_condicoes_online ?? ''} onChange={v => set({ formacao_condicoes_online: v })}
        opcoes={[{ value: 'boas', label: 'Boas' }, { value: 'parciais', label: 'Parciais' }, { value: 'insuficientes', label: 'Insuficientes' }, { value: 'sem_acesso', label: 'Não possui acesso' }]} />
      <CampoTexto label="B.4.4 Dias, horários, acessibilidade e apoios necessários" multiline value={dados.formacao_dias_horarios_apoios ?? ''} onChange={v => set({ formacao_dias_horarios_apoios: v })} />
      <CampoTexto label="B.4.5 Formações realizadas nos últimos dois anos e resultados" multiline value={dados.formacao_realizadas_2anos ?? ''} onChange={v => set({ formacao_realizadas_2anos: v })} />
      <CampoTexto label="B.4.6 Saberes e boas práticas que o empreendimento pode compartilhar" multiline value={dados.formacao_saberes_compartilhar ?? ''} onChange={v => set({ formacao_saberes_compartilhar: v })} />
    </div>
  )
}
