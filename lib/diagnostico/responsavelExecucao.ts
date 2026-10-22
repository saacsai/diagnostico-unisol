import { getSupabase } from '@/lib/supabase'

// Região (IBGE) por UF — só pro rótulo de exibição "UNISOL SP (Sudeste)", não decide
// visibilidade (quem decide é o território real em projeto_executante_territorio).
const REGIAO_POR_UF: Record<string, string> = {
  AC: 'Norte', AM: 'Norte', AP: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
  AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste',
  PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
  ES: 'Sudeste', MG: 'Sudeste', RJ: 'Sudeste', SP: 'Sudeste',
  PR: 'Sul', RS: 'Sul', SC: 'Sul',
  DF: 'Centro-Oeste', GO: 'Centro-Oeste', MT: 'Centro-Oeste', MS: 'Centro-Oeste',
}

// A.3 "Base de Serviços Regional (BSR) responsável pela aplicação" não é mais digitado pelo
// técnico — é o Executante (do modelo Celebrante/Executante/Território) responsável pelo UF
// dessa Filiada, no projeto de execução em rede ao qual ela está vinculada. Busca o primeiro
// projeto em rede que essa Filiada integra; se não tiver nenhum (ou não tiver UF), devolve null.
export async function buscarResponsavelExecucao(empreendimentoId: string, uf: string | null): Promise<string | null> {
  if (!uf) return null
  const sb = getSupabase()

  const { data: vinculos } = await sb
    .from('empreendimento_projeto')
    .select('projeto_id, projetos!inner(execucao_em_rede)')
    .eq('empreendimento_id', empreendimentoId)
    .eq('projetos.execucao_em_rede', true)
    .limit(1)
  const projetoId = (vinculos as { projeto_id: string }[] | null)?.[0]?.projeto_id
  if (!projetoId) return null

  const { data: territorio } = await sb
    .from('projeto_executante_territorio')
    .select('projeto_executantes!inner(projeto_id, unisol_estaduais(nome))')
    .eq('uf', uf)
    .eq('projeto_executantes.projeto_id', projetoId)
    .maybeSingle()
  if (!territorio) return null

  const exec = (territorio as unknown as { projeto_executantes: { unisol_estaduais: { nome: string } | null } }).projeto_executantes
  const nomeExecutante = exec.unisol_estaduais?.nome || 'UNISOL Brasil'
  const regiao = REGIAO_POR_UF[uf]
  return regiao ? `${nomeExecutante} (${regiao})` : nomeExecutante
}
