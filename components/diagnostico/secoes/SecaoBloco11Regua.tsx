'use client'

import { useEffect, useRef } from 'react'
import { MatrizFixa } from '../campos/MatrizFixa'
import { CampoSelect } from '../campos/CampoSelect'
import { DIMENSOES_MATURIDADE, calcularPontuacao, LABEL_CLASSIFICACAO } from '@/lib/diagnostico/pontuacao'

const COL_DIMENSAO = [
  { key: 'nota', label: 'Nota 0-4/N-A', tipo: 'select' as const, opcoes: [...[0, 1, 2, 3, 4].map(n => ({ value: String(n), label: String(n) })), { value: 'na', label: 'N/A' }] },
  { key: 'evidencia', label: 'Evidência principal', tipo: 'texto' as const },
  { key: 'prioridade', label: 'Prioridade', tipo: 'select' as const, opcoes: [{ value: 'alta', label: 'Alta' }, { value: 'media', label: 'Média' }, { value: 'baixa', label: 'Baixa' }] },
]

export function SecaoBloco11Regua({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  const dimensoes = dados.dimensoes || {}
  const { total, media, classificacao } = calcularPontuacao(dimensoes)
  const ultimaClassificacao = useRef<string | null>(null)

  useEffect(() => {
    if (classificacao !== ultimaClassificacao.current) {
      ultimaClassificacao.current = classificacao
      set({ pontuacao_total: total, classificacao })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, classificacao])

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 -mt-2">
        Preenchimento pela equipe técnica após a entrevista, consolidando as réguas de maturidade registradas
        ao final de cada Bloco (0 a 9). A nota deve refletir as evidências registradas, não apenas a percepção
        da pessoa aplicadora. Usar N/A apenas quando a dimensão não se aplicar — ela é excluída do denominador.
      </p>
      <MatrizFixa
        linhas={DIMENSOES_MATURIDADE.map(d => ({ chave: d.chave, label: d.label }))}
        colunas={COL_DIMENSAO}
        valores={dimensoes}
        onChange={(chave, linha) => set({ dimensoes: { ...dimensoes, [chave]: linha } })}
      />
      <div className="rounded-lg p-3" style={{ background: 'var(--primary-light)' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--primary-dark)' }}>
          11.1 Pontuação total: {total ?? '—'} / 44 {media !== null && `(média ${media.toFixed(1)})`}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--primary-dark)' }}>
          11.2 Classificação: {classificacao ? LABEL_CLASSIFICACAO[classificacao] : '—'}
        </p>
      </div>
      <CampoSelect label="11.3 Prontidão para participação na EcoUni" value={dados.prontidao_ecouni ?? ''} onChange={v => set({ prontidao_ecouni: v })}
        opcoes={[{ value: 'imediata', label: 'Imediata' }, { value: 'com_apoio_previo', label: 'Com apoio prévio' }, { value: 'condicionada_regularizacao', label: 'Condicionada a regularização' }, { value: 'reavaliar', label: 'Reavaliar' }]} />
    </div>
  )
}
