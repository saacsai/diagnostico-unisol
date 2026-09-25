'use client'

import { MatrizFixa } from '../campos/MatrizFixa'
import { EscalaMaturidade0a4 } from '../campos/EscalaMaturidade0a4'
import { CampoTexto } from '../campos/CampoTexto'

const COL_PRATICA = [
  { key: 'nivel', label: 'Nível', tipo: 'select' as const, opcoes: [{ value: 'nao', label: 'Não' }, { value: 'parcial', label: 'Parcial' }, { value: 'sim', label: 'Sim' }] },
  { key: 'descricao', label: 'Descrição/evidência', tipo: 'texto' as const },
]
const LINHAS_PRATICA = [
  { chave: 'agroecologica', label: 'Produção agroecológica/orgânica' },
  { chave: 'conservacao_solo_agua', label: 'Conservação de solo e água' },
  { chave: 'sementes_crioulas', label: 'Uso de sementes crioulas/sistemas biodiversos' },
  { chave: 'sociobiodiversidade', label: 'Uso sustentável da sociobiodiversidade' },
  { chave: 'reuso_agua', label: 'Redução/reuso de água' },
  { chave: 'energia_renovavel', label: 'Eficiência/energia renovável' },
  { chave: 'residuos', label: 'Separação e destinação de resíduos' },
  { chave: 'subprodutos', label: 'Reaproveitamento de subprodutos/economia circular' },
  { chave: 'embalagens_reciclaveis', label: 'Embalagens recicláveis/retornáveis' },
  { chave: 'plano_reducao_perdas', label: 'Plano para reduzir perdas' },
]

export function SecaoBloco7Socioambiental({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">
        Alimenta os indicadores ambientais e de sustentabilidade: ampliação de práticas agroecológicas,
        redução de perdas, transição ecológica e valorização da sociobiodiversidade.
      </p>
      <MatrizFixa linhas={LINHAS_PRATICA} colunas={COL_PRATICA} valores={dados.praticas || {}}
        onChange={(chave, linha) => set({ praticas: { ...(dados.praticas || {}), [chave]: linha } })} />
      <CampoTexto label="7.1 Riscos climáticos e ambientais que afetam a produção" multiline value={dados.riscos_climaticos ?? ''} onChange={v => set({ riscos_climaticos: v })} />
      <CampoTexto label="7.2 Tecnologias sociais ou soluções ambientais já utilizadas" multiline value={dados.tecnologias_sociais ?? ''} onChange={v => set({ tecnologias_sociais: v })} />
      <div>
        <CampoTexto label="7.3 Metas ambientais possíveis para os próximos 12 meses" multiline value={dados.metas_ambientais_12meses ?? ''} onChange={v => set({ metas_ambientais_12meses: v })} />
        <p className="text-xs text-gray-400 mt-1">
          Orientação para o Marco 0: registrar as metas ambientais como compromissos futuros; manter as práticas atuais e respectivos registros como linha de base.
        </p>
      </div>
      <div>
        <CampoTexto label="7.4 Resíduos produtivos — linha de base" multiline value={dados.residuos_baseline ?? ''} onChange={v => set({ residuos_baseline: v })} />
        <p className="text-xs text-gray-400 mt-1">
          Registrar: quantidade gerada; quantidade total produzida; mesma unidade; período; percentual (= resíduos gerados ÷ produção total × 100).
          Registrar destinação e fonte; se unidades incompatíveis, registrar apenas quantidades e justificar.
        </p>
      </div>
      <EscalaMaturidade0a4
        label="Régua de Maturidade do Bloco — Gestão Socioambiental"
        valor={dados.regua_classificacao ?? null}
        onChange={v => set({ regua_classificacao: v })}
        comEvidencia
        evidencia={dados.regua_evidencia ?? ''}
        onEvidenciaChange={v => set({ regua_evidencia: v })}
      />
    </div>
  )
}
