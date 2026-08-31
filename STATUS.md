# Status — Diagnóstico UNISOL Brasil

## O que é
App PWA offline-first pra aplicar o diagnóstico institucional (18 seções + 2 anexos) nos 152
empreendimentos do CooperaMais/UNISOL Brasil em campo, sem depender de sinal de internet.
Domínio alvo: `diagnostico.unisolbrasil.org.br`.

Plano completo (schema, arquitetura de sync offline, primitivas de UI, fases de construção):
`/Users/lucianomaeda/.claude/plans/twinkling-imagining-fairy.md`

Perguntas do formulário (fonte, não editar): `Desktop/COOPERAMAIS/Plano de trabalho final/FORMULARIO DIAGNOSTICO ECOUNI.docx`

## Fase 1 (infra) — CONCLUÍDA (2026-08-31)

| Item | Status |
|---|---|
| Scaffold Next.js 14.2.35 + TS + Tailwind local | ✅ |
| `lib/supabase.ts` (dual-client) + tipos `Usuario`/`Diagnostico` | ✅ |
| `supabase_migration_00_inicial.sql` (tabelas, RLS, triggers) | ✅ escrita e rodada no projeto |
| `app/login/page.tsx` + `app/dashboard/page.tsx` (placeholder pós-login) | ✅ |
| PWA scaffold (`next-pwa`, `manifest.json`, ícones placeholder, `/offline`) | ✅ |
| `npm run build` local limpo | ✅ |
| Git init + commit local + push | ✅ |
| Repo GitHub `saacsai/diagnostico-unisol` (público) | ✅ https://github.com/saacsai/diagnostico-unisol |
| Projeto Supabase novo (`aloumokqafywqntdisen`) | ✅ criado, migration rodada, tabelas confirmadas via REST |
| Vercel link + projeto novo + env vars (production/development) | ✅ — **preview** ficou sem as 3 env vars (bug do CLI com `--value` em preview, ver "Pendências") |
| Deploy produção | ✅ https://diagnostico-unisol.vercel.app |
| DNS Hostgator — registro A `diagnostico` → `76.76.21.21` | ✅ propagado e validado pela Vercel |
| Domínio final `diagnostico.unisolbrasil.org.br` com HTTPS | ⏳ certificado Let's Encrypt em emissão (automático da Vercel, checar em alguns minutos/até 1h) |
| Usuário técnico de teste | ✅ `luciano.maeda@saacs.com.br` / senha `Diagnostico2026!` (perfil `tecnico`, trocar senha após primeiro login) |

## Pendências menores (não bloqueiam a Fase 2)
1. Env vars da Vercel no ambiente **preview** (branches não-main) não foram configuradas — o
   comando `vercel env add ... preview --value ... --yes` deu erro `git_branch_required` mesmo
   seguindo exatamente a sintaxe sugerida pelo próprio CLI. Produção e development estão OK.
   Só importa se algum dia usarmos preview deploys pra testar; refazer manualmente pelo
   dashboard da Vercel se precisar.
2. Confirmar `https://diagnostico.unisolbrasil.org.br` com HTTPS ativo (só aguardar).
3. Ícones do manifest são placeholder (monograma "DU" verde) — trocar quando tiver identidade
   visual oficial da UNISOL Brasil pro app.

## Decisões já fechadas (não reabrir sem motivo novo)
- Projeto Supabase **novo e dedicado**, não reaproveita o do ecouni-dashboard.
- Login **individual por técnico** (Supabase Auth email/senha), sem senha compartilhada.
- Anexo A (evidências) fica **só checklist de texto na v1** — sem upload de foto/arquivo.
- Ícones do manifest são **placeholder** (monograma "DU" verde `#1B5E37`, gerado via PIL) —
  trocar quando a UNISOL Brasil tiver identidade visual definida pro app.

## Próxima sessão — retomar por aqui
Fase 1 concluída. Ir direto pra **Fase 2** do plano
(`.claude/plans/twinkling-imagining-fairy.md`): Dexie + `dexie-react-hooks`, `sync.ts`, wizard
shell com as 18+2 seções na sidebar, Seções 1 e 2 completas, prova end-to-end do loop offline
(criar em modo avião → sincronizar ao voltar a rede).
