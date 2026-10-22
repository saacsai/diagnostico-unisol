'use client'

import { useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'

// Não dá pra confiar que o redirectTo configurado no Supabase sempre aponta
// direto pra /redefinir-senha (o painel do Supabase não respeitou a allowlist
// de redirect em teste real, 2026-10-22 — ficou caindo sempre na raiz) —
// então a raiz detecta o token de recuperação ela mesma e redireciona pro
// lugar certo, igual o /redefinir-senha já faz, em vez de depender só da
// config do painel.
export default function Home() {
  useEffect(() => {
    const supabase = getSupabase()
    // Só reage especificamente a PASSWORD_RECOVERY — outros eventos (ex:
    // INITIAL_SESSION) disparam antes/independente de token na URL e não
    // devem antecipar o redirect pro login (senão corre o risco de mandar
    // pro login antes do Supabase terminar de processar o token do link).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') window.location.href = '/redefinir-senha'
    })
    // Sem token de recuperação na URL, nada disparado acima — segue o fluxo
    // normal pro login depois de dar tempo do Supabase processar a URL.
    const timeout = setTimeout(() => { window.location.href = '/login' }, 1000)
    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

  return null
}
