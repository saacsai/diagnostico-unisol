# Status — Sistema UNISOL Brasil

## Domínio (2026-09-03)
`sistema.unisolbrasil.org.br` é o domínio principal agora (CNAME
`754232ffc198aa35.vercel-dns-017.com`, mesmo alvo de antes). `diagnostico.unisolbrasil.org.br`
continua ativo/redirecionando — reposicionamento: Diagnóstico é um módulo do sistema, não o
produto inteiro.

## Camada institucional — CONCLUÍDA (2026-09-03)
Evolução grande no mesmo dia: o app deixou de ser só "ferramenta de diagnóstico do CooperaMais"
e virou o embrião do sistema de gestão institucional da UNISOL Brasil. Resumo — ver
`.claude/plans/twinkling-imagining-fairy.md` pro racional completo:

- **Correção importante de modelo**: diagnóstico pertence ao Filiado (empreendimento), não ao
  Projeto — `diagnosticos.projeto_id` virou contexto opcional, `versao`/`rotulo_versao` (T0,
  T1-2027...) é o mecanismo real de reaproveitamento entre projetos ao longo do tempo.
- **`/instituicao`** — perfil UNISOL Brasil (CNPJ auto via BrasilAPI, endereço, representante),
  diretoria (dado pessoal, só admin/tecnico vê) e documentos (upload real + validade + badge
  vigente/vencendo/vencida).
- **`/admin/estaduais/[id]`** — mesmo padrão, por UNISOL Estadual. Seed real: SP, Bahia, RS
  completas (CNPJ/representante); Piauí/Ceará/Paraíba formalizadas sem detalhe; MT/AC/SE/MG/SC
  em constituição.
- **`/projetos` + `/projetos/[id]`** — projeto rico (financiador, termo de fomento, Transferegov,
  status, datas de execução, documentos) + "Filiados vinculados" mostrando o diagnóstico mais
  recente de cada empreendimento do projeto (é aqui que aparece "ABAM 100% (20/20)").
- **Anexo A** migrou de checklist-texto pra upload real (mesmo mecanismo de documentos).
- **Bloqueio mobile de verdade** (`SoDesktop`, viewport <1024px) em todas as telas de
  cadastro/admin — só o wizard de diagnóstico funciona no celular.
- **Dado sensível (CPF/RG) nunca vai pro repo público** — fica em
  `supabase_seed_04_dados_reais_privado.sql` e `cooperamais/*.pdf`, ambos gitignored.

**Pendente**: CNPJ das estaduais sem dado ainda (PI/CE/PB/MT/AC/SE/MG/SC) — cadastrar quando
tiver a mão; offline de verdade (Dexie) continua sendo a próxima grande frente, escopo já
confirmado (só o wizard, resto fica online-only + bloqueado no mobile).

## Fase 2 (wizard) — CONCLUÍDA versão ONLINE (2026-09-02)

Decisão (entrega rápida): wizard completo das 18 seções + 2 anexos, gravando **direto no
Supabase** (autosave debounced ~600ms por seção), **sem Dexie/offline ainda**. Combinado com o
Luciano — offline é a próxima leva, não "depois depois", por causa do sinal ruim em campo real.

**No ar e testado E2E em produção** (`/diagnosticos`): login → lista de diagnósticos → criar
novo (buscar empreendimento existente OU cadastrar na hora) → wizard com sidebar das 18+2
seções → autosave → Seção 17 calcula pontuação/classificação sozinha (13 dimensões, máx 52).

**Arquivos-chave**: `lib/diagnostico/schema.ts` (tipos), `lib/diagnostico/useAutosave.ts` (hook
de gravação, trocável por Dexie+fila depois sem mudar as seções), `components/diagnostico/campos/`
(7 primitivas reutilizáveis: CampoTexto/Select/Numero/Data, EscalaMaturidade0a4, MatrizFixa,
TabelaRepetivel, ChecklistSituacao), `components/diagnostico/secoes/` (20 componentes),
`components/diagnostico/wizard/` (shell, sidebar, lista, criação).

**RLS relaxada** (migrations 02 e 03): qualquer autenticado pode cadastrar empreendimento novo
e vincular a um projeto — não só admin. Migration 02 confirmada rodada; **migration 03
(`empreendimento_projeto` insert) ainda pendente** — sem ela, o vínculo N:N não é gravado ao
criar diagnóstico (o diagnóstico em si é criado normalmente, só o vínculo fica de fora).

## Tela /admin — CONCLUÍDA (2026-09-02, mesmo dia)

`/admin` (só visível/acessível pra `perfil='admin'`, checado no cliente E no servidor):
- Cadastro de usuários (técnicos/coordenadores) — sem convite por email na v1, admin vê a
  senha temporária gerada na tela e repassa manualmente (WhatsApp etc). Perfil, instituição e
  UNISOL Estadual (opcional) na hora do cadastro.
- Cadastro de UNISOL Estaduais (nome + UF) — lista nasce vazia, popular aqui.
- `app/api/admin/usuarios/route.ts` usa service-role mas **confirma server-side** que quem
  chama já é admin antes de criar qualquer coisa — testado em produção: chamada de um usuário
  não-admin retorna 403 de verdade, não é só a UI escondendo o botão.
- Usuário de teste (`luciano.maeda@saacs.com.br`) promovido a `admin` pra poder usar a tela.

**Pendente pra próxima leva**:
1. Rodar `supabase_migration_03_empreendimento_projeto_insert.sql`.
2. Offline de verdade — Dexie + fila de sync (arquitetura já desenhada no plano original).
3. Popular `unisol_estaduais` de verdade (lista real ainda não recebida) e importar os 152
   empreendimentos do CooperaMais.
4. Portal do dirigente por token (Seções 2/3/4/6/7/10/12/15 pré-preenchidas).
5. Convite por email de verdade pro cadastro de usuário (hoje é senha temporária manual).
6. Completude de seção no sidebar é só "tem algo preenchido?" — heurística simples de
   propósito, só refinar se confundir técnico em uso real.

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
| DNS Hostgator — CNAME `diagnostico` → `754232ffc198aa35.vercel-dns-017.com` | ✅ propagado (trocamos o registro A inicial pelo CNAME que a Vercel pediu no dashboard — domínio fora dos nameservers dela precisa do CNAME específico, não do A genérico) |
| Domínio final `diagnostico.unisolbrasil.org.br` com HTTPS | ✅ confirmado — HTTP 200 em `/login` |
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

## Pivô arquitetural — Cadastro Nacional UNISOL (2026-08-31, mesmo dia)

Descoberto em memória: decisão de 15/08 (kickoff CooperaMais) já previa que a UNISOL Brasil
tem ~1000 empreendimentos afiliados no total, N:N com projetos (CooperaMais, Terra Mesa...),
e que isso merecia um "Cadastro Nacional UNISOL" — schema documentado em
`memory/cadastro_nacional_unisol.md`. Como o banco do Diagnóstico ainda não tinha dado real,
consolidamos os dois no MESMO projeto Supabase (decisão revisitada com o Luciano) em vez de
criar um app separado.

`supabase_migration_01_cadastro_nacional.sql` (escrita e **rodada com sucesso** em 2026-08-31,
confirmada via REST: `unisol_estaduais`/`empreendimentos`/`empreendimento_projeto` vazias,
`projetos` com o seed do CooperaMais) adiciona:
- `unisol_estaduais` (UNISOL SP, BA, RS...) — nasce vazia, popular depois
- `projetos` (seed: CooperaMais) e `empreendimentos` (os ~1000, cadastro único — Seção 2 do
  formulário é este cadastro)
- `empreendimento_projeto` — N:N, resolve "quantos no CooperaMais vs. Terra Mesa"
- `usuarios.unisol_estadual_id` e `empreendimentos.unisol_estadual_id` — de qual estadual
  cada um é (eixo independente de "em que projeto está engajado")
- `diagnosticos.codigo_empreendimento` (texto) → `empreendimento_id` + `projeto_id` (FK de
  verdade). Campos nome/regiao/uf/municipio viram snapshot (cache offline), não fonte de verdade.

`lib/supabase.ts` já atualizado com os tipos novos (`Empreendimento`, `Projeto`,
`EmpreendimentoProjeto`, `UnisolEstadual`) e build local limpo.

**Também decidido, ainda não implementado:** dirigente da cooperativa preenche direto (via
link com token, sem login) as seções que ele sabe de cor — Seção 2 (=cadastro em
`empreendimentos`), 3, 4, 6, 7, 10, 12, 15. Técnico em campo fica com Seção 1, 5, 9, 17, 18 +
valida/completa o resto na visita. Reusa o padrão de portal por token já usado no
ecouni-dashboard (`/disponibilidade/[token]`).

## Nota — copiar/colar SQL no editor do Supabase
Colar direto do chat corrompeu caracteres duas vezes (erro de sintaxe em linha que não batia
com o arquivo real). O que resolveu: abrir o `.sql` no Finder/editor de texto e copiar de lá,
não do chat. Vale como procedimento padrão pras próximas migrations.

## Próxima sessão — retomar por aqui
1. Tela `/admin/usuarios` (cadastro dos ~35-40 usuários — 18 técnicos, 2 coordenadores
   gerais, 5 coordenadores regionais, 5 administrativos regionais, diretoria — via convite
   por email; configurar SMTP próprio no Supabase Auth pra não travar no rate limit padrão).
2. Popular `unisol_estaduais` (lista real ainda não recebida do Luciano) e importar os 152
   empreendimentos do CooperaMais em `empreendimentos` + `empreendimento_projeto` (fonte:
   planilha/lista real da UNISOL, ainda não recebida).
3. Fase 2 do plano original (`.claude/plans/twinkling-imagining-fairy.md`): Dexie +
   `dexie-react-hooks`, `sync.ts`, wizard shell com as 18+2 seções, Seções 1 e 2 completas,
   prova end-to-end do loop offline — Seção 2 agora escreve em `empreendimentos`, não mais
   como resposta solta dentro do diagnóstico.
4. Portal do dirigente por token (Seção 2/3/4/6/7/10/12/15 pré-preenchidas antes da visita).
