'use client'

import { Empreendimento } from '@/lib/supabase'
import { useAutosaveEmpreendimento } from '@/lib/diagnostico/useAutosave'
import { useReferenciaEstaduais } from '@/lib/diagnostico/useReferenciaEstaduais'
import { CampoTexto } from '../campos/CampoTexto'
import { CampoSelect } from '../campos/CampoSelect'
import { CampoNumero } from '../campos/CampoNumero'
import { EscalaMaturidade0a4 } from '../campos/EscalaMaturidade0a4'
import { BuscarCnpjBotao } from '@/components/institucional/BuscarCnpjBotao'

export function Secao02Identificacao({
  empreendimento, onChange,
}: {
  empreendimento: Empreendimento
  onChange: (e: Empreendimento) => void
}) {
  const { status, salvar } = useAutosaveEmpreendimento(empreendimento.id)
  const estaduais = useReferenciaEstaduais()

  function set(patch: Partial<Empreendimento>) {
    const novo = { ...empreendimento, ...patch }
    onChange(novo)
    salvar(patch)
  }

  return (
    <div className="space-y-4">
      {status !== 'idle' && (
        <p className="text-xs font-medium text-right" style={{ color: status === 'salvando' ? '#9ca3af' : 'var(--primary)' }}>
          {status === 'salvando' ? 'Salvando…' : status === 'erro' ? 'Erro ao salvar' : 'Salvo'}
        </p>
      )}
      <CampoTexto label="0.1 Razão social / nome formal" value={empreendimento.razao_social ?? ''} onChange={v => set({ razao_social: v })} />
      <CampoTexto label="0.2 Nome fantasia" value={empreendimento.nome_fantasia ?? ''} onChange={v => set({ nome_fantasia: v })} />
      <CampoSelect label="0.3 Forma organizativa" value={empreendimento.forma_organizativa ?? ''}
        onChange={v => set({ forma_organizativa: v as Empreendimento['forma_organizativa'] })}
        opcoes={[
          { value: 'cooperativa', label: 'Cooperativa' }, { value: 'associacao', label: 'Associação' },
          { value: 'grupo_informal', label: 'Grupo informal' }, { value: 'rede_central', label: 'Rede/central' },
          { value: 'empreendimento_comunitario', label: 'Empreendimento comunitário' }, { value: 'outra', label: 'Outra' },
        ]} />
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <CampoTexto label="0.4 CNPJ (se houver)" value={empreendimento.cnpj ?? ''} onChange={v => set({ cnpj: v })} />
        </div>
        <div className="pb-0.5">
          <BuscarCnpjBotao cnpj={empreendimento.cnpj ?? ''} onDados={d => set({
            razao_social: empreendimento.razao_social || d.razao_social,
            endereco: d.endereco || empreendimento.endereco,
            municipio: d.municipio || empreendimento.municipio,
            uf: d.uf || empreendimento.uf,
          })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CampoNumero label="0.5 Ano de criação" value={empreendimento.ano_criacao} onChange={v => set({ ano_criacao: v })} />
        <CampoNumero label="Ano de formalização" value={empreendimento.ano_formalizacao} onChange={v => set({ ano_formalizacao: v })} />
      </div>
      <CampoTexto label="0.6 Endereço completo / comunidade / território" value={empreendimento.endereco ?? ''} onChange={v => set({ endereco: v })} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <CampoTexto label="Região" value={empreendimento.regiao ?? ''} onChange={v => set({ regiao: v })} />
        <CampoTexto label="UF" value={empreendimento.uf ?? ''} onChange={v => set({ uf: v.toUpperCase().slice(0, 2) })} />
        <CampoTexto label="Município" value={empreendimento.municipio ?? ''} onChange={v => set({ municipio: v })} />
        <CampoTexto label="Coordenadas (lat./long.)" value={empreendimento.coordenadas ?? ''} onChange={v => set({ coordenadas: v })} />
      </div>
      <CampoSelect label="Zona" value={empreendimento.zona ?? ''} onChange={v => set({ zona: v as Empreendimento['zona'] })}
        opcoes={[{ value: 'urbana', label: 'Urbana' }, { value: 'rural', label: 'Rural' }, { value: 'transicao', label: 'Transição' }]} />
      <CampoSelect label="0.7 Caracterização territorial" value={empreendimento.territorio_tipo ?? ''}
        onChange={v => set({ territorio_tipo: (v || null) as Empreendimento['territorio_tipo'] })}
        opcoes={[
          { value: 'assentamento', label: 'Assentamento' }, { value: 'quilombo', label: 'Quilombo' },
          { value: 'territorio_indigena', label: 'Território indígena' }, { value: 'comunidade_ribeirinha', label: 'Comunidade ribeirinha' },
          { value: 'comunidade_extrativista', label: 'Comunidade extrativista' }, { value: 'periferia_urbana', label: 'Periferia urbana' },
          { value: 'outro', label: 'Outro' },
        ]} />
      <CampoTexto label="0.8 Área de abrangência e comunidades atendidas" multiline value={empreendimento.area_abrangencia ?? ''} onChange={v => set({ area_abrangencia: v })} />
      <CampoTexto label="0.9 Telefones, e-mail, redes sociais e site" multiline value={empreendimento.telefones ?? ''} onChange={v => set({ telefones: v })} />
      <div className="grid grid-cols-2 gap-3">
        <CampoTexto label="0.10 Pessoa de referência — nome" value={empreendimento.pessoa_referencia_nome ?? ''} onChange={v => set({ pessoa_referencia_nome: v })} />
        <CampoTexto label="Função" value={empreendimento.pessoa_referencia_funcao ?? ''} onChange={v => set({ pessoa_referencia_funcao: v })} />
        <CampoTexto label="Telefone" value={empreendimento.pessoa_referencia_tel ?? ''} onChange={v => set({ pessoa_referencia_tel: v })} />
        <CampoTexto label="E-mail" value={empreendimento.pessoa_referencia_email ?? ''} onChange={v => set({ pessoa_referencia_email: v })} />
      </div>
      <CampoSelect label="0.11 Vinculação à UNISOL" value={empreendimento.vinculacao_unisol ?? ''}
        onChange={v => set({ vinculacao_unisol: v as Empreendimento['vinculacao_unisol'] })}
        opcoes={[{ value: 'filiado', label: 'Filiado' }, { value: 'em_processo', label: 'Em processo de filiação' }, { value: 'nao_filiado', label: 'Não filiado' }, { value: 'nao_sabe', label: 'Não sabe' }]} />
      <CampoSelect label="UNISOL Estadual (deixe em branco = direto na Nacional)" value={empreendimento.unisol_estadual_id ?? ''}
        onChange={v => set({ unisol_estadual_id: v || null })}
        opcoes={estaduais.map(e => ({ value: e.id, label: e.nome }))} />
      <CampoTexto label="0.12 Base de Serviços Regional (BSR) de referência" value={empreendimento.bsr_referencia ?? ''} onChange={v => set({ bsr_referencia: v })} />
      <CampoTexto label="0.13 Cadeia produtiva territorial à qual o empreendimento deve se vincular e justificativa" multiline
        value={empreendimento.cadeia_produtiva_territorial ?? ''} onChange={v => set({ cadeia_produtiva_territorial: v })} />
      <CampoTexto label="0.14 Conte brevemente como surgiu o empreendimento e quais necessidades buscava enfrentar" multiline
        value={empreendimento.origem_necessidades ?? ''} onChange={v => set({ origem_necessidades: v })} />
      <CampoTexto label="0.15 Missão ou propósito coletivo" multiline value={empreendimento.missao ?? ''} onChange={v => set({ missao: v })} />
      <CampoSelect label="0.16 O empreendimento se reconhece como parte da economia solidária?" value={empreendimento.reconhece_economia_solidaria ?? ''}
        onChange={v => set({ reconhece_economia_solidaria: (v || null) as Empreendimento['reconhece_economia_solidaria'] })}
        opcoes={[{ value: 'sim', label: 'Sim' }, { value: 'parcialmente', label: 'Parcialmente' }, { value: 'nao', label: 'Não' }, { value: 'nao_sabe', label: 'Não sabe' }]} />

      <EscalaMaturidade0a4
        label="Régua de Maturidade do Bloco — Identificação e Territorialidade"
        valor={empreendimento.bloco0_regua_classificacao ?? null}
        onChange={v => set({ bloco0_regua_classificacao: v })}
        comEvidencia
        evidencia={empreendimento.bloco0_regua_evidencia ?? ''}
        onEvidenciaChange={v => set({ bloco0_regua_evidencia: v })}
      />
    </div>
  )
}
