'use client'

import { ChecklistSituacao } from '../campos/ChecklistSituacao'

const ITENS = [
  { chave: 'estatuto', label: 'Estatuto e alterações' },
  { chave: 'ata_eleicao', label: 'Ata de eleição vigente' },
  { chave: 'cnpj_cadastros', label: 'Cartão CNPJ/cadastros' },
  { chave: 'licencas', label: 'Licenças e certificados' },
  { chave: 'relacao_associados', label: 'Relação de associados/cooperados' },
  { chave: 'demonstrativos', label: 'Demonstrativos/controles financeiros' },
  { chave: 'registros_producao_vendas', label: 'Registros de produção e vendas' },
  { chave: 'catalogo_rotulos', label: 'Catálogo, rótulos e tabela de preços' },
  { chave: 'fotos', label: 'Fotos autorizadas da estrutura/produtos' },
  { chave: 'comprovantes_paa_pnae', label: 'Comprovantes de PAA/PNAE/mercados' },
  { chave: 'certificacoes', label: 'Certificações/rastreabilidade' },
]

const ESTADOS = [
  { valor: 'anexado', label: 'Anexado' },
  { valor: 'nao_existe', label: 'Não existe' },
  { valor: 'pendente', label: 'Pendente' },
]

export function AnexoAEvidencias({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const valores = dados.itens || {}
  return (
    <ChecklistSituacao
      itens={ITENS}
      valores={valores}
      estados={ESTADOS}
      onChange={(chave, linha) => onChange({ ...dados, itens: { ...valores, [chave]: linha } })}
    />
  )
}
