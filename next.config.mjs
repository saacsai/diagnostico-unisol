import withPWAInit from '@ducanh2912/next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/', destination: '/login', permanent: false },
    ]
  },
}

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
