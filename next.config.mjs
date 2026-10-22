import withPWAInit from '@ducanh2912/next-pwa'

// A raiz ("/") agora redireciona sozinha, client-side, em app/page.tsx —
// detecta token de recuperação de senha (PASSWORD_RECOVERY) antes de
// mandar pro /login. Esse redirect aqui era no nível do framework, rodava
// ANTES do componente da página, e engolia o fragmento #access_token do
// link de redefinir senha sem dar chance da página reagir — removido de
// propósito (2026-10-22).
/** @type {import('next').NextConfig} */
const nextConfig = {}

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    runtimeCaching: [
      {
        // Dados do Supabase nunca ficam em cache do service worker — a
        // camada offline é o Dexie (IndexedDB), não o cache HTTP. Cachear
        // aqui criaria uma segunda fonte de verdade divergente da local.
        urlPattern: ({ url }) => url.hostname.endsWith('.supabase.co'),
        handler: 'NetworkOnly',
      },
    ],
  },
})

export default withPWA(nextConfig)
