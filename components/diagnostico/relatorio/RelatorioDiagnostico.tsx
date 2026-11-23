'use client'

import type { Diagnostico, Empreendimento } from '@/lib/supabase'
import { SECOES } from '@/lib/diagnostico/secoesConfig'
import { rotuloVersao } from '@/lib/diagnostico/validacao'
import { calcularPontuacao, LABEL_CLASSIFICACAO, DIMENSOES_MATURIDADE } from '@/lib/diagnostico/pontuacao'

// Não existe (ainda) um dicionário de rótulos humanos por campo do formulário — a régua de
// 150+ perguntas vive só como tipo TypeScript (lib/diagnostico/schema.ts), sem label associado.
// Pra não travar a entrega de um relatório imprimível por causa disso, cada campo aparece aqui
// com o nome da chave "humanizado" (ex: `participacao_quadro_social` -> "Participação quadro
// social") — legível, mas não é o texto exato da pergunta do formulário. Se algum dia valer o
// esforço, dá pra trocar por um dicionário chave->pergunta sem mexer no resto deste componente.
function humanizarChave(chave: string): string {
  const texto = chave.replace(/_/g, ' ')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function tabelaGenerica(linhas: [string, Record<string, unknown>][], comColunaChave: boolean): React.ReactNode {
  const colunas = Array.from(new Set(linhas.flatMap(([, linha]) => Object.keys(linha || {}))))
  return (
    <table className="w-full text-xs border-collapse mt-1">
      <thead>
        <tr>
          {comColunaChave && <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-left font-semibold">Item</th>}
          {colunas.map(c => (
            <th key={c} className="border border-gray-200 bg-gray-50 px-2 py-1 text-left font-semibold">{humanizarChave(c)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {linhas.map(([chave, linha], i) => (
          <tr key={chave || i}>
            {comColunaChave && <td className="border border-gray-200 px-2 py-1 align-top font-medium">{humanizarChave(chave)}</td>}
            {colunas.map(c => (
              <td key={c} className="border border-gray-200 px-2 py-1 align-top">{String(linha?.[c] ?? '—')}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function formatarValor(valor: unknown): React.ReactNode {
  if (valor === null || valor === undefined || valor === '') return <span className="text-gray-300">—</span>

  if (Array.isArray(valor)) {
    if (valor.length === 0) return <span className="text-gray-300">—</span>
    // Tabelas de linha dinâmica (TabelaRepetivel) são array de objetos — sem "chave" de linha,
    // só colunas. Array de string pura (ex: multi-select) cai no fallback de baixo.
    if (typeof valor[0] === 'object' && valor[0] !== null) {
      return tabelaGenerica(valor.map((linha, i) => [String(i), linha as Record<string, unknown>]), false)
    }
    return <span>{valor.join(', ')}</span>
  }

  if (typeof valor === 'object') {
    const entradas = Object.entries(valor as Record<string, unknown>)
    if (entradas.length === 0) return <span className="text-gray-300">—</span>
    // Tabelas de linha fixa (MatrizFixa) são um objeto chave->linha — todo valor é por sua vez
    // um objeto (não primitivo). Diferencia de um objeto "normal" de campo->valor solto.
    const pareceTabelaDeLinhas = entradas.every(([, v]) => typeof v === 'object' && v !== null && !Array.isArray(v))
    if (pareceTabelaDeLinhas) {
      return tabelaGenerica(entradas as [string, Record<string, unknown>][], true)
    }
    return (
      <div className="space-y-0.5">
        {entradas.map(([k, v]) => (
          <p key={k}><span className="text-gray-500">{humanizarChave(k)}:</span> {String(v ?? '—')}</p>
        ))}
      </div>
    )
  }

  return <span>{String(valor)}</span>
}

function fmtDataHora(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function RelatorioDiagnostico({
  diagnostico, empreendimento, validadoPorNome, onFechar,
}: {
  diagnostico: Diagnostico
  empreendimento: Empreendimento
  /** Nome de quem validou (join feito por quem chama — este componente não faz query própria). */
  validadoPorNome: string | null
  onFechar: () => void
}) {
  const respostas = (diagnostico.respostas as Record<string, unknown>) || {}
  const analiseTecnica = (diagnostico.analise_tecnica as Record<string, unknown>) || {}
  // bloco11.dimensoes é um Record chave->{nota,evidencia,prioridade} (ver SecaoBloco11Regua.tsx),
  // não um array — mesma forma que calcularPontuacao já espera.
  const bloco11 = (analiseTecnica.bloco11 as { dimensoes?: Record<string, { nota?: string | number; evidencia?: string; prioridade?: string }> } | undefined)
  const dimensoes = bloco11?.dimensoes || {}
  const pontuacao = calcularPontuacao(dimensoes)

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="no-print sticky top-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">Relatório — {rotuloVersao(diagnostico)}</p>
        <div className="flex gap-2">
          <button onClick={() => window.print()}
            className="text-sm font-medium text-white rounded-lg px-4 py-2" style={{ background: 'var(--primary)' }}>
            Imprimir / Salvar PDF
          </button>
          <button onClick={onFechar} className="text-sm font-medium rounded-lg px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50">
            Fechar
          </button>
        </div>
      </div>

      <div id="relatorio-print" className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
          {empreendimento.nome_fantasia || empreendimento.razao_social || 'Sem nome'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {empreendimento.municipio}{empreendimento.uf ? `/${empreendimento.uf}` : ''} · código {empreendimento.codigo || '—'}
          {empreendimento.cnpj ? ` · CNPJ ${empreendimento.cnpj}` : ''}
        </p>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm space-y-0.5">
          <p><span className="font-semibold">{rotuloVersao(diagnostico)}</span> {diagnostico.relato_versao ? `— ${diagnostico.relato_versao}` : ''}</p>
          <p className="text-gray-500">Preenchimento completo em: {fmtDataHora(diagnostico.completo_em)}</p>
          <p className="text-gray-500">
            {diagnostico.validado_em
              ? `Validado por ${validadoPorNome || 'administrador'} em ${fmtDataHora(diagnostico.validado_em)}`
              : 'Ainda não validado pela diretoria'}
          </p>
          {pontuacao.media !== null && (
            <p className="text-gray-500">
              Régua de maturidade: {pontuacao.total}/44 — média {pontuacao.media.toFixed(1)}
              {pontuacao.classificacao ? ` (${LABEL_CLASSIFICACAO[pontuacao.classificacao]})` : ''}
            </p>
          )}
        </div>

        <div className="mt-6 space-y-6">
          {SECOES.map(s => {
            if (s.id === 'anexoA') return null // evidências são arquivo, não dado de formulário — não entra no relatório de texto
            let valor: unknown
            if (s.destino === 'respostas') valor = respostas[s.id]
            else if (s.destino === 'analise_tecnica') valor = analiseTecnica[s.id]
            else return null // bloco0 (empreendimento) já aparece no cabeçalho acima

            if (s.id === 'bloco11') {
              return (
                <section key={s.id} className="break-inside-avoid">
                  <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-200 pb-1 mb-2" style={{ color: 'var(--primary)' }}>
                    {s.numero} — {s.titulo}
                  </h2>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-left">Dimensão</th>
                        <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-left">Nota</th>
                        <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-left">Evidência</th>
                        <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-left">Prioridade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DIMENSOES_MATURIDADE.map(d => {
                        const linha = dimensoes[d.chave] || {}
                        return (
                          <tr key={d.chave}>
                            <td className="border border-gray-200 px-2 py-1">{d.label}</td>
                            <td className="border border-gray-200 px-2 py-1">{String(linha.nota ?? '—')}</td>
                            <td className="border border-gray-200 px-2 py-1">{String(linha.evidencia ?? '—')}</td>
                            <td className="border border-gray-200 px-2 py-1">{String(linha.prioridade ?? '—')}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-500 mt-2">
                    Prontidão EcoUni: {String((valor as { prontidao_ecouni?: string })?.prontidao_ecouni || '—')}
                  </p>
                </section>
              )
            }

            const entradas = valor && typeof valor === 'object' && !Array.isArray(valor)
              ? Object.entries(valor as Record<string, unknown>)
              : null

            return (
              <section key={s.id} className="break-inside-avoid">
                <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-200 pb-1 mb-2" style={{ color: 'var(--primary)' }}>
                  {s.numero} — {s.titulo}
                </h2>
                {entradas ? (
                  <div className="space-y-2 text-sm">
                    {entradas.map(([campo, v]) => (
                      <div key={campo}>
                        <p className="text-xs font-semibold text-gray-600">{humanizarChave(campo)}</p>
                        {formatarValor(v)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-300">Seção não preenchida.</p>
                )}
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
