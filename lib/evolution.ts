// Envio de WhatsApp outbound (1 instância enviando pra muitos números) — mesmo padrão do
// vaikeuvou (lib/evolution.ts). Diferente do modelo do 168 (conta-pareada por usuário via QR),
// que não serve aqui: a UNISOL precisa de 1 instância só que manda mensagem pra cada técnico,
// não uma conta pessoal por pessoa. Ver plano de ação (motor de agenda+relato via WhatsApp,
// 2026-09-29) e STATUS.md.
export async function enviarWhatsapp(numero: string, texto: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${process.env.EVOLUTION_API_URL}/message/sendText/${encodeURIComponent(process.env.EVOLUTION_INSTANCE!)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: process.env.EVOLUTION_API_KEY! },
    body: JSON.stringify({ number: numero, text: texto }),
  })
  if (!res.ok) return { ok: false, error: await res.text() }
  return { ok: true }
}

export async function checarEstadoConexao(): Promise<string> {
  const res = await fetch(
    `${process.env.EVOLUTION_API_URL}/instance/connectionState/${encodeURIComponent(process.env.EVOLUTION_INSTANCE!)}`,
    { headers: { apikey: process.env.EVOLUTION_API_KEY! } }
  )
  if (!res.ok) return 'erro_api'
  const data = await res.json()
  return data?.instance?.state ?? 'desconhecido'
}

// Baixa a mídia (áudio) de uma mensagem recebida — usado na Fase 3 (relato por áudio) pra
// transcrever. A Evolution API devolve o binário em base64 quando webhook_base64 está ativo
// no /webhook/set, ou dá pra buscar via este endpoint com o messageId.
export async function baixarMidia(messageId: string): Promise<{ ok: boolean; base64?: string; mimetype?: string; error?: string }> {
  const res = await fetch(
    `${process.env.EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${encodeURIComponent(process.env.EVOLUTION_INSTANCE!)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: process.env.EVOLUTION_API_KEY! },
      body: JSON.stringify({ message: { key: { id: messageId } } }),
    }
  )
  if (!res.ok) return { ok: false, error: await res.text() }
  const data = await res.json()
  return { ok: true, base64: data?.base64, mimetype: data?.mimetype }
}
