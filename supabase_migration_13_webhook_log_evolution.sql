-- Diagnóstico UNISOL Brasil — migration 13: log do webhook Evolution (Fase 0 do motor de
-- agenda+relato via WhatsApp). Só confirma que o cabo funciona ponta a ponta antes de construir
-- lógica de negócio em cima (check-in/check-out na Fase 2, relato por áudio na Fase 3). Ver
-- plano de ação em ~/.claude/plans/twinkling-imagining-fairy.md e STATUS.md.
create table if not exists blocos_webhook_log (
  id             uuid primary key default gen_random_uuid(),
  phone          text not null,
  tipo           text not null check (tipo in ('texto', 'audio')),
  texto          text,
  message_id     text,
  payload_bruto  jsonb,
  created_at     timestamptz not null default now()
);

create index if not exists idx_blocos_webhook_log_phone on blocos_webhook_log (phone);

-- Só a service role (server-side) escreve/lê aqui — sem RLS pra usuário autenticado, não é
-- dado que qualquer perfil da UNISOL deveria enxergar direto.
alter table blocos_webhook_log enable row level security;
