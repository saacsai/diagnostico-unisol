'use client'

import { MatrizFixa } from '../campos/MatrizFixa'
import { EscalaMaturidade0a4 } from '../campos/EscalaMaturidade0a4'
import { CampoTexto } from '../campos/CampoTexto'
import { CampoSelect } from '../campos/CampoSelect'

const OPCOES_BSR = ['Logística', 'Armazenamento', 'Beneficiamento', 'Comercialização', 'Formação', 'Assessoria', 'Todos']

const COL_REC = [
  { key: 'situacao', label: 'Situação', tipo: 'texto' as const },
  { key: 'qtd_qualidade', label: 'Quantidade/qualidade', tipo: 'texto' as const },
  { key: 'necessidade', label: 'Necessidade', tipo: 'texto' as const },
]
const LINHAS_REC = [
  { chave: 'internet', label: 'Internet no local' },
  { chave: 'impressora', label: 'Impressora/leitor/código de barras' },
  { chave: 'computador', label: 'Computador/notebook' },
  { chave: 'smartphone', label: 'Smartphone para gestão/vendas' },
  { chave: 'email', label: 'E-mail institucional' },
  { chave: 'sistema_gestao', label: 'Sistema de gestão/planilhas' },
  { chave: 'pagamento_digital', label: 'Meios de pagamento digital' },
  { chave: 'redes_sociais', label: 'Redes sociais ativas' },
]

const COL_PARCEIRO = [
  { key: 'tipo_apoio', label: 'Tipo de apoio/relação', tipo: 'texto' as const },
  { key: 'situacao', label: 'Situação', tipo: 'texto' as const },
  { key: 'proximo_passo', label: 'Próximo passo', tipo: 'texto' as const },
]
const LINHAS_PARCEIRO = [
  { chave: 'prefeitura_estado', label: 'Prefeitura/governo estadual' },
  { chave: 'mda_federais', label: 'MDA/órgãos federais' },
  { chave: 'universidade', label: 'Universidade/IF/incubadora' },
  { chave: 'movimentos', label: 'Movimentos e fóruns' },
  { chave: 'instituicao_financeira', label: 'Instituição financeira/fundo solidário' },
  { chave: 'empresas', label: 'Empresas/compradores' },
  { chave: 'outros_empreendimentos', label: 'Outros empreendimentos/redes' },
]

export function SecaoBloco9Adaptacao({ dados, onChange }: { dados: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  const set = (patch: Record<string, any>) => onChange({ ...dados, ...patch })
  const selecionados: string[] = dados.interesse_bsr_cnd || []
  function toggleBsr(op: string) {
    const novo = selecionados.includes(op) ? selecionados.filter(s => s !== op) : [...selecionados, op]
    set({ interesse_bsr_cnd: novo })
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-gray-500">9.1 Logística, armazenamento e intercooperação</p>
      <CampoSelect label="9.1.1 Transporte utilizado" value={dados.transporte ?? ''} onChange={v => set({ transporte: v })}
        opcoes={[{ value: 'proprio', label: 'Próprio' }, { value: 'alugado', label: 'Alugado' }, { value: 'terceirizado', label: 'Terceirizado' }, { value: 'parceiro', label: 'Parceiro' }, { value: 'comprador_retira', label: 'Comprador retira' }, { value: 'nao_possui', label: 'Não possui' }]} />
      <CampoTexto label="9.1.2 Rotas, frequência, distâncias e custo médio mensal" multiline value={dados.rotas_frequencia_custo ?? ''} onChange={v => set({ rotas_frequencia_custo: v })} />
      <CampoSelect label="9.1.3 Necessita cadeia fria?" value={dados.cadeia_fria ?? ''} onChange={v => set({ cadeia_fria: v })}
        opcoes={[{ value: 'sim_possui', label: 'Sim e possui' }, { value: 'sim_nao_possui', label: 'Sim e não possui' }, { value: 'nao', label: 'Não' }]} />
      <CampoTexto label="9.1.4 Capacidade e tempo máximo de armazenamento" value={dados.capacidade_armazenamento ?? ''} onChange={v => set({ capacidade_armazenamento: v })} />
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">9.1.5 Interesse em utilizar a BSR e o CND</label>
        <div className="flex flex-wrap gap-1.5">
          {OPCOES_BSR.map(op => {
            const ativo = selecionados.includes(op)
            return (
              <button key={op} type="button" onClick={() => toggleBsr(op)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium border"
                style={ativo ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' } : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }}>
                {op}
              </button>
            )
          })}
        </div>
      </div>
      <CampoTexto label="9.1.6 Produtos que podem integrar circuitos inter-regionais (volume e frequência)" multiline value={dados.produtos_circuitos_inter_regionais ?? ''} onChange={v => set({ produtos_circuitos_inter_regionais: v })} />
      <CampoTexto label="9.1.7 Insumos, serviços ou equipamentos que podem ser compartilhados" multiline value={dados.insumos_compartilhaveis ?? ''} onChange={v => set({ insumos_compartilhaveis: v })} />
      <CampoTexto label="9.1.8 Empreendimentos/redes com que já coopera e forma da parceria" multiline value={dados.parcerias_existentes ?? ''} onChange={v => set({ parcerias_existentes: v })} />
      <EscalaMaturidade0a4 label="9.1.9 Prontidão para logística compartilhada e intercooperação" valor={dados.prontidao_logistica_compartilhada ?? null} onChange={v => set({ prontidao_logistica_compartilhada: v })} />

      <p className="text-xs font-semibold text-gray-500 pt-2">9.2 Tecnologia, comunicação e inserção digital</p>
      <MatrizFixa linhas={LINHAS_REC} colunas={COL_REC} valores={dados.recursos || {}}
        onChange={(chave, linha) => set({ recursos: { ...(dados.recursos || {}), [chave]: linha } })} />
      <CampoSelect label="9.2.1 Interesse em integrar a plataforma digital EcoUni (LMS e marketplace)" value={dados.interesse_plataforma_ecouni ?? ''} onChange={v => set({ interesse_plataforma_ecouni: v })}
        opcoes={[{ value: 'sim', label: 'Sim' }, { value: 'talvez', label: 'Talvez' }, { value: 'nao', label: 'Não' }, { value: 'precisa_apoio', label: 'Precisa de apoio digital' }]} />
      <EscalaMaturidade0a4 label="9.2.2 Maturidade digital do empreendimento" valor={dados.maturidade_digital ?? null} onChange={v => set({ maturidade_digital: v })} />
      <CampoSelect label="9.2.3 Frequência de uso das redes sociais" value={dados.frequencia_redes_sociais ?? ''} onChange={v => set({ frequencia_redes_sociais: v })}
        opcoes={[{ value: 'diaria', label: 'Diária' }, { value: 'semanal', label: 'Semanal' }, { value: 'mensal', label: 'Mensal' }, { value: 'raramente', label: 'Raramente' }, { value: 'nao_usa', label: 'Não usa' }]} />
      <CampoTexto label="9.2.4 Responsável pela comunicação e tempo disponível" multiline value={dados.responsavel_comunicacao ?? ''} onChange={v => set({ responsavel_comunicacao: v })} />
      <CampoTexto label="9.2.5 Materiais existentes: fotos, vídeos, marca, catálogo, história e contatos (indicar quais e onde estão armazenados)" multiline value={dados.materiais_existentes ?? ''} onChange={v => set({ materiais_existentes: v })} />

      <p className="text-xs font-semibold text-gray-500 pt-2">9.3 Parcerias, políticas públicas e incidência</p>
      <MatrizFixa linhas={LINHAS_PARCEIRO} colunas={COL_PARCEIRO} valores={dados.parceiros || {}}
        onChange={(chave, linha) => set({ parceiros: { ...(dados.parceiros || {}), [chave]: linha } })} />
      <CampoTexto label="9.3.1 Políticas públicas já acessadas e resultados" multiline value={dados.politicas_acessadas ?? ''} onChange={v => set({ politicas_acessadas: v })} />
      <CampoTexto label="9.3.2 Demandas de articulação institucional e incidência" multiline value={dados.demandas_articulacao ?? ''} onChange={v => set({ demandas_articulacao: v })} />

      <EscalaMaturidade0a4
        label="Régua de Maturidade do Bloco — Adaptação ao Meio e Relações Institucionais"
        valor={dados.regua_classificacao ?? null}
        onChange={v => set({ regua_classificacao: v })}
        comEvidencia
        evidencia={dados.regua_evidencia ?? ''}
        onEvidenciaChange={v => set({ regua_evidencia: v })}
      />
    </div>
  )
}
