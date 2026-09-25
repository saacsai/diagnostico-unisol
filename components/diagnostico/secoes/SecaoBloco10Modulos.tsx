'use client'

const SEGMENTOS = [
  { chave: 'mandiocultura', label: 'Mandiocultura e derivados', exigencias: 'Registro/licença de unidade de processamento; boas práticas de fabricação' },
  { chave: 'apicultura', label: 'Apicultura/meliponicultura', exigencias: 'Registro MAPA (mel); rastreabilidade de apiários' },
  { chave: 'fruticultura', label: 'Fruticultura/polpas', exigencias: 'Licença sanitária de fábrica de polpas; cadeia fria' },
  { chave: 'cacau', label: 'Cacau/chocolate artesanal', exigencias: 'Controle de fermentação/secagem; licença sanitária' },
  { chave: 'leite', label: 'Leite e derivados', exigencias: 'SIM/SIE/SIF; cadeia fria obrigatória' },
  { chave: 'horticultura', label: 'Horticultura e panificados', exigencias: 'Boas práticas de manipulação de alimentos' },
  { chave: 'pesca', label: 'Pesca artesanal/pescado', exigencias: 'Registro Geral da Atividade Pesqueira (RGP); SIF/SIE quando aplicável' },
  { chave: 'sociobiodiversidade', label: 'Sociobiodiversidade amazônica (castanha, açaí, óleos)', exigencias: 'Licença ambiental de coleta; certificação de origem' },
  { chave: 'biocosmeticos', label: 'Biocosméticos/fitoterápicos', exigencias: 'Registro ANVISA/regularização sanitária específica' },
]

export function SecaoBloco10Modulos({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const observacoes: Record<string, string> = dados.observacoes || {}
  const set = (chave: string, valor: string) => onChange({ ...dados, observacoes: { ...observacoes, [chave]: valor } })

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">
        Preencher apenas o módulo correspondente à cadeia principal assinalada no item 6.1.1.
        Cada módulo detalha exigências técnicas, sanitárias e de certificação específicas do segmento.
      </p>
      {SEGMENTOS.map(s => (
        <div key={s.chave} className="border border-gray-100 rounded-lg p-3 space-y-1.5">
          <p className="text-xs font-medium text-gray-700">{s.label}</p>
          <p className="text-[11px] text-gray-400">{s.exigencias}</p>
          <textarea
            className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-[var(--primary)]"
            rows={2}
            placeholder="Observações técnicas do empreendimento"
            value={observacoes[s.chave] ?? ''}
            onChange={e => set(s.chave, e.target.value)}
          />
        </div>
      ))}
    </div>
  )
}
