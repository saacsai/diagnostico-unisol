import { getSupabaseAdmin } from '@/lib/supabase'

const SITE_URL = 'https://sistema.unisolbrasil.org.br'

function gerarCodigo() {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

// Encurta um link do Supabase (ou qualquer URL) num link no próprio domínio
// confiável — o link cru do Supabase assusta quem recebe o email por ser
// longo e de um domínio desconhecido (aloumokqafywqntdisen.supabase.co).
export async function criarLinkCurto(destino: string) {
  const sb = getSupabaseAdmin()
  const codigo = gerarCodigo()
  const { error } = await sb.from('links_curtos').insert({ codigo, destino })
  if (error) throw new Error(`Erro ao criar link curto: ${error.message}`)
  return `${SITE_URL}/ir/${codigo}`
}
