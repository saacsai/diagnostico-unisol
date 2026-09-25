import { Empreendimento } from '@/lib/supabase'
import { Secao02Identificacao } from '../secoes/Secao02Identificacao'
import { Secao01Controle } from '../secoes/Secao01Controle'
import { SecaoParteBBeneficiarios } from '../secoes/SecaoParteBBeneficiarios'
import { SecaoBloco1Documentacao } from '../secoes/SecaoBloco1Documentacao'
import { SecaoBloco2Governanca } from '../secoes/SecaoBloco2Governanca'
import { SecaoBloco3Pessoas } from '../secoes/SecaoBloco3Pessoas'
import { SecaoBloco4Financeiro } from '../secoes/SecaoBloco4Financeiro'
import { SecaoBloco6Processos } from '../secoes/SecaoBloco6Processos'
import { SecaoBloco5Comercial } from '../secoes/SecaoBloco5Comercial'
import { Secao11Logistica } from '../secoes/Secao11Logistica'
import { Secao12Tecnologia } from '../secoes/Secao12Tecnologia'
import { Secao13Sustentabilidade } from '../secoes/Secao13Sustentabilidade'
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
    case 'parteB': return <SecaoParteBBeneficiarios dados={r as never} onChange={onR} />
    case 'bloco1': return <SecaoBloco1Documentacao dados={r as never} onChange={onR} />
    case 'bloco2': return <SecaoBloco2Governanca dados={r as never} onChange={onR} />
    case 'bloco3': return <SecaoBloco3Pessoas dados={r as never} onChange={onR} />
    case 'bloco4': return <SecaoBloco4Financeiro dados={r as never} onChange={onR} />
    case 'bloco6': return <SecaoBloco6Processos dados={r as never} onChange={onR} />
    case 'bloco5': return <SecaoBloco5Comercial dados={r as never} onChange={onR} />
    case 'secao11': return <Secao11Logistica dados={r as never} onChange={onR} />
    case 'secao12': return <Secao12Tecnologia dados={r as never} onChange={onR} />
    case 'secao13': return <Secao13Sustentabilidade dados={r as never} onChange={onR} />
    case 'secao16': return <Secao16Parcerias dados={r as never} onChange={onR} />
    case 'secao17': return <Secao17Analise dados={a as never} onChange={onA} />
    case 'secao18': return <Secao18PlanoAcao dados={a as never} onChange={onA} />
    case 'anexoA':  return <AnexoAEvidencias diagnosticoId={ctx.diagnosticoId} />
    case 'anexoB':  return <AnexoBSintese dados={a as never} onChange={onA} />
    default: return null
  }
}
