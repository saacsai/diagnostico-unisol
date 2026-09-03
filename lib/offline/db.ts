import Dexie, { Table } from 'dexie'
import type { Diagnostico, Empreendimento, UnisolEstadual, Perfil } from '@/lib/supabase'

// Camada offline do wizard de diagnóstico. Só o wizard (/diagnosticos) usa isto — o resto do
// sistema (Filiadas admin, Estaduais, Projetos, Usuários, Técnicos, Equipe) é online-only.
//
// Toda mudança futura nos campos de Diagnostico/Empreendimento (lib/supabase.ts) exige um novo
// `.version(N+1)` aqui — mesma disciplina das migrations numeradas do Supabase. Nunca editar
// uma versão já commitada.

export interface DiagnosticoLocal extends Diagnostico {
  /** 1 = respostas mudou localmente e ainda não foi sincronizado */
  _dirtyRespostas?: 1
  /** 1 = analise_tecnica mudou localmente e ainda não foi sincronizado */
  _dirtyAnaliseTecnica?: 1
  /** presente = registro criado offline, ainda não existe no Supabase */
  _op?: 'insert'
  _localUpdatedAt?: number
  /** versao é só um rótulo de exibição até sincronizar — o valor real é resolvido no sync (max+1) */
  versaoProvisoria?: boolean
  /** mensagem do último erro de sync (falha permanente — CHECK/RLS/constraint) */
  _erro?: string
}

export interface EmpreendimentoLocal extends Empreendimento {
  _dirty?: 1
  _op?: 'insert'
  _localUpdatedAt?: number
  _erro?: string
}

export interface ReferenciaRow {
  tipo: 'unisol_estaduais'
  dados: UnisolEstadual[]
  atualizadoEm: number
}

export interface SessaoUsuarioRow {
  id: 'atual'
  usuarioId: string
  nome: string
  perfil: Perfil
}

class OfflineDB extends Dexie {
  diagnosticos!: Table<DiagnosticoLocal, string>
  empreendimentos!: Table<EmpreendimentoLocal, string>
  referencia!: Table<ReferenciaRow, string>
  sessaoUsuario!: Table<SessaoUsuarioRow, string>

  constructor() {
    super('diagnostico-unisol-offline')
    this.version(1).stores({
      diagnosticos: 'id, empreendimento_id, _dirtyRespostas, _dirtyAnaliseTecnica, _op',
      empreendimentos: 'id, _dirty, _op',
      referencia: 'tipo',
      sessaoUsuario: 'id',
    })
  }
}

// Lazy — nunca instanciar no topo do módulo. O módulo é avaliado no Node durante o build
// (SSR do primeiro paint de componentes 'use client'), onde IndexedDB não existe. getDB() só é
// chamado de dentro de useEffect/useLiveQuery, que rodam exclusivamente no browser.
let instancia: OfflineDB | null = null
export function getDB(): OfflineDB {
  if (!instancia) instancia = new OfflineDB()
  return instancia
}
