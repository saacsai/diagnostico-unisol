import { getDB } from './db'
import { getSupabase } from '@/lib/supabase'

let rodando = false
let iniciado = false

function estaOnline() {
  return typeof navigator === 'undefined' || navigator.onLine
}

/** Chamar uma vez, no boot do app (AppShell). Reentrante — chamadas seguintes são nop. */
export function iniciarSyncEngine() {
  if (typeof window === 'undefined' || iniciado) return
  iniciado = true
  window.addEventListener('online', () => { void sincronizar() })
  // "Online" via navigator não é garantia de sinal de verdade (o app roda em áreas de sinal
  // fraco, não só zero-sinal) — o intervalo periódico é a rede de segurança real.
  setInterval(() => { void sincronizar() }, 45_000)
  void sincronizar()
}

export async function sincronizar() {
  if (rodando || !estaOnline()) return
  rodando = true
  try {
    await sincronizarEmpreendimentos()
    await sincronizarDiagnosticos()
  } finally {
    rodando = false
  }
}

async function sincronizarEmpreendimentos() {
  const db = getDB()
  const sb = getSupabase()
  const pendentes = await db.empreendimentos.filter(e => !!e._dirty || e._op === 'insert').toArray()

  for (const emp of pendentes) {
    const { _dirty, _op, _localUpdatedAt, _erro, ...linha } = emp
    try {
      const { error } = _op === 'insert'
        ? await sb.from('empreendimentos').insert(linha)
        : await sb.from('empreendimentos').update(linha).eq('id', emp.id)

      if (error) {
        await db.empreendimentos.update(emp.id, { _erro: error.message })
        continue
      }
      await db.empreendimentos.update(emp.id, { _dirty: undefined, _op: undefined, _erro: undefined })
    } catch {
      // falha de rede no meio do envio — fica dirty, tenta de novo na próxima passada
    }
  }
}

async function sincronizarDiagnosticos() {
  const db = getDB()
  const sb = getSupabase()
  const pendentes = await db.diagnosticos
    .filter(d => !!d._dirtyRespostas || !!d._dirtyAnaliseTecnica || d._op === 'insert')
    .toArray()

  for (const diag of pendentes) {
    const { _dirtyRespostas, _dirtyAnaliseTecnica, _op, _localUpdatedAt, versaoProvisoria, _erro, ...linha } = diag

    try {
      if (_op === 'insert') {
        // versao provisória (sempre 1 localmente) é só rótulo — a versão real é max(versao)+1
        // no momento do sync, resolvendo colisões de dois técnicos offline no mesmo dia sem
        // depender de capturar o erro 23505 do Postgres.
        const { data: existentes } = await sb
          .from('diagnosticos').select('versao')
          .eq('empreendimento_id', diag.empreendimento_id)
          .order('versao', { ascending: false }).limit(1)
        const versaoReal = (existentes?.[0]?.versao ?? 0) + 1

        const { error } = await sb.from('diagnosticos').insert({ ...linha, versao: versaoReal })
        if (error) {
          // 23505 residual (corrida rara, duas resoluções de max+1 quase simultâneas) — tenta
          // de novo na próxima passada, sem travar aqui.
          if (error.code !== '23505') await db.diagnosticos.update(diag.id, { _erro: error.message })
          continue
        }
        await db.diagnosticos.update(diag.id, {
          versao: versaoReal, versaoProvisoria: undefined, _op: undefined,
          _dirtyRespostas: undefined, _dirtyAnaliseTecnica: undefined, _erro: undefined,
        })
        continue
      }

      const patch: Record<string, unknown> = {}
      if (_dirtyRespostas) patch.respostas = diag.respostas
      if (_dirtyAnaliseTecnica) patch.analise_tecnica = diag.analise_tecnica
      if (Object.keys(patch).length === 0) continue

      const { error } = await sb.from('diagnosticos').update(patch).eq('id', diag.id)
      if (error) {
        // Ex: trigger diagnosticos_guard_analise barrando aplicador em analise_tecnica —
        // falha permanente, fica registrada mas não trava o resto da fila.
        await db.diagnosticos.update(diag.id, { _erro: error.message })
        continue
      }
      await db.diagnosticos.update(diag.id, {
        _dirtyRespostas: _dirtyRespostas ? undefined : diag._dirtyRespostas,
        _dirtyAnaliseTecnica: _dirtyAnaliseTecnica ? undefined : diag._dirtyAnaliseTecnica,
        _erro: undefined,
      })
    } catch {
      // falha de rede no meio do envio — fica dirty, tenta de novo na próxima passada
    }
  }
}
