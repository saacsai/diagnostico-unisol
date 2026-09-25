'use client'

import { MatrizFixa } from '../campos/MatrizFixa'

const COL_SINTESE = [
  { key: 'linha_base', label: 'Linha de base', tipo: 'texto' as const },
  { key: 'meta', label: 'Meta do empreendimento', tipo: 'texto' as const },
  { key: 'fonte', label: 'Fonte', tipo: 'texto' as const },
]

const INDICADORES = [
  { chave: 'pessoas_vinculadas', label: 'Pessoas vinculadas (Semestral)' },
  { chave: 'pct_mulheres', label: '% de mulheres entre participantes (Semestral)' },
  { chave: 'pct_jovens', label: '% de jovens 15–29 anos (Semestral)' },
  { chave: 'pct_mulheres_jovens_governanca', label: '% de mulheres/jovens na governança (Semestral)' },
  { chave: 'faturamento_bruto_mensal', label: 'Faturamento bruto mensal médio R$ (Trimestral)' },
  { chave: 'renda_media_familia', label: 'Renda média por família R$ (Semestral)' },
  { chave: 'volume_produzido', label: 'Volume produzido por produto (Trimestral)' },
  { chave: 'capacidade_utilizada', label: 'Capacidade produtiva utilizada % (Trimestral)' },
  { chave: 'perdas_pos_producao', label: 'Perdas pós-produção % (Semestral)' },
  { chave: 'vendas_paa_pnae', label: 'Vendas para PAA/PNAE R$ (Semestral)' },
  { chave: 'vendas_privadas_digitais', label: 'Vendas privadas/digitais R$ (Semestral)' },
  { chave: 'canais_comercializacao', label: 'Nº de canais de comercialização (Semestral)' },
  { chave: 'unidades_agroecologicas', label: 'Unidades com prática agroecológica % (Semestral)' },
  { chave: 'produtos_rastreabilidade', label: 'Produtos com rastreabilidade/certificação (Semestral)' },
  { chave: 'participacoes_formacao', label: 'Participações em formação — pessoas/horas (Trimestral)' },
  { chave: 'liderancas_territoriais', label: 'Lideranças territoriais formadas (Trimestral)' },
  { chave: 'comites_instalados', label: 'Comitês de Mulheres/Juventude instalados (Trimestral)' },
  { chave: 'nota_media_maturidade', label: 'Nota média de maturidade 0–4 (Anual)' },
]

export function AnexoBSintese({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const valores = dados.indicadores || {}
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">
        Indicadores-chave alinhados às Metas 1 a 5 do Plano de Trabalho, para alimentação do Sistema de
        Monitoramento e Avaliação Participativa (MAP). "Linha de base" registra o Marco 0. Regra de
        comparação com o Marco 1: mesma unidade, período de apuração, fonte e denominador. Variação
        absoluta = Marco 1 − Marco 0; variação percentual = (Marco 1 − Marco 0) ÷ Marco 0 × 100, somente
        se Marco 0 for maior que zero.
      </p>
      <MatrizFixa
        linhas={INDICADORES}
        colunas={COL_SINTESE}
        valores={valores}
        onChange={(chave, linha) => onChange({ ...dados, indicadores: { ...valores, [chave]: linha } })}
      />
    </div>
  )
}
