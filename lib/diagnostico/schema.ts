// Tipos das respostas do Formulário de Diagnóstico Participativo (18 seções + 2 anexos).
// Fonte: "FORMULARIO DIAGNOSTICO ECOUNI.docx". Guardado como JSONB em diagnosticos.respostas
// (seções 1-16) e diagnosticos.analise_tecnica (seções 17-18 + anexos) — estes tipos existem
// pra dar autocomplete/checagem no dev, não são um schema imposto pelo banco.

export type Escala0a4 = 0 | 1 | 2 | 3 | 4 | null
export type SimNaoParcial = 'sim' | 'nao' | 'parcial' | ''
export type SituacaoDocumento = 'regular' | 'pendente' | 'na' | ''

export interface LinhaTabela {
  [coluna: string]: string | number | null
}

// ── Seção 1 — Controle da aplicação e consentimento ──────────────────────────
export interface Secao01Controle {
  aplicador_nome: string
  aplicador_instituicao: string
  participantes_entrevista: string
  modalidade: 'presencial' | 'online' | 'hibrida' | ''
  local_duracao: string
  consentimento_dados: 'sim' | 'nao' | 'sim_exceto_pessoais' | ''
  consentimento_imagem: 'sim' | 'nao' | 'somente_sem_identificacao' | ''
}

// ── Seção 2 — NÃO fica em `respostas` — grava direto em `empreendimentos` ────
// (mantido aqui só como referência do mapeamento de campos, ver EmpreendimentoForm)

// ── Seção 3 — Composição social e perfil das pessoas ──────────────────────────
export interface Secao03Composicao {
  indicadores_vinculo: LinhaTabela[]   // total/mulheres/homens/nao_binarias/nao_informado × 7 categorias
  faixas_grupo: LinhaTabela[]          // quantidade+observação × 10 faixas
  politica_inclusao: SimNaoParcial | 'formalizada' | 'em_construcao' | ''
  participacao_decisoes: string
  instancias: LinhaTabela[]            // total/mulheres/jovens/periodicidade × direção/conselho/outras
}

// ── Seção 4 — Histórico, identidade e atuação territorial ─────────────────────
export interface Secao04Historico {
  origem_necessidades: string
  missao: string
  conquistas_3anos: string
  dificuldades_3anos: string
  relacoes_comunidade: string
  reconhece_economia_solidaria: 'sim' | 'parcialmente' | 'nao' | 'nao_sabe' | ''
  principios_praticados: string
}

// ── Seção 5 — Governança, autogestão e regularidade institucional ─────────────
export interface Secao05Governanca {
  documentos: LinhaTabela[]   // situação/validade/pendência × 10 documentos
  participacao_quadro_social: Escala0a4
  regularidade_assembleias: Escala0a4
  transparencia_prestacao_contas: Escala0a4
  divisao_responsabilidades: Escala0a4
  planejamento_estrategico: Escala0a4
  gestao_conflitos: Escala0a4
  frequencia_reunioes: string
  decisoes_ultimo_ano: string
  interesse_comite_mulheres_juventude: 'sim' | 'nao' | 'talvez' | 'ja_participa' | ''
  necessidades_juridicas: string
}

// ── Seção 6 — Gestão administrativa, financeira e contábil ────────────────────
export interface Secao06Financeiro {
  conta_bancaria: 'sim' | 'nao' | 'em_abertura' | ''
  contabilidade: 'contador_contratado' | 'apoio_parceiro' | 'interna' | 'nao_possui' | ''
  registra_receitas_despesas: 'mensalmente' | 'as_vezes' | 'nao' | 'nao_sabe' | ''
  fluxo_caixa: 'sim_atualiza' | 'sim_desatualizado' | 'nao' | ''
  calcula_custos_precos: 'todos' | 'alguns' | 'nao' | ''
  separa_financas: 'sempre' | 'parcialmente' | 'nao' | ''
  indicadores_financeiros: LinhaTabela[]   // valor+observação × 7 indicadores
  receita_media_mensal: string
  acessou_credito: 'sim' | 'tentou_nao_conseguiu' | 'nao_tentou' | 'sem_interesse' | ''
  credito_detalhe: string
  necessidade_financiamento: string
  maturidade_financeira: Escala0a4
}

// ── Seção 7 — Atividade econômica, cadeia produtiva e produtos ────────────────
export interface Secao07Producao {
  cadeia_principal: string
  cadeias_secundarias: string
  produtos: LinhaTabela[]   // unidade/volume/capacidade/preco/sazonalidade
  origem_materias_primas: string
  tipo_producao: 'continua' | 'sazonal' | 'sob_encomenda' | 'irregular' | ''
  meses_safra: string
  etapas_processo: string
  gargalos_perdas: string
  padronizacao_qualidade: Escala0a4
  capacidade_planejar_demanda: Escala0a4
}

// ── Seção 8 — Infraestrutura, equipamentos e beneficiamento ───────────────────
export interface Secao08Infraestrutura {
  espaco_producao: 'proprio' | 'cedido' | 'alugado' | 'compartilhado' | 'domiciliar' | 'nao_possui' | ''
  condicoes_area: string
  ambientes: LinhaTabela[]     // existe/condição/capacidade/adequação × 8 ambientes
  equipamentos: LinhaTabela[]  // qtd existente/estado/qtd necessária/finalidade
  manutencao_preventiva: 'sim_programada' | 'somente_corretiva' | 'nao' | 'na' | ''
  riscos_seguranca_epis: string
  adequacoes_prioritarias: string
}

// ── Seção 9 — Qualidade, regularização, embalagem e rastreabilidade ───────────
export interface Secao09Qualidade {
  requisitos: LinhaTabela[]   // situação/necessidade × 11 requisitos
  capacidade_padrao_lotes: Escala0a4
  rastreabilidade_origem_comprador: Escala0a4
  produtos_urgencia_regularizacao: string
}

// ── Seção 10 — Comercialização, clientes e acesso a mercados ──────────────────
export interface Secao10Comercializacao {
  canais: LinhaTabela[]   // usa/%vendas/valor/desafio × 10 canais
  principais_clientes: string
  catalogo_tabela_precos: 'ambos' | 'somente_catalogo' | 'somente_tabela' | 'nenhum' | ''
  emite_nf: 'sempre' | 'quando_solicitado' | 'nao' | 'na' | ''
  participa_licitacoes: 'regularmente' | 'ja_participou' | 'tem_interesse' | 'sem_interesse' | ''
  barreiras_paa_pnae: string
  metas_comerciais_12meses: string
  maturidade_comercial: Escala0a4
}

// ── Seção 11 — Logística, armazenamento e intercooperação ─────────────────────
export interface Secao11Logistica {
  transporte: 'proprio' | 'alugado' | 'terceirizado' | 'parceiro' | 'comprador_retira' | 'nao_possui' | ''
  rotas_frequencia_custo: string
  cadeia_fria: 'sim_possui' | 'sim_nao_possui' | 'nao' | ''
  capacidade_armazenamento: string
  perdas_pos_colheita: string
  interesse_bsr_cnd: string[]   // multi-select: logistica/armazenamento/beneficiamento/comercializacao/formacao/assessoria/todos
  produtos_circuitos_inter_regionais: string
  insumos_compartilhaveis: string
  parcerias_existentes: string
  prontidao_logistica_compartilhada: Escala0a4
}

// ── Seção 12 — Tecnologia, comunicação e inserção digital ─────────────────────
export interface Secao12Tecnologia {
  recursos: LinhaTabela[]   // situação/qtd/necessidade × 8 recursos
  frequencia_redes_sociais: 'diaria' | 'semanal' | 'mensal' | 'raramente' | 'nao_usa' | ''
  responsavel_comunicacao: string
  materiais_existentes: string
  interesse_plataforma_ecouni: 'sim' | 'talvez' | 'nao' | 'precisa_apoio' | ''
  necessidades_capacitacao_digital: string
  maturidade_digital: Escala0a4
}

// ── Seção 13 — Sustentabilidade, agroecologia e sociobiodiversidade ───────────
export interface Secao13Sustentabilidade {
  praticas: LinhaTabela[]   // não/parcial/sim/descrição × 10 práticas
  pct_unidades_agroecologicas: string
  pct_perdas_residuos: string
  riscos_climaticos: string
  tecnologias_sociais: string
  metas_ambientais_12meses: string
}

// ── Seção 14 — Formação, assistência técnica e capacidades ────────────────────
export interface Secao14Formacao {
  temas: LinhaTabela[]   // necessidade(0-4)/quem participa/modalidade/resultado × 12 temas
  formacoes_realizadas: string
  saberes_compartilhar: string
  condicoes_formacao_online: 'boas' | 'parciais' | 'insuficientes' | 'sem_acesso' | ''
  dias_horarios_apoios: string
}

// ── Seção 15 — Renda, trabalho e impacto socioeconômico ───────────────────────
export interface Secao15Renda {
  indicadores: LinhaTabela[]   // valor+unidade × 7 indicadores linha de base
  metodo_estimativa_renda: string
  beneficios_nao_monetarios: string
  mudancas_esperadas: string
}

// ── Seção 16 — Parcerias, políticas públicas e incidência ─────────────────────
export interface Secao16Parcerias {
  parceiros: LinhaTabela[]   // tipo apoio/situação/próximo passo × 7 tipos
  politicas_acessadas: string
  demandas_articulacao: string
}

// ── Seção 17 — Análise de maturidade e priorização técnica (TÉCNICO) ──────────
export interface Secao17Analise {
  dimensoes: LinhaTabela[]   // nota 0-4/evidência/prioridade × 13 dimensões
  pontuacao_total: number | null   // soma das 13 dimensões, máx. 52
  classificacao: 'emergencial' | 'inicial' | 'em_desenvolvimento' | 'estruturado' | 'consolidado' | ''
  potencialidades: string
  gargalos_prioritarios: string
  riscos_participacao: string
  cadeia_territorial_vinculo: string
  prontidao_ecouni: 'imediata' | 'com_apoio_previo' | 'condicionada_regularizacao' | 'reavaliar' | ''
}

// ── Seção 18 — Plano inicial de encaminhamentos (TÉCNICO) ─────────────────────
export interface Secao18PlanoAcao {
  linhas: LinhaTabela[]   // prioridade/ação/responsável/prazo/apoio/indicador × até 10
}

// ── Anexo A — Checklist de evidências ──────────────────────────────────────────
export interface AnexoAEvidencias {
  itens: LinhaTabela[]   // anexado/nao_existe/pendente + observação × 11 itens
}

// ── Anexo B — Quadro-síntese pra sistematização e MAP ──────────────────────────
export interface AnexoBSintese {
  indicadores: LinhaTabela[]   // linha de base/meta/fonte/periodicidade × 14 indicadores-chave
}

export interface RespostasDiagnostico {
  secao01?: Secao01Controle
  secao03?: Secao03Composicao
  secao04?: Secao04Historico
  secao05?: Secao05Governanca
  secao06?: Secao06Financeiro
  secao07?: Secao07Producao
  secao08?: Secao08Infraestrutura
  secao09?: Secao09Qualidade
  secao10?: Secao10Comercializacao
  secao11?: Secao11Logistica
  secao12?: Secao12Tecnologia
  secao13?: Secao13Sustentabilidade
  secao14?: Secao14Formacao
  secao15?: Secao15Renda
  secao16?: Secao16Parcerias
}

export interface AnaliseTecnicaDiagnostico {
  secao17?: Secao17Analise
  secao18?: Secao18PlanoAcao
  anexoA?: AnexoAEvidencias
  anexoB?: AnexoBSintese
}
