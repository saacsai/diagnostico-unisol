'use client'

import { MatrizFixa } from '../campos/MatrizFixa'
import { EscalaMaturidade0a4 } from '../campos/EscalaMaturidade0a4'
import { CampoTexto } from '../campos/CampoTexto'
import { CampoSelect } from '../campos/CampoSelect'

const COL_REC = [
  { key: 'situacao', label: 'Situação', tipo: 'texto' as const },
  { key: 'qtd_qualidade', label: 'Quantidade/qualidade', tipo: 'texto' as const },
  { key: 'necessidade', label: 'Necessidade', tipo: 'texto' as const },
]
const LINHAS_REC = [
  { chave: 'internet', label: 'Internet no local' },
  { chave: 'computador', label: 'Computador/notebook' },
  { chave: 'smartphone', label: 'Smartphone para gestão/vendas' },
  { chave: 'impressora', label: 'Impressora/leitor/código de barras' },
  { chave: 'sistema_gestao', label: 'Sistema de gestão/planilhas' },
  { chave: 'pagamento_digital', label: 'Meios de pagamento digital' },
  { chave: 'email', label: 'E-mail institucional' },
  { chave: 'redes_sociais', label: 'Redes sociais ativas' },
]

export function Secao12Tecnologia({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <MatrizFixa linhas={LINHAS_REC} colunas={COL_REC} valores={dados.recursos || {}}
        onChange={(chave, linha) => set({ recursos: { ...(dados.recursos || {}), [chave]: linha } })} />
      <CampoSelect label="12.1 Frequência de uso das redes sociais" value={dados.frequencia_redes_sociais ?? ''} onChange={v => set({ frequencia_redes_sociais: v })}
        opcoes={[{ value: 'diaria', label: 'Diária' }, { value: 'semanal', label: 'Semanal' }, { value: 'mensal', label: 'Mensal' }, { value: 'raramente', label: 'Raramente' }, { value: 'nao_usa', label: 'Não usa' }]} />
      <CampoTexto label="12.2 Responsável pela comunicação e tempo disponível" multiline value={dados.responsavel_comunicacao ?? ''} onChange={v => set({ responsavel_comunicacao: v })} />
      <CampoTexto label="12.3 Materiais existentes: fotos, vídeos, marca, catálogo, história e contatos" multiline value={dados.materiais_existentes ?? ''} onChange={v => set({ materiais_existentes: v })} />
      <CampoSelect label="12.4 Interesse em integrar a plataforma EcoUni" value={dados.interesse_plataforma_ecouni ?? ''} onChange={v => set({ interesse_plataforma_ecouni: v })}
        opcoes={[{ value: 'sim', label: 'Sim' }, { value: 'talvez', label: 'Talvez' }, { value: 'nao', label: 'Não' }, { value: 'precisa_apoio', label: 'Precisa de apoio digital' }]} />
      <CampoTexto label="12.5 Necessidades de capacitação digital, IA, marketplace e comunicação" multiline value={dados.necessidades_capacitacao_digital ?? ''} onChange={v => set({ necessidades_capacitacao_digital: v })} />
      <EscalaMaturidade0a4 label="12.6 Maturidade digital do empreendimento" valor={dados.maturidade_digital ?? null} onChange={v => set({ maturidade_digital: v })} />
    </div>
  )
}
