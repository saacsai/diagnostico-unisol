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

// ── Parte A — Responsável pela aplicação (controle e consentimento) ──────────
// Revisão do documento (2026-09): A.1 código único, A.3 BSR responsável (antes
// só dentro do texto livre de A.2), A.7 datas de aplicação/corte do Marco 0 —
// campos novos. A.7.1/A.7.2 são notas de orientação impressas no formulário
// (período de referência, convenção NI/NA/NV), não campos de resposta.
export interface Secao01Controle {
  codigo_empreendimento: string
  aplicador_nome: string
  aplicador_instituicao: string
  aplicador_bsr: string
  participantes_entrevista: string
  modalidade: 'presencial' | 'online' | 'hibrida' | ''
  local_duracao: string
  data_aplicacao: string
  data_corte_marco0: string
  consentimento_dados: 'sim' | 'nao' | 'sim_exceto_pessoais' | ''
  consentimento_imagem: 'sim' | 'nao' | 'somente_sem_identificacao' | ''
}

// ── Seção 2 — NÃO fica em `respostas` — grava direto em `empreendimentos` ────
// (mantido aqui só como referência do mapeamento de campos, ver EmpreendimentoForm)

// ── Parte B — Beneficiários (B.1 composição, B.2 instâncias, B.3 renda/
// trabalho/impacto, B.4 formação/lideranças/comitês) ──────────────────────────
// Fusão de 2026-09: a versão anterior tinha Formação e Renda como blocos do
// EMPREENDIMENTO (seções 14 e 15) — o documento revisado deixa claro que são
// dados de BENEFICIÁRIO, não do empreendimento em si, e junta tudo em Parte B.
export interface ParteBBeneficiarios {
  // B.1
  indicadores_vinculo: LinhaTabela[]   // total/mulheres/homens/nao_binarias/nao_informado × 7 categorias
  faixas_grupo: LinhaTabela[]          // quantidade+observação × 10 faixas
  politica_inclusao: SimNaoParcial | 'formalizada' | 'em_construcao' | ''
  participacao_decisoes: string
  // B.2
  instancias: LinhaTabela[]            // total/mulheres/jovens/periodicidade × direção/conselho/outras
  // B.3 — renda, trabalho e impacto socioeconômico (indicador 2.9.3 do Plano de Trabalho)
  renda_indicadores: LinhaTabela[]     // valor+unidade × 7 indicadores linha de base
  renda_metodo_estimativa: string
  renda_beneficios_nao_monetarios: string
  renda_mudancas_esperadas: string
  // B.4 — formação, lideranças e comitês de mulheres e juventude (indicador 2.9.2)
  formacao_indicador: LinhaTabela[]    // total/mulheres/jovens × 2 linhas (formação própria / BSR-EcoUni)
  interesse_comite_mulheres_juventude: 'sim' | 'nao' | 'talvez' | 'ja_participa' | ''
  liderancas_indicadas: string
  formacao_temas: LinhaTabela[]        // necessidade(0-4)/quem participa/modalidade/resultado × 13 temas
  formacao_condicoes_online: 'boas' | 'parciais' | 'insuficientes' | 'sem_acesso' | ''
  formacao_dias_horarios_apoios: string
  formacao_realizadas_2anos: string
  formacao_saberes_compartilhar: string
}

// ── Bloco 1 — Documentação e Regularidade ──────────────────────────────────────
// Separado da antiga Seção 5 (Governança) — ganha régua de maturidade própria e
// 3 itens novos (licença sanitária do produto, regularidade ambiental, selo de
// inspeção SIM/SIE/SIF/SISBI), 13 documentos no total (eram 10).
export interface Bloco1Documentacao {
  documentos: LinhaTabela[]   // situação/validade/pendência × 13 documentos
  regua_classificacao: Escala0a4
  regua_evidencia: string
}

// ── Bloco 2 — Gestão e Governança ──────────────────────────────────────────────
// Antiga Seção 5 sem a tabela de documentos (virou Bloco 1) e sem o interesse no
// Comitê de Mulheres/Juventude (duplicado — já vive em Parte B.4.1). Ganha os
// campos que eram da antiga Seção 4 (conquistas/dificuldades/relações/
// princípios — origem/missão/reconhecimento economia solidária foram pro
// Bloco 0) e régua de maturidade própria.
export interface Bloco2Governanca {
  participacao_quadro_social: Escala0a4
  regularidade_assembleias: Escala0a4
  transparencia_prestacao_contas: Escala0a4
  divisao_responsabilidades: Escala0a4
  planejamento_estrategico: Escala0a4
  gestao_conflitos: Escala0a4
  frequencia_reunioes: string
  decisoes_ultimo_ano: string
  conquistas_3anos: string
  dificuldades_3anos: string
  relacoes_comunidade: string
  principios_praticados: string
  necessidades_juridicas: string
  regua_classificacao: Escala0a4
  regua_evidencia: string
}

// ── Bloco 3 — Gestão de Pessoas (NOVO, não existia na versão anterior) ────────
// Foco nas práticas internas de gestão de pessoas — dados quantitativos do
// perfil das pessoas vinculadas ficam na Parte B.
export interface Bloco3Pessoas {
  criterios_formalizados: 'sim' | 'parcialmente' | 'nao' | 'na' | ''
  separa_financas_pessoais: 'sempre' | 'parcialmente' | 'nao' | ''
  riscos_seguranca_epis: string
  necessidade_mao_obra_12meses: string
  maturidade_gestao_pessoas: Escala0a4
  regua_classificacao: Escala0a4
  regua_evidencia: string
}

// ── Bloco 4 — Gestão Financeira ────────────────────────────────────────────────
// "Separa finanças pessoais" saiu daqui (duplicata — vive só em Bloco 3.2).
// "Maturidade financeira" isolada virou a régua de fechamento do bloco.
export interface Bloco4Financeiro {
  conta_bancaria: 'sim' | 'nao' | 'em_abertura' | ''
  contabilidade: 'contador_contratado' | 'apoio_parceiro' | 'interna' | 'nao_possui' | ''
  registra_receitas_despesas: 'mensalmente' | 'as_vezes' | 'nao' | 'nao_sabe' | ''
  fluxo_caixa: 'sim_atualiza' | 'sim_desatualizado' | 'nao' | ''
  calcula_custos_precos: 'todos' | 'alguns' | 'nao' | ''
  indicadores_financeiros: LinhaTabela[]   // valor+observação × 7 indicadores
  receita_media_mensal: string
  acessou_credito: 'sim' | 'tentou_nao_conseguiu' | 'nao_tentou' | 'sem_interesse' | ''
  credito_detalhe: string
  necessidade_financiamento: string
  regua_classificacao: Escala0a4
  regua_evidencia: string
}

// ── Seção 7 — Atividade econômica, cadeia produtiva e produtos ────────────────
// ── Bloco 6 — Gestão dos Processos Produtivos (funde Produção + Infraestrutura + Qualidade) ──
// "Riscos de segurança/EPIs" saiu daqui (duplicata — vive só em Bloco 3.3).
// "Padronização do processo" isolada foi absorvida por 6.3.3 (capacidade_padrao_lotes).
// Requisitos de qualidade perderam licença sanitária/ambiental/selo (duplicata — vivem no Bloco 1).
export interface Bloco6Processos {
  cadeia_principal: string
  cadeias_secundarias: string
  produtos: LinhaTabela[]   // unidade/volume/capacidade/preco/sazonalidade
  origem_materias_primas: string
  tipo_producao: 'continua' | 'sazonal' | 'sob_encomenda' | 'irregular' | ''
  meses_safra: string
  etapas_processo: string
  gargalos_perdas: string
  perdas_pos_colheita_baseline: string   // qtd perdida/qtd produzida/unidade/período/% + fonte e método
  perdas_causas_produtos: string
  espaco_producao: 'proprio' | 'cedido' | 'alugado' | 'compartilhado' | 'domiciliar' | 'nao_possui' | ''
  condicoes_area: string
  ambientes: LinhaTabela[]     // existe/condição/capacidade/adequação × 8 ambientes
  equipamentos: LinhaTabela[]  // qtd existente/estado/qtd necessária/finalidade
  manutencao_preventiva: 'sim_programada' | 'somente_corretiva' | 'nao' | 'na' | ''
  adequacoes_prioritarias: string
  requisitos: LinhaTabela[]   // situação/necessidade × 9 requisitos
  certificacao_participativa_baseline: string   // unidades certificadas/elegíveis/% + período/fonte/evidência
  rastreabilidade_documentada_baseline: string  // unidades/elegíveis/% + sistema/registro utilizado
  producao_rastreavel_baseline: string          // volume rastreável/total/% + unidade de medida
  produtos_urgencia_regularizacao: string
  capacidade_padrao_lotes: Escala0a4
  capacidade_planejar_demanda: Escala0a4
  rastreabilidade_origem_comprador: Escala0a4
  regua_classificacao: Escala0a4
  regua_evidencia: string
}

// ── Seção 10 — Comercialização, clientes e acesso a mercados ──────────────────
// ── Bloco 5 — Gestão Comercial ─────────────────────────────────────────────
export interface Bloco5Comercial {
  canais: LinhaTabela[]   // usa/%vendas/valor/desafio × 11 canais
  principais_clientes: string
  catalogo_tabela_precos: 'ambos' | 'somente_catalogo' | 'somente_tabela' | 'nenhum' | ''
  emite_nf: 'sempre' | 'quando_solicitado' | 'nao' | 'na' | ''
  participa_licitacoes: 'regularmente' | 'ja_participou' | 'tem_interesse' | 'sem_interesse' | ''
  barreiras_paa_pnae: string
  metas_comerciais_12meses: string
  maturidade_comercial: Escala0a4
  regua_classificacao: Escala0a4
  regua_evidencia: string
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
  parteB?: ParteBBeneficiarios
  bloco1?: Bloco1Documentacao
  bloco2?: Bloco2Governanca
  bloco3?: Bloco3Pessoas
  bloco4?: Bloco4Financeiro
  bloco5?: Bloco5Comercial
  bloco6?: Bloco6Processos
  secao11?: Secao11Logistica
  secao12?: Secao12Tecnologia
  secao13?: Secao13Sustentabilidade
  secao16?: Secao16Parcerias
}

export interface AnaliseTecnicaDiagnostico {
  secao17?: Secao17Analise
  secao18?: Secao18PlanoAcao
  anexoA?: AnexoAEvidencias
  anexoB?: AnexoBSintese
}
