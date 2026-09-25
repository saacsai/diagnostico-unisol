'use client'

import { MatrizFixa } from '../campos/MatrizFixa'
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

const COL_REQ = [
  { key: 'situacao', label: 'Situação atual', tipo: 'texto' as const },
  { key: 'necessidade', label: 'Necessidade/encaminhamento', tipo: 'texto' as const },
]
const LINHAS_REQ = [
  { chave: 'bpf', label: 'Boas práticas de fabricação/manipulação' },
  { chave: 'ficha_tecnica', label: 'Ficha técnica dos produtos' },
  { chave: 'rotulagem', label: 'Rotulagem conforme legislação' },
  { chave: 'info_nutricional', label: 'Informação nutricional, quando aplicável' },
  { chave: 'codigo_barras', label: 'Código de barras/QR Code' },
  { chave: 'marca', label: 'Marca e identidade visual' },
  { chave: 'embalagem', label: 'Embalagem adequada e sustentável' },
  { chave: 'certificacao_organica', label: 'Certificação orgânica/participativa' },
  { chave: 'rastreabilidade', label: 'Rastreabilidade por lote/origem' },
]

export function SecaoBloco6Processos({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-gray-500">6.1 Cadeia produtiva e produtos</p>
      <CampoSelect label="6.1.1 Cadeia principal" value={dados.cadeia_principal ?? ''} onChange={v => set({ cadeia_principal: v })} opcoes={CADEIAS} />
      <CampoTexto label="6.1.2 Cadeias secundárias e atividades complementares" multiline value={dados.cadeias_secundarias ?? ''} onChange={v => set({ cadeias_secundarias: v })} />
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Produtos/serviços</p>
        <TabelaRepetivel colunas={COL_PRODUTO} linhas={dados.produtos || []} onChange={v => set({ produtos: v })} minLinhas={1} />
      </div>
      <CampoTexto label="6.1.3 Origem das matérias-primas e principais fornecedores" multiline value={dados.origem_materias_primas ?? ''} onChange={v => set({ origem_materias_primas: v })} />
      <CampoSelect label="6.1.4 A produção é" value={dados.tipo_producao ?? ''} onChange={v => set({ tipo_producao: v })}
        opcoes={[{ value: 'continua', label: 'Contínua' }, { value: 'sazonal', label: 'Sazonal' }, { value: 'sob_encomenda', label: 'Sob encomenda' }, { value: 'irregular', label: 'Irregular' }]} />
      <CampoTexto label="6.1.5 Meses de safra, entressafra ou maior produção" value={dados.meses_safra ?? ''} onChange={v => set({ meses_safra: v })} />
      <CampoTexto label="6.1.6 Etapas do processo produtivo — da matéria-prima ao produto final" multiline value={dados.etapas_processo ?? ''} onChange={v => set({ etapas_processo: v })} />
      <CampoTexto label="6.1.7 Principais gargalos produtivos e perdas" multiline value={dados.gargalos_perdas ?? ''} onChange={v => set({ gargalos_perdas: v })} />
      <div>
        <CampoTexto label="6.1.8 Perdas pós-colheita/pós-produção — linha de base" multiline value={dados.perdas_pos_colheita_baseline ?? ''} onChange={v => set({ perdas_pos_colheita_baseline: v })} />
        <p className="text-xs text-gray-400 mt-1">
          Registrar: quantidade perdida; quantidade produzida; unidade; período; percentual (= quantidade perdida ÷ quantidade produzida × 100).
          Indicar também produto, fonte e método de estimativa.
        </p>
      </div>
      <CampoTexto label="6.1.9 Perdas pós-colheita/pós-produção: principais causas e produtos afetados" multiline value={dados.perdas_causas_produtos ?? ''} onChange={v => set({ perdas_causas_produtos: v })} />

      <p className="text-xs font-semibold text-gray-500 pt-2">6.2 Infraestrutura, equipamentos e beneficiamento</p>
      <CampoSelect label="6.2.1 Espaço de produção/beneficiamento" value={dados.espaco_producao ?? ''} onChange={v => set({ espaco_producao: v })}
        opcoes={[{ value: 'proprio', label: 'Próprio' }, { value: 'cedido', label: 'Cedido' }, { value: 'alugado', label: 'Alugado' }, { value: 'compartilhado', label: 'Compartilhado' }, { value: 'domiciliar', label: 'Domiciliar' }, { value: 'nao_possui', label: 'Não possui' }]} />
      <CampoTexto label="6.2.2 Área aproximada, condições de acesso, água, energia, internet e segurança" multiline value={dados.condicoes_area ?? ''} onChange={v => set({ condicoes_area: v })} />
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Ambiente/estrutura</p>
        <MatrizFixa linhas={LINHAS_AMBIENTE} colunas={COL_AMBIENTE} valores={dados.ambientes || {}}
          onChange={(chave, linha) => set({ ambientes: { ...(dados.ambientes || {}), [chave]: linha } })} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Equipamentos</p>
        <TabelaRepetivel colunas={COL_EQUIP} linhas={dados.equipamentos || []} onChange={v => set({ equipamentos: v })} />
      </div>
      <CampoSelect label="6.2.3 Possui manutenção preventiva?" value={dados.manutencao_preventiva ?? ''} onChange={v => set({ manutencao_preventiva: v })}
        opcoes={[{ value: 'sim_programada', label: 'Sim, programada' }, { value: 'somente_corretiva', label: 'Somente corretiva' }, { value: 'nao', label: 'Não' }, { value: 'na', label: 'N/A' }]} />
      <CampoTexto label="6.2.4 Adequações prioritárias para beneficiamento e armazenamento" multiline value={dados.adequacoes_prioritarias ?? ''} onChange={v => set({ adequacoes_prioritarias: v })} />

      <p className="text-xs font-semibold text-gray-500 pt-2">6.3 Qualidade, regularização, embalagem e rastreabilidade</p>
      <MatrizFixa linhas={LINHAS_REQ} colunas={COL_REQ} valores={dados.requisitos || {}}
        onChange={(chave, linha) => set({ requisitos: { ...(dados.requisitos || {}), [chave]: linha } })} />
      <div>
        <CampoTexto label="6.3.1.a Unidades produtivas com certificação participativa — linha de base" multiline value={dados.certificacao_participativa_baseline ?? ''} onChange={v => set({ certificacao_participativa_baseline: v })} />
        <p className="text-xs text-gray-400 mt-1">Registrar: nº de unidades certificadas de nº de unidades elegíveis = %. Contar unidades, não volume produzido. Informar período, fonte e evidência.</p>
      </div>
      <div>
        <CampoTexto label="6.3.1.b Unidades produtivas com rastreabilidade documentada — linha de base" multiline value={dados.rastreabilidade_documentada_baseline ?? ''} onChange={v => set({ rastreabilidade_documentada_baseline: v })} />
        <p className="text-xs text-gray-400 mt-1">Registrar: nº de unidades de nº de unidades elegíveis = %. Indicar sistema ou registro utilizado.</p>
      </div>
      <div>
        <CampoTexto label="6.3.1.c Produção rastreável, se mensurável — linha de base" multiline value={dados.producao_rastreavel_baseline ?? ''} onChange={v => set({ producao_rastreavel_baseline: v })} />
        <p className="text-xs text-gray-400 mt-1">Registrar: quantidade de [unidade de volume] = %. Não misturar com o percentual de unidades produtivas.</p>
      </div>
      <CampoTexto label="6.3.2 Produtos com maior urgência de regularização e motivo" multiline value={dados.produtos_urgencia_regularizacao ?? ''} onChange={v => set({ produtos_urgencia_regularizacao: v })} />
      <EscalaMaturidade0a4 label="6.3.3 Capacidade de garantir padrão e qualidade entre lotes" valor={dados.capacidade_padrao_lotes ?? null} onChange={v => set({ capacidade_padrao_lotes: v })} />
      <EscalaMaturidade0a4 label="6.3.4 Capacidade de planejar produção a partir da demanda" valor={dados.capacidade_planejar_demanda ?? null} onChange={v => set({ capacidade_planejar_demanda: v })} />
      <EscalaMaturidade0a4 label="6.3.5 Mecanismo de rastreabilidade da origem ao comprador" valor={dados.rastreabilidade_origem_comprador ?? null} onChange={v => set({ rastreabilidade_origem_comprador: v })} />

      <EscalaMaturidade0a4
        label="Régua de Maturidade do Bloco — Gestão dos Processos Produtivos"
        valor={dados.regua_classificacao ?? null}
        onChange={v => set({ regua_classificacao: v })}
        comEvidencia
        evidencia={dados.regua_evidencia ?? ''}
        onEvidenciaChange={v => set({ regua_evidencia: v })}
      />
    </div>
  )
}
