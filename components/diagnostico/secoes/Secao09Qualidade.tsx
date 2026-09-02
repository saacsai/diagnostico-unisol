'use client'

import { MatrizFixa } from '../campos/MatrizFixa'
import { EscalaMaturidade0a4 } from '../campos/EscalaMaturidade0a4'
import { CampoTexto } from '../campos/CampoTexto'

const COL_REQ = [
  { key: 'situacao', label: 'Situação atual', tipo: 'texto' as const },
  { key: 'necessidade', label: 'Necessidade/encaminhamento', tipo: 'texto' as const },
]
const LINHAS_REQ = [
  { chave: 'bpf', label: 'Boas práticas de fabricação/manipulação' },
  { chave: 'licenca_sanitaria', label: 'Licença/registro sanitário' },
  { chave: 'licenca_ambiental', label: 'Licença/regularidade ambiental' },
  { chave: 'ficha_tecnica', label: 'Ficha técnica dos produtos' },
  { chave: 'rotulagem', label: 'Rotulagem conforme legislação' },
  { chave: 'info_nutricional', label: 'Informação nutricional, quando aplicável' },
  { chave: 'codigo_barras', label: 'Código de barras/QR Code' },
  { chave: 'marca', label: 'Marca e identidade visual' },
  { chave: 'embalagem', label: 'Embalagem adequada e sustentável' },
  { chave: 'certificacao_organica', label: 'Certificação orgânica/participativa' },
  { chave: 'selo_inspecao', label: 'Selo de inspeção (SIM/SIE/SIF/SISBI)' },
  { chave: 'rastreabilidade', label: 'Rastreabilidade por lote/origem' },
]

export function Secao09Qualidade({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <MatrizFixa linhas={LINHAS_REQ} colunas={COL_REQ} valores={dados.requisitos || {}}
        onChange={(chave, linha) => set({ requisitos: { ...(dados.requisitos || {}), [chave]: linha } })} />
      <EscalaMaturidade0a4 label="9.1 Capacidade de garantir padrão e qualidade entre lotes" valor={dados.capacidade_padrao_lotes ?? null} onChange={v => set({ capacidade_padrao_lotes: v })} />
      <EscalaMaturidade0a4 label="9.2 Mecanismo de rastreabilidade da origem ao comprador" valor={dados.rastreabilidade_origem_comprador ?? null} onChange={v => set({ rastreabilidade_origem_comprador: v })} />
      <CampoTexto label="9.3 Produtos com maior urgência de regularização e motivo" multiline value={dados.produtos_urgencia_regularizacao ?? ''} onChange={v => set({ produtos_urgencia_regularizacao: v })} />
    </div>
  )
}
