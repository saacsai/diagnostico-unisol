'use client'

import { MatrizFixa } from '../campos/MatrizFixa'
import { EscalaMaturidade0a4 } from '../campos/EscalaMaturidade0a4'

const COL_DOC = [
  { key: 'situacao', label: 'Situação', tipo: 'select' as const, opcoes: [{ value: 'regular', label: 'Regular' }, { value: 'pendente', label: 'Pendente' }, { value: 'na', label: 'N/A' }] },
  { key: 'validade', label: 'Validade/data', tipo: 'texto' as const },
  { key: 'pendencia', label: 'Pendência/providência', tipo: 'texto' as const },
]
const LINHAS_DOC = [
  { chave: 'estatuto', label: 'Estatuto/contrato social' },
  { chave: 'ata_eleicao', label: 'Ata de eleição da direção' },
  { chave: 'regimento', label: 'Regimento interno' },
  { chave: 'cnpj', label: 'CNPJ' },
  { chave: 'inscricao', label: 'Inscrição estadual/municipal' },
  { chave: 'alvara', label: 'Alvará/licença de funcionamento' },
  { chave: 'certidoes', label: 'Certidões fiscais/trabalhistas' },
  { chave: 'dap_caf', label: 'DAP/CAF jurídica ou registros AF' },
  { chave: 'sanitarios', label: 'Cadastros sanitários/ambientais' },
  { chave: 'compras_publicas', label: 'Cadastro em compras públicas' },
  { chave: 'licenca_sanitaria_produto', label: 'Licença/registro sanitário do produto' },
  { chave: 'regularidade_ambiental', label: 'Licença/regularidade ambiental' },
  { chave: 'selo_inspecao', label: 'Selo de inspeção (SIM/SIE/SIF/SISBI), se aplicável' },
]

export function SecaoBloco1Documentacao({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-5">
      <p className="text-xs text-gray-400">
        Consolida toda a situação documental, sanitária, ambiental e de cadastros do empreendimento —
        corresponde ao Anexo A (Checklist de Evidências).
      </p>
      <MatrizFixa linhas={LINHAS_DOC} colunas={COL_DOC} valores={dados.documentos || {}}
        onChange={(chave, linha) => set({ documentos: { ...(dados.documentos || {}), [chave]: linha } })} />
      <EscalaMaturidade0a4
        label="Régua de Maturidade do Bloco — Documentação e Regularidade"
        valor={dados.regua_classificacao ?? null}
        onChange={v => set({ regua_classificacao: v })}
        comEvidencia
        evidencia={dados.regua_evidencia ?? ''}
        onEvidenciaChange={v => set({ regua_evidencia: v })}
      />
    </div>
  )
}
