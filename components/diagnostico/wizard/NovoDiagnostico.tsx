'use client'

import { useEffect, useState } from 'react'
import { getSupabase, Empreendimento } from '@/lib/supabase'
import { CampoTexto } from '../campos/CampoTexto'

export function NovoDiagnostico({ onCancelar }: { onCancelar: () => void }) {
  const [modo, setModo] = useState<'existente' | 'novo'>('existente')
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([])
  const [empreendimentoId, setEmpreendimentoId] = useState('')
  const [busca, setBusca] = useState('')
  const [nomeFantasia, setNomeFantasia] = useState('')
  const [razaoSocial, setRazaoSocial] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    getSupabase().from('empreendimentos').select('*').order('nome_fantasia').then(({ data }) => {
      setEmpreendimentos((data as Empreendimento[]) || [])
    })
  }, [])

  const filtrados = empreendimentos.filter(e =>
    !busca || `${e.nome_fantasia} ${e.razao_social} ${e.codigo}`.toLowerCase().includes(busca.toLowerCase())
  )

  async function criar() {
    setErro('')
    if (modo === 'existente' && !empreendimentoId) { setErro('Selecione um empreendimento.'); return }
    if (modo === 'novo' && !nomeFantasia.trim()) { setErro('Informe ao menos o nome.'); return }

    setSalvando(true)
    const sb = getSupabase()
    const { data: sessao } = await sb.auth.getSession()
    const userId = sessao.session?.user.id
    if (!userId) { setErro('Sessão expirada, faça login de novo.'); setSalvando(false); return }

    const { data: projeto, error: erroProjeto } = await sb.from('projetos').select('id').eq('nome', 'CooperaMais').single()
    if (erroProjeto || !projeto) { setErro('Projeto CooperaMais não encontrado.'); setSalvando(false); return }

    let empId = empreendimentoId
    if (modo === 'novo') {
      const { data: novoEmp, error: erroEmp } = await sb.from('empreendimentos')
        .insert({ nome_fantasia: nomeFantasia, razao_social: razaoSocial || nomeFantasia })
        .select('id').single()
      if (erroEmp || !novoEmp) { setErro(`Erro ao cadastrar empreendimento: ${erroEmp?.message}`); setSalvando(false); return }
      empId = novoEmp.id
    }

    await sb.from('empreendimento_projeto').upsert(
      { empreendimento_id: empId, projeto_id: projeto.id },
      { onConflict: 'empreendimento_id,projeto_id', ignoreDuplicates: true }
    )

    const novoId = crypto.randomUUID()
    const { error: erroDiag } = await sb.from('diagnosticos').insert({
      id: novoId,
      empreendimento_id: empId,
      projeto_id: projeto.id,
      aplicador_id: userId,
      status: 'rascunho',
      respostas: {},
      analise_tecnica: {},
    })
    if (erroDiag) { setErro(`Erro ao criar diagnóstico: ${erroDiag.message}`); setSalvando(false); return }

    window.location.href = `/diagnosticos?id=${novoId}`
  }

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'var(--background)' }}>
      <div className="max-w-lg mx-auto space-y-4">
        <h1 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>Novo diagnóstico</h1>

        <div className="flex gap-2">
          <button onClick={() => setModo('existente')}
            className="flex-1 text-sm font-medium rounded-lg py-2 border"
            style={modo === 'existente' ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' } : { color: '#6b7280', borderColor: '#e5e7eb' }}>
            Empreendimento existente
          </button>
          <button onClick={() => setModo('novo')}
            className="flex-1 text-sm font-medium rounded-lg py-2 border"
            style={modo === 'novo' ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' } : { color: '#6b7280', borderColor: '#e5e7eb' }}>
            Cadastrar novo
          </button>
        </div>

        {modo === 'existente' ? (
          <div className="space-y-2">
            <CampoTexto label="Buscar" value={busca} onChange={setBusca} placeholder="Nome, razão social ou código…" />
            <div className="border border-gray-200 rounded-lg max-h-72 overflow-y-auto bg-white">
              {filtrados.length === 0 && <p className="text-xs text-gray-400 p-3">Nenhum empreendimento encontrado — tente cadastrar novo.</p>}
              {filtrados.map(e => (
                <button key={e.id} onClick={() => setEmpreendimentoId(e.id)}
                  className="block w-full text-left px-3 py-2 text-sm border-b border-gray-50 last:border-0"
                  style={empreendimentoId === e.id ? { background: 'var(--primary-light)' } : {}}>
                  {e.nome_fantasia || e.razao_social || '(sem nome)'}
                  <span className="block text-[11px] text-gray-400">{e.municipio}{e.uf ? `/${e.uf}` : ''}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <CampoTexto label="Nome fantasia" value={nomeFantasia} onChange={setNomeFantasia} />
            <CampoTexto label="Razão social (se souber — pode completar depois)" value={razaoSocial} onChange={setRazaoSocial} />
            <p className="text-xs text-gray-400">Os demais dados da Seção 2 (CNPJ, endereço, contatos…) você preenche dentro do diagnóstico.</p>
          </div>
        )}

        {erro && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{erro}</p>}

        <div className="flex gap-2">
          <button onClick={onCancelar} className="flex-1 text-sm font-medium rounded-lg py-2 border border-gray-200 text-gray-500">Cancelar</button>
          <button onClick={criar} disabled={salvando}
            className="flex-1 text-sm font-semibold rounded-lg py-2 text-white disabled:opacity-60" style={{ background: 'var(--primary)' }}>
            {salvando ? 'Criando…' : 'Criar diagnóstico'}
          </button>
        </div>
      </div>
    </div>
  )
}
