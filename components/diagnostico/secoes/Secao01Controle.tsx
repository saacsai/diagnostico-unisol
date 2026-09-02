'use client'

import { Secao01Controle as T } from '@/lib/diagnostico/schema'
import { CampoTexto } from '../campos/CampoTexto'
import { CampoSelect } from '../campos/CampoSelect'

export function Secao01Controle({ dados, onChange }: { dados: Partial<T>; onChange: (d: Partial<T>) => void }) {
  const set = (patch: Partial<T>) => onChange({ ...dados, ...patch })
  return (
    <div className="space-y-4">
      <CampoTexto label="1.2 Nome da pessoa aplicadora e instituição" value={dados.aplicador_instituicao ?? ''}
        onChange={v => set({ aplicador_instituicao: v })} />
      <CampoTexto label="1.3 Pessoas que participaram da entrevista (nome, função e contato)" multiline
        value={dados.participantes_entrevista ?? ''} onChange={v => set({ participantes_entrevista: v })} />
      <CampoSelect label="1.4 Modalidade" value={dados.modalidade ?? ''} onChange={v => set({ modalidade: v as T['modalidade'] })}
        opcoes={[{ value: 'presencial', label: 'Presencial' }, { value: 'online', label: 'Online' }, { value: 'hibrida', label: 'Híbrida' }]} />
      <CampoTexto label="1.5 Local e duração da aplicação" value={dados.local_duracao ?? ''}
        onChange={v => set({ local_duracao: v })} />
      <CampoSelect label="1.6 Autoriza uso institucional dos dados?" value={dados.consentimento_dados ?? ''}
        onChange={v => set({ consentimento_dados: v as T['consentimento_dados'] })}
        opcoes={[{ value: 'sim', label: 'Sim' }, { value: 'nao', label: 'Não' }, { value: 'sim_exceto_pessoais', label: 'Sim, exceto dados pessoais' }]} />
      <CampoSelect label="1.7 Autoriza registro de imagem e voz?" value={dados.consentimento_imagem ?? ''}
        onChange={v => set({ consentimento_imagem: v as T['consentimento_imagem'] })}
        opcoes={[{ value: 'sim', label: 'Sim' }, { value: 'nao', label: 'Não' }, { value: 'somente_sem_identificacao', label: 'Somente imagens sem identificação' }]} />
    </div>
  )
}
