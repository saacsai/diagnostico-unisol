# Status — Diagnóstico UNISOL Brasil

## O que é
App PWA offline-first pra aplicar o diagnóstico institucional (18 seções + 2 anexos) nos 152
empreendimentos do CooperaMais/UNISOL Brasil em campo, sem depender de sinal de internet.
Domínio alvo: `diagnostico.unisolbrasil.org.br`.

Plano completo (schema, arquitetura de sync offline, primitivas de UI, fases de construção):
`/Users/lucianomaeda/.claude/plans/twinkling-imagining-fairy.md`

Perguntas do formulário (fonte, não editar): `Desktop/COOPERAMAIS/Plano de trabalho final/FORMULARIO DIAGNOSTICO ECOUNI.docx`

## Fase 1 (infra) — em andamento

| Item | Status |
|---|---|
| Scaffold Next.js 14.2.35 + TS + Tailwind local | ✅ |
| `lib/supabase.ts` (dual-client) + tipos `Usuario`/`Diagnostico` | ✅ |
| `supabase_migration_00_inicial.sql` (tabelas, RLS, triggers) | ✅ escrita, ⏳ não rodada (sem projeto Supabase ainda) |
| `app/login/page.tsx` + `app/dashboard/page.tsx` (placeholder pós-login) | ✅ |
| PWA scaffold (`next-pwa`, `manifest.json`, ícones placeholder, `/offline`) | ✅ |
| `npm run build` local limpo | ✅ (verificado 2026-08-31) |
| Git init + commit local | ⏳ |
| Repo GitHub `saacsai/diagnostico-unisol` | 🔒 bloqueado — `gh auth login` inválido, Luciano precisa reautenticar |
| Projeto Supabase novo | 🔒 bloqueado — `supabase login` pendente |
| Vercel link + projeto novo + env vars | ⏳ (CLI já logado como `saacsai`) |
| DNS Hostgator — CNAME `diagnostico` → `cname.vercel-dns.com` | ⏳ passo manual do Luciano no cPanel |
| Deploy + verificação (login real + instalabilidade PWA) | ⏳ |

## Bloqueios ativos
1. `gh auth login` — token do `saacsai` expirado/inválido.
2. `supabase login` — CLI nunca autenticado nesta máquina.

Assim que os dois forem resolvidos, seguir: criar repo → push → criar projeto Supabase → rodar
`supabase_migration_00_inicial.sql` → pegar as 3 env vars → configurar no Vercel → DNS → deploy.

## Decisões já fechadas (não reabrir sem motivo novo)
- Projeto Supabase **novo e dedicado**, não reaproveita o do ecouni-dashboard.
- Login **individual por técnico** (Supabase Auth email/senha), sem senha compartilhada.
- Anexo A (evidências) fica **só checklist de texto na v1** — sem upload de foto/arquivo.
- Ícones do manifest são **placeholder** (monograma "DU" verde `#1B5E37`, gerado via PIL) —
  trocar quando a UNISOL Brasil tiver identidade visual definida pro app.

## Próxima sessão — retomar por aqui
Ver tabela acima. Se `gh`/`supabase` já estiverem autenticados quando você voltar, pule direto
pra "Repo GitHub" e "Projeto Supabase novo".
