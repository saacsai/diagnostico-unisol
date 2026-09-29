import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// Recebe mensagem inbound do WhatsApp (Evolution API) — Fase 0 do motor de agenda+relato: só
// confirma que o cabo funciona ponta a ponta (loga em blocos_webhook_log), sem lógica de negócio
// ainda. Check-in/check-out (Fase 2) e transcrição de áudio (Fase 3) entram aqui depois.
//
// Auth: o "apikey" que a Evolution ecoa no corpo é o token da INSTÂNCIA, não a chave global —
// não dá pra autenticar por ele (achado de bug real no vaikeuvou, mesma plataforma). Autentica
// pelo header customizado configurado no `webhook/set`, que a Evolution reenvia de verdade.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ ok: true })

  if (req.headers.get('x-evolution-secret') !== process.env.EVOLUTION_API_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (body.event !== 'messages.upsert') return NextResponse.json({ ok: true })

  const data = body.data
  const remoteJid: string | undefined = data?.key?.remoteJid
  const fromMe: boolean = !!data?.key?.fromMe

  if (fromMe || !remoteJid || remoteJid.endsWith('@g.us') || remoteJid.endsWith('@broadcast')) {
    return NextResponse.json({ ok: true })
  }

  const phone = remoteJid.split('@')[0]
  const isAudio = !!data?.message?.audioMessage
  const texto: string | null = data?.message?.conversation ?? data?.message?.extendedTextMessage?.text ?? null

  await getSupabaseAdmin().from('blocos_webhook_log').insert({
    phone,
    tipo: isAudio ? 'audio' : 'texto',
    texto,
    message_id: data?.key?.id ?? null,
    payload_bruto: body,
  })

  return NextResponse.json({ ok: true })
}
