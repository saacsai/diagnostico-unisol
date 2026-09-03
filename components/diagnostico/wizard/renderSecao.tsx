import { Empreendimento } from '@/lib/supabase'
import { Secao02Identificacao } from '../secoes/Secao02Identificacao'
import { Secao01Controle } from '../secoes/Secao01Controle'
import { Secao03Composicao } from '../secoes/Secao03Composicao'
import { Secao04Historico } from '../secoes/Secao04Historico'
import { Secao05Governanca } from '../secoes/Secao05Governanca'
import { Secao06Financeiro } from '../secoes/Secao06Financeiro'
import { Secao07Producao } from '../secoes/Secao07Producao'
import { Secao08Infraestrutura } from '../secoes/Secao08Infraestrutura'
import { Secao09Qualidade } from '../secoes/Secao09Qualidade'
import { Secao10Comercializacao } from '../secoes/Secao10Comercializacao'
import { Secao11Logistica } from '../secoes/Secao11Logistica'
import { Secao12Tecnologia } from '../secoes/Secao12Tecnologia'
import { Secao13Sustentabilidade } from '../secoes/Secao13Sustentabilidade'
import { Secao14Formacao } from '../secoes/Secao14Formacao'
import { Secao15Renda } from '../secoes/Secao15Renda'
import { Secao16Parcerias } from '../secoes/Secao16Parcerias'
import { Secao17Analise } from '../secoes/Secao17Analise'
import { Secao18PlanoAcao } from '../secoes/Secao18PlanoAcao'
import { AnexoAEvidencias } from '../secoes/AnexoAEvidencias'
import { AnexoBSintese } from '../secoes/AnexoBSintese'

export interface SecaoContext {
  diagnosticoId: string
  empreendimento: Empreendimento | null
  setEmpreendimento: (e: Empreendimento) => void
  respostas: Record<string, unknown>
  analiseTecnica: Record<string, unknown>
  setRespostaSecao: (id: string, dados: unknown) => void
  setAnaliseSecao: (id: string, dados: unknown) => void
}

export function renderSecao(id: string, ctx: SecaoContext) {
  const r = (ctx.respostas[id] as Record<string, unknown>) || {}
  const a = (ctx.analiseTecnica[id] as Record<string, unknown>) || {}
  const onR = (dados: unknown) => ctx.setRespostaSecao(id, dados)
  const onA = (dados: unknown) => ctx.setAnaliseSecao(id, dados)

  switch (id) {
    case 'secao01': return <Secao01Controle dados={r as never} onChange={onR} />
    case 'secao02': return ctx.empreendimento
      ? <Secao02Identificacao empreendimento={ctx.empreendimento} onChange={ctx.setEmpreendimento} />
      : <p className="text-sm text-gray-400">Empreendimento não carregado.</p>
    case 'secao03': return <Secao03Composicao dados={r as never} onChange={onR} />
    case 'secao04': return <Secao04Historico dados={r as never} onChange={onR} />
    case 'secao05': return <Secao05Governanca dados={r as never} onChange={onR} />
    case 'secao06': return <Secao06Financeiro dados={r as never} onChange={onR} />
    case 'secao07': return <Secao07Producao dados={r as never} onChange={onR} />
    case 'secao08': return <Secao08Infraestrutura dados={r as never} onChange={onR} />
    case 'secao09': return <Secao09Qualidade dados={r as never} onChange={onR} />
    case 'secao10': return <Secao10Comercializacao dados={r as never} onChange={onR} />
    case 'secao11': return <Secao11Logistica dados={r as never} onChange={onR} />
    case 'secao12': return <Secao12Tecnologia dados={r as never} onChange={onR} />
    case 'secao13': return <Secao13Sustentabilidade dados={r as never} onChange={onR} />
    case 'secao14': return <Secao14Formacao dados={r as never} onChange={onR} />
    case 'secao15': return <Secao15Renda dados={r as never} onChange={onR} />
    case 'secao16': return <Secao16Parcerias dados={r as never} onChange={onR} />
    case 'secao17': return <Secao17Analise dados={a as never} onChange={onA} />
    case 'secao18': return <Secao18PlanoAcao dados={a as never} onChange={onA} />
    case 'anexoA':  return <AnexoAEvidencias diagnosticoId={ctx.diagnosticoId} />
    case 'anexoB':  return <AnexoBSintese dados={a as never} onChange={onA} />
    default: return null
  }
}
