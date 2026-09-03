'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Empreendimento, Diagnostico } from '@/lib/supabase'
import { CampoTexto } from '../campos/CampoTexto'

export function NovoDiagnostico({ onCancelar }: { onCancelar: () => void }) {
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([])
  const [empreendimentoId, setEmpreendimentoId] = useState('')
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregar() {
      const sb = getSupabase()
      const [{ data: emps }, { data: diags }] = await Promise.all([
        sb.from('empreendimentos').select('*').order('nome_fantasia'),
        sb.from('diagnosticos').select('empreendimento_id'),
      ])
      const comDiagnostico = new Set(((diags as Pick<Diagnostico, 'empreendimento_id'>[]) || []).map(d => d.empreendimento_id))
      setEmpreendimentos(((emps as Empreendimento[]) || []).filter(e => !comDiagnostico.has(e.id)))
      setCarregando(false)
    }
    carregar()
  }, [])

  const filtrados = empreendimentos.filter(e =>
    !busca || `${e.nome_fantasia} ${e.razao_social} ${e.codigo}`.toLowerCase().includes(busca.toLowerCase())
  )

  async function criar() {
    setErro('')
    if (!empreendimentoId) { setErro('Selecione uma Filiada.'); return }
    setSalvando(true)
    const sb = getSupabase()
    const { data: sessao } = await sb.auth.getSession()
    const userId = sessao.session?.user.id
    if (!userId) { setErro('Sessão expirada, faça login de novo.'); setSalvando(false); return }

    const novoId = crypto.randomUUID()
    const { error: erroDiag } = await sb.from('diagnosticos').insert({
      id: novoId,
      empreendimento_id: empreendimentoId,
      aplicador_id: userId,
      status: 'rascunho',
      respostas: {},
      analise_tecnica: {},
    })
    if (erroDiag) { setErro(`Erro ao criar diagnóstico: ${erroDiag.message}`); setSalvando(false); return }

    window.location.href = `/diagnosticos?id=${novoId}`
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">
        Só aparecem Filiadas ainda sem diagnóstico. Pra atualizar um diagnóstico já existente, acesse a Filiada em{' '}
        <a href="/filiadas" className="underline" style={{ color: 'var(--primary)' }}>Filiadas</a>.
      </p>

      <div className="space-y-2">
        <CampoTexto label="Buscar Filiada" value={busca} onChange={setBusca} placeholder="Nome, razão social ou código…" />
        <div className="border border-gray-200 rounded-lg max-h-72 overflow-y-auto bg-white">
          {carregando && <p className="text-xs text-gray-400 p-3">Carregando…</p>}
          {!carregando && filtrados.length === 0 && (
            <p className="text-xs text-gray-400 p-3">Nenhuma Filiada disponível pra diagnóstico novo.</p>
          )}
          {filtrados.map(e => (
            <button key={e.id} onClick={() => setEmpreendimentoId(e.id)} type="button"
              className="block w-full text-left px-3 py-2 text-sm border-b border-gray-50 last:border-0"
              style={empreendimentoId === e.id ? { background: 'var(--primary-light)' } : {}}>
              {e.nome_fantasia || e.razao_social || '(sem nome)'}
              <span className="block text-[11px] text-gray-400">{e.municipio}{e.uf ? `/${e.uf}` : ''}</span>
            </button>
          ))}
        </div>
      </div>

      {erro && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{erro}</p>}

      <div className="flex gap-2">
        <button onClick={onCancelar} className="flex-1 text-sm font-medium rounded-lg py-2 border border-gray-200 text-gray-500">Cancelar</button>
        <button onClick={criar} disabled={salvando}
          className="flex-1 text-sm font-semibold rounded-lg py-2 text-white disabled:opacity-60" style={{ background: 'var(--primary)' }}>
          {salvando ? 'Criando…' : 'Criar diagnóstico'}
        </button>
      </div>
    </div>
  )
}
