'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'

const PRIMARY  = '#1B5E37'
const CARD_BG  = '#F5F5F5'
const BORDER   = '#E5E5E5'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  )
}

function LoginInner() {
  const params = useSearchParams()
  const next = params.get('next') ?? '/diagnosticos'

  const [email, setEmail]       = useState('')
  const [senha, setSenha]       = useState('')
  const [modo, setModo]         = useState<'login' | 'recuperar'>('login')
  const [loading, setLoading]   = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro]         = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    const { error } = await getSupabase().auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('Email ou senha incorretos.')
      setLoading(false)
      return
    }
    window.location.href = next
  }

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })
    if (error) {
      setErro('Não foi possível enviar o email. Tente novamente.')
      setLoading(false)
      return
    }
    setMensagem('Se este email estiver cadastrado, você receberá o link em instantes.')
    setLoading(false)
  }

  if (mensagem) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#ffffff' }}>
      <div className="rounded-xl shadow-xl w-full max-w-sm overflow-hidden border" style={{ background: CARD_BG, borderColor: BORDER }}>
        <div className="px-6 pt-8 pb-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background: 'var(--primary-light)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-900">Verifique seu email</p>
          <p className="text-sm text-gray-500">{mensagem}</p>
          <button onClick={() => { setMensagem(''); setModo('login') }} className="text-xs hover:underline" style={{ color: PRIMARY }}>
            Voltar ao login
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#ffffff' }}>
      <div className="rounded-xl shadow-xl w-full max-w-sm overflow-hidden border" style={{ background: CARD_BG, borderColor: BORDER }}>

        {/* Cabeçalho */}
        <div className="px-6 pt-8 pb-5 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_unisol.png" alt="UNISOL Brasil" style={{ height: 58 }} className="w-auto object-contain" />
        </div>

        <div style={{ borderTop: `1px solid ${BORDER}` }} />

        {/* Formulário */}
        <div className="px-6 py-6">
          <div className="mb-5">
            <p className="text-base font-semibold text-gray-900">
              {modo === 'login' ? 'Acessar sistema' : 'Recuperar senha'}
            </p>
            <p className="text-xs mt-0.5 text-gray-500">
              {modo === 'login' ? 'Entre com seu email e senha.' : 'Informe seu email para receber o link.'}
            </p>
          </div>

          {modo === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required autoFocus
                  className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-900 outline-none border border-gray-200 focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Senha</label>
                <input
                  type="password" value={senha} onChange={e => setSenha(e.target.value)}
                  required
                  className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-900 outline-none border border-gray-200 focus:border-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={() => { setModo('recuperar'); setErro('') }}
                  className="mt-1.5 text-xs hover:underline float-right"
                  style={{ color: PRIMARY }}
                >
                  Esqueci minha senha
                </button>
              </div>
              {erro && (
                <p className="text-xs rounded-lg p-2 clear-both bg-red-50 text-red-600 border border-red-200">
                  {erro}
                </p>
              )}
              <button
                type="submit" disabled={loading}
                className="w-full text-sm font-semibold rounded-lg py-2.5 disabled:opacity-60 transition-all clear-both text-white"
                style={{ background: PRIMARY }}
              >
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRecuperar} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required autoFocus
                  className="w-full bg-white rounded-lg px-3 py-2 text-sm text-gray-900 outline-none border border-gray-200 focus:border-[var(--primary)]"
                />
              </div>
              {erro && (
                <p className="text-xs rounded-lg p-2 bg-red-50 text-red-600 border border-red-200">
                  {erro}
                </p>
              )}
              <button
                type="submit" disabled={loading}
                className="w-full text-sm font-semibold rounded-lg py-2.5 disabled:opacity-50 transition-all text-white"
                style={{ background: PRIMARY }}
              >
                {loading ? 'Enviando…' : 'Enviar link'}
              </button>
              <button
                type="button"
                onClick={() => { setModo('login'); setErro('') }}
                className="w-full text-xs hover:underline"
                style={{ color: PRIMARY }}
              >
                Voltar ao login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
