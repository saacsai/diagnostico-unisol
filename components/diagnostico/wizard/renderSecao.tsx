import { Empreendimento } from '@/lib/supabase'
import { SecaoBloco0Identificacao } from '../secoes/SecaoBloco0Identificacao'
import { SecaoParteAControle } from '../secoes/SecaoParteAControle'
import { SecaoParteBBeneficiarios } from '../secoes/SecaoParteBBeneficiarios'
import { SecaoBloco1Documentacao } from '../secoes/SecaoBloco1Documentacao'
import { SecaoBloco2Governanca } from '../secoes/SecaoBloco2Governanca'
import { SecaoBloco3Pessoas } from '../secoes/SecaoBloco3Pessoas'
import { SecaoBloco4Financeiro } from '../secoes/SecaoBloco4Financeiro'
import { SecaoBloco6Processos } from '../secoes/SecaoBloco6Processos'
import { SecaoBloco5Comercial } from '../secoes/SecaoBloco5Comercial'
import { SecaoBloco9Adaptacao } from '../secoes/SecaoBloco9Adaptacao'
import { SecaoBloco7Socioambiental } from '../secoes/SecaoBloco7Socioambiental'
import { SecaoBloco8Demandas } from '../secoes/SecaoBloco8Demandas'
import { SecaoBloco10Modulos } from '../secoes/SecaoBloco10Modulos'
import { SecaoBloco11Regua } from '../secoes/SecaoBloco11Regua'
import { SecaoBloco12Devolutiva } from '../secoes/SecaoBloco12Devolutiva'
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
    case 'parteA': return <SecaoParteAControle dados={r as never} onChange={onR} />
    case 'bloco0': return ctx.empreendimento
      ? <SecaoBloco0Identificacao empreendimento={ctx.empreendimento} onChange={ctx.setEmpreendimento} />
      : <p className="text-sm text-gray-400">Empreendimento não carregado.</p>
    case 'parteB': return <SecaoParteBBeneficiarios dados={r as never} onChange={onR} />
    case 'bloco1': return <SecaoBloco1Documentacao dados={r as never} onChange={onR} />
    case 'bloco2': return <SecaoBloco2Governanca dados={r as never} onChange={onR} />
    case 'bloco3': return <SecaoBloco3Pessoas dados={r as never} onChange={onR} />
    case 'bloco4': return <SecaoBloco4Financeiro dados={r as never} onChange={onR} />
    case 'bloco5': return <SecaoBloco5Comercial dados={r as never} onChange={onR} />
    case 'bloco6': return <SecaoBloco6Processos dados={r as never} onChange={onR} />
    case 'bloco7': return <SecaoBloco7Socioambiental dados={r as never} onChange={onR} />
    case 'bloco8': return <SecaoBloco8Demandas dados={r as never} onChange={onR} />
    case 'bloco9': return <SecaoBloco9Adaptacao dados={r as never} onChange={onR} />
    case 'bloco10': return <SecaoBloco10Modulos dados={a as never} onChange={onA} />
    case 'bloco11': return <SecaoBloco11Regua dados={a as never} onChange={onA} />
    case 'bloco12': return <SecaoBloco12Devolutiva dados={a as never} onChange={onA} />
    case 'anexoA':  return <AnexoAEvidencias diagnosticoId={ctx.diagnosticoId} />
    case 'anexoB':  return <AnexoBSintese dados={a as never} onChange={onA} />
    default: return null
  }
}
