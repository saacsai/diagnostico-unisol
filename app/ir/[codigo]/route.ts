import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params
  const sb = getSupabaseAdmin()

  const { data } = await sb.from('links_curtos').select('destino').eq('codigo', codigo).single()
  if (!data) return NextResponse.redirect(new URL('/login', req.url))

  // Marca o uso só pra referência (debug) — o link do Supabase por trás dele
  // já expira/invalida sozinho depois de usado, então não precisamos impedir
  // reuso aqui.
  sb.from('links_curtos').update({ usado_em: new Date().toISOString() }).eq('codigo', codigo).then()

  return NextResponse.redirect(data.destino)
}
