# Status — Sistema UNISOL Brasil

## Auth: SMTP próprio + fluxo de senha corrigido (2026-09-03)
Dois problemas reais encontrados e corrigidos no fluxo "Esqueci minha senha":
1. **Página `/redefinir-senha` não existia** — o login já chamava `resetPasswordForEmail` com
   `redirectTo` pra lá, mas dava 404. Criada (mesmo padrão do cooperliga-dashboard: escuta
   `PASSWORD_RECOVERY`, chama `updateUser({password})`).
2. **Site URL do Supabase Auth apontava pra `http://localhost:3000`** (config padrão nunca
   trocada) — o link do email sempre mandava pro localhost, ignorando o `redirectTo` do código.
   Corrigido em Authentication → URL Configuration (Site URL = `sistema.unisolbrasil.org.br`,
   Redirect URLs com wildcard cobrindo os dois domínios).
3. **Rate limit de email do Supabase** (`over_email_send_rate_limit`, plano padrão é bem
   restritivo) — resolvido configurando **SMTP próprio via Resend**, domínio
   `unisolbrasil.org.br` verificado (SPF/DKIM/DMARC via Hostgator), remetente
   `sistema@unisolbrasil.org.br`. Testado ponta a ponta, email chegou. Resolve não só reset de
   senha como o futuro convite de usuário em massa (`/admin/usuarios`).

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

## 2026-09-03 — Sidebar reorganizada + Filiadas + Técnicos + categoria de Projeto

Rodada de ajustes sobre a camada institucional (que já estava completa e em produção):

- **Sidebar reorganizada** em 3 grupos: **CADASTROS** (Nacional — ex-"Instituição", Estaduais,
  Filiadas, Técnicos), **PROJETOS** (Emendas/MROSC/Outros — 3 links pra mesma lista, filtrada
  por `?categoria=`), **ADMINISTRAÇÃO** (Usuários). `AppSidebar.tsx` ganhou `useSearchParams`
  pra saber qual link de Projetos está ativo — exigiu envolver `<AppSidebar>` em `<Suspense>`
  dentro de `AppShell.tsx` (senão o build reclama de `useSearchParams` fora de boundary).
- **`projetos.categoria_instrumento`** (`emenda`|`mrosc`|`outro`, migration 05) — campo
  controlado só pra filtro da sidebar, separado de `tipo_instrumento` (texto livre já
  existente, ex: "Termo de Fomento"). CooperaMais = `mrosc`.
- **Página Filiadas** (`/filiadas`, `components/filiadas/FiliadasLista.tsx`): lista de todos os
  ~152+ empreendimentos com Nome/CNPJ/Filiação (badges Nacional e/ou nome da Estadual, os dois
  eixos são independentes)/Status do diagnóstico mais recente (%)/Projetos em execução
  vinculados. Clique abre o detalhe.
- **Detalhe da Filiada** (`/filiadas/[id]`, `components/filiadas/FiliadaDetalhe.tsx`): resumo
  cadastral + card de diagnóstico. Sem diagnóstico → botão "Iniciar Diagnóstico". Com
  diagnóstico 100% → "Editar" (entra na versão atual) e "Atualizar diagnóstico" (Drawer: rótulo
  de versão tipo `T1-2027`, relato curto, relatório anexo opcional — cria uma **nova linha** em
  `diagnosticos` com `versao+1`, copiando `respostas`/`analise_tecnica` da versão anterior como
  ponto de partida). Histórico de atualizações lista todas as versões (rótulo, data, %, relato,
  link pro relatório anexado se houver) — "a evolução do Filiado" que o Luciano descreveu como
  o principal ativo de dados da UNISOL.
  - `diagnosticos.relato_versao` (migration 06) — texto curto da evolução, direto na tabela
    (o arquivo do relatório continua indo por `documentos_institucionais`, tipo
    `relatorio_evolucao`, que também virou opção em `TIPOS_DOCUMENTO`).
- **Página Técnicos** (`/tecnicos`, `components/tecnicos/TecnicosLista.tsx`): diretório
  somente-leitura de `usuarios` com perfil `aplicador`/`tecnico` — nome, contato, perfil,
  vínculo institucional (Nacional direto ou qual Estadual), instituição. Não cria nem edita —
  isso continua em Administração → Usuários, sem mudança nenhuma ali.
- Build local limpo, deploy em produção (`sistema.unisolbrasil.org.br`), rotas novas + filtro
  de Projetos confirmados via curl (200 em todas).

## 2026-09-03 (mesmo dia, rodada seguinte) — Filiadas ganha CRUD real, Técnicos vira banco de
## talentos, Equipe aloca técnico↔projeto, edição liberada em Diretoria/Usuários/Documentos

Sequência de ajustes pedidos depois de usar as telas do dia anterior:

- **Diagnósticos**: drawer "+ Novo diagnóstico" simplificado — só lista Filiadas já
  cadastradas e ainda sem diagnóstico (tirou o modo "cadastrar novo empreendimento" e o
  vínculo fixo com o projeto CooperaMais, que não fazia mais sentido no modelo atual). Ganhou
  filtro Nacional/Estadual/Todos (só Estaduais `status='formalizada'` aparecem) antes do campo
  de busca — busca filtra dentro do que já foi selecionado, não substitui.
- **Filiadas ganha cadastro de verdade** (`CadastrarFiliadaDrawer.tsx`): select "a quem será
  filiada" (Nacional OU uma Estadual — escolha única na criação, editável depois) → nome
  fantasia → CNPJ com autolookup (BrasilAPI) → contato → upload opcional da ficha de filiação.
  Migration 07 libera `documentos_institucionais.entidade_tipo='empreendimento'` (não existia).
  Ganhou também o mesmo filtro Nacional/Estadual/Todos da lista de Diagnósticos.
- **Detalhe da Filiada virou cadastro editável com autosave** — reaproveita
  `Secao02Identificacao` (a mesma Seção 2 do wizard) dentro da página, agora com botão de
  busca de CNPJ. Consequência importante: a vinculação Nacional/Estadual deixou de ser
  fixada só na criação — dá pra reclassificar a filiação de uma Filiada a qualquer momento.
- **Técnicos deixou de ser um espelho de `usuarios`** e virou o banco de talentos de verdade
  que devia ser desde o início: tabela `tecnicos` (migration 08) com nome, telefone, email,
  `area_atuacao` (ATER/Administrativo/Comunicação/Coordenação/Jurídico/Contábil/TI),
  competências (texto livre) e vínculo Nacional/Estadual — **independente de ter login** no
  sistema (isso continua só em Administração → Usuários). Ganhou filtro por Projeto (default
  Todos) antes da busca.
- **Equipe** (novo): aba dentro do detalhe de Projeto, aloca um `tecnico` no projeto com
  cargo/função livre (`equipe_projeto`, migration 10) — é o que alimenta o filtro por Projeto
  em Técnicos. Três eixos agora coexistem e são independentes: vínculo institucional do
  técnico (Nacional/Estadual), vínculo do Filiado com o projeto (`empreendimento_projeto`), e
  alocação do técnico no projeto (`equipe_projeto`).
- **Edição liberada em Diretoria (Nacional e Estadual) e Usuários** — antes só existia
  "+Adicionar"/"+Cadastrar", sem editar nem excluir. Diretoria: clique na linha abre o drawer
  pra editar, com botão Excluir. Usuários: clique na linha edita nome/perfil/estadual/
  instituição + toggle "Ativo" que agora **bloqueia login de verdade** (checado no
  `AppShell`, redireciona pro login com aviso) — antes o campo existia no banco mas nada
  checava. Documentos/anexos ganharam botão Excluir (remove do Storage e da tabela).
- **Dois bugs de RLS encontrados e corrigidos no caminho** (migration 09): `unisol_estaduais`
  nunca teve policy de `UPDATE` — a edição de perfil de uma Estadual rodava mas nunca gravava
  nada, falhava em silêncio. E `empreendimentos` só permitia `UPDATE` pra admin, então quando
  um técnico/aplicador editava a Seção 2 em campo (fluxo real de uso, não é admin), a
  gravação também falhava silenciosamente — ampliado pra `authenticated`, mesma régua já usada
  pro INSERT (migration 02).
- Todas as migrations (05 a 10) rodadas e confirmadas pelo Luciano; build local limpo em cada
  rodada; deploy em produção confirmado via curl a cada etapa.

**Achado de processo**: pedir pro Luciano abrir o `.sql` revelado no Finder às vezes resulta
nele escrevendo "Feito"/colando o erro *dentro do arquivo* (em vez de só rodar no Supabase e
responder no chat) — isso sobrescreve o conteúdo da migration. Sempre conferir o conteúdo do
arquivo antes de commitar quando isso acontecer, e restaurar a partir do que foi escrito
originalmente (está registrado neste mesmo STATUS.md e no histórico da conversa).

## Próxima sessão — retomar por aqui
1. Popular `unisol_estaduais` (lista real ainda não recebida do Luciano) e importar os 152
   empreendimentos do CooperaMais em `empreendimentos` + `empreendimento_projeto` (fonte:
   planilha/lista real da UNISOL, ainda não recebida).
2. Fase 2 do plano original (`.claude/plans/twinkling-imagining-fairy.md`): offline de
   verdade (Dexie) — escopo confirmado como exclusivo do wizard de diagnóstico, todo o resto
   (Filiadas, Estaduais, Projetos, Usuários, Técnicos) fica online-only e bloqueado no mobile
   (já está, via `SoDesktop`).
3. Portal do dirigente por token (Seção 2/3/4/6/7/10/12/15 pré-preenchidas antes da visita).
4. `numero_termo_fomento`/`numero_transferegov` do CooperaMais ainda não preenchidos — Luciano
   vai passar os números certos.
5. CNPJ das estaduais sem dado ainda (PI/CE/PB/MT/AC/SE/MG/SC).
6. Equipe é só alocação (cargo texto livre) — sem período obrigatório de vigência na UI
   (`data_saida`/`ativo` existem no schema mas não têm campo no drawer ainda); avaliar se
   precisa antes de escalar o uso.
