'use client'

import { Secao01Controle as T } from '@/lib/diagnostico/schema'
import { CampoTexto } from '../campos/CampoTexto'
import { CampoSelect } from '../campos/CampoSelect'
import { CampoData } from '../campos/CampoData'

export function Secao01Controle({ dados, onChange }: { dados: Partial<T>; onChange: (d: Partial<T>) => void }) {
  const set = (patch: Partial<T>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <CampoTexto label="A.1 Código único do empreendimento" value={dados.codigo_empreendimento ?? ''}
        onChange={v => set({ codigo_empreendimento: v })} />
      <CampoTexto label="A.2 Nome da pessoa aplicadora e instituição/BSR vinculada" value={dados.aplicador_instituicao ?? ''}
        onChange={v => set({ aplicador_instituicao: v })} />
      <CampoTexto label="A.3 Base de Serviços Regional (BSR) responsável pela aplicação" value={dados.aplicador_bsr ?? ''}
        onChange={v => set({ aplicador_bsr: v })} />
      <CampoTexto label="A.4 Pessoas que participaram da entrevista (nome, função e contato)" multiline
        value={dados.participantes_entrevista ?? ''} onChange={v => set({ participantes_entrevista: v })} />
      <CampoSelect label="A.5 Modalidade" value={dados.modalidade ?? ''} onChange={v => set({ modalidade: v as T['modalidade'] })}
        opcoes={[{ value: 'presencial', label: 'Presencial' }, { value: 'online', label: 'Online' }, { value: 'hibrida', label: 'Híbrida' }]} />
      <CampoTexto label="A.6 Local e duração da aplicação" value={dados.local_duracao ?? ''}
        onChange={v => set({ local_duracao: v })} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CampoData label="A.7 Data de aplicação" value={dados.data_aplicacao ?? ''}
          onChange={v => set({ data_aplicacao: v })} />
        <CampoData label="A.7 Data de corte do Marco 0" value={dados.data_corte_marco0 ?? ''}
          onChange={v => set({ data_corte_marco0: v })} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 border border-gray-200 rounded-lg p-3">
        <strong>A.7.1</strong> Período de referência: situação atual na data de corte; quando indicado
        &ldquo;últimos 12 meses&rdquo;, considerar os 12 meses imediatamente anteriores à data de corte.
        Registrar exceções e usar o mesmo intervalo de duração no Marco 1.
        <br /><br />
        <strong>A.7.2</strong> Para cada valor, registrar fonte e período. Usar <strong>NI</strong> quando a
        informação não puder ser obtida, <strong>NA</strong> quando o indicador não se aplicar e{' '}
        <strong>NV</strong> quando não for possível verificar a resposta. Não interpretar campo vazio como
        zero; zero significa ocorrência medida e igual a zero.
      </p>

      <CampoSelect label="A.8 O empreendimento autoriza o uso institucional dos dados para execução, monitoramento, avaliação e prestação de contas do projeto?"
        value={dados.consentimento_dados ?? ''}
        onChange={v => set({ consentimento_dados: v as T['consentimento_dados'] })}
        opcoes={[{ value: 'sim', label: 'Sim' }, { value: 'nao', label: 'Não' }, { value: 'sim_exceto_pessoais', label: 'Sim, exceto dados pessoais' }]} />
      <CampoSelect label="A.9 Autoriza registro de imagem e voz para comprovação e comunicação institucional?"
        value={dados.consentimento_imagem ?? ''}
        onChange={v => set({ consentimento_imagem: v as T['consentimento_imagem'] })}
        opcoes={[{ value: 'sim', label: 'Sim' }, { value: 'nao', label: 'Não' }, { value: 'somente_sem_identificacao', label: 'Somente imagens sem identificação individual' }]} />
    </div>
  )
}
