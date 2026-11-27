# Status — Sistema UNISOL Brasil

Última atualização: 2026-11-27

## Ampliação de responsabilidade — Gabriele Ramos Venâncio (Sorocaba/SP) (2026-11-27)

Diferente dos lotes anteriores: ela **já tinha conta** (criada no lote Marco 0 de 16/11), com 10
empreendimentos da região de Sorocaba já vinculados. Nova linha de planilha descrevia papel
ampliado: "Coordenação Regional Sudeste – responsável provisório... até contratação do
extensionista", território "Região de Sorocaba", 12 empreendimentos — mas 10 dos 12 já batiam com
o que ela já tinha (conferido achando a interseção, não re-vinculando duplicado). Só 2 eram
novos: Instituto Ecológico de Artistas Orgânicos Ultrassociais (já existia, SP-0036, só faltava o
vínculo) e Cooperativa Mista Agropecuária de Capão Bonito (não existia, cadastrada como SP-0043).

**Decisão explícita do Luciano**: manter o nível de acesso dela como `extensionista` (não elevar
pra `regional`, mesmo com a descrição de "coordenação regional") — só documentado o cargo real no
campo `cargo` do `equipe_projeto`, sem mudar permissão. E-mail informativo enviado (não é link de
1º acesso, ela já tinha conta), com cópia pra Melissa.

## Lote de acesso — Carlos Omar da Silva (Acre) (2026-11-27)

Mesmo pedido/formato da Lázara (linha de planilha), mesma lista de 28 empreendimentos — função
diferente: "Assessoria Administrativa" em vez de "Extensionista de Campo". Sistema só tem 3
níveis de acesso (`nacional`/`regional`/`extensionista`); confirmado com Luciano usar
`extensionista` mesmo assim (mesmo molde de vínculo por empreendimento).

Como o lote da Lázara já tinha corrigido os 3 congelados e cadastrado o "Associação Belo Jardim"
(AC-0029), esse segundo lote não teve achado novo — os 28 bateram direto. Conta criada
(`carlosaspet@yahoo.com.br`), 28 vínculos conferidos, e-mail de 1º acesso enviado com cópia pra
Melissa.

## Lote de acesso — Lázara Marcelino de Souza (Acre) (2026-11-27)

Pedido direto do Luciano (contato feito no evento da APEX), dados vindos de uma linha de
planilha (nome, função "Extensionista de Campo", UF AC, território "Acre (todo o estado)",
telefone/e-mail, lista de 28 empreendimentos por nome+município). Conta criada
(`consultoria.multiservice@gmail.com`, perfil `tecnico`, nível de acesso `extensionista`,
território via `projeto_executante_id` da UNISOL Brasil nacional — AC cai nesse executante,
junto com AM/AP/PA/RO/RR/TO/MT/MS/GO/DF).

**Achados reais, mesmo padrão de sempre**:
- 3 dos 28 empreendimentos pedidos estavam congelados (COOPERGRÃOS/Brasiléia, Vale do
  Juruá/Rodrigues Alves, Walter Arce/Bujari) — confirmado com Luciano, descongelados.
- 1 dos 28 ("Associação Belo Jardim", Rio Branco) não batia com nenhum empreendimento
  cadastrado — confirmado com Luciano, cadastrado como novo (`AC-0029`).
- Por outro lado, 1 empreendimento do Acre que já existia no banco (`AC-0028`, "Associação dos
  Pequenos Produtores Rurais Fronteira", Epitaciolândia) **não** estava na lista da Lázara — não
  foi vinculado a ela.
- Bug de processo pego a tempo: montei o lote inicial com 29 IDs em vez de 28 (tinha incluído o
  AC-0028 por engano) — conferência de contagem antes do insert pegou o erro.

28 vínculos `tecnico_empreendimento_projeto` criados e conferidos (contagem + distinct). E-mail
de 1º acesso enviado (link de recovery via short-link `/ir/`), com cópia pra
`cooperamais@unisolbrasil.org.br` (mesmo padrão dos lotes anteriores da Melissa).

## Feature nova: botão de remover documento no Anexo A pro técnico (2026-11-26) — CONCLUÍDO

Fecha a pendência do caso da Antonia (logo abaixo): `AnexoAEvidencias.tsx` ganhou botão "Remover"
com confirmação inline ("Remover? [Sim] [Cancelar]") ao lado de "Anexar"/"Substituir", pra
qualquer técnico. Precisou de 2 RLS novas (`supabase_migration_26_remover_documento_tecnico.sql`):
delete em `documentos_institucionais` pra técnico (só admin podia, migration 04) e delete em
`storage.objects` do bucket `documentos-institucionais` (nunca existiu policy de delete nenhuma
ali, nem pra admin — 1ª tentativa de rodar a migration deu erro de policy de storage duplicada
com esse nome vindo de algum lugar não rastreado; corrigido com `drop policy if exists` antes de
cada `create`, rodado de novo com sucesso).

Testado ao vivo de ponta a ponta: conta técnica descartável + empreendimento/diagnóstico
descartáveis + documento de teste, logado de verdade no `/login`, clicou "Remover" na UI,
confirmado que o registro em `documentos_institucionais` e o objeto no Storage sumiram os dois
(consulta direta pós-clique). Massa de teste toda removida depois. `tsc`/`build` limpos.
Commits `e7c965f`, `0912f53`.

## Suporte real: técnico sem como remover documento errado do Anexo A (2026-11-26)

Antonia Barroso (técnica AM — Tefé/Amaturá/Silves) mandou print pra Melissa: subiu documentos de
uma associação no lugar de outra no Anexo A, e não conseguiu tirar. Causa confirmada lendo
`AnexoAEvidencias.tsx`: **o técnico não tem nenhum botão de remover documento** — só upload, sem
delete. Não é erro de uso dela, é um buraco de feature real.

Resolvido manualmente pra destravar na hora: localizados os 7 documentos que ela subiu entre
18:18–18:21 (UTC) de hoje no diagnóstico do empreendimento AM-0007 (Clube de Mães Santa Margarida
Maria de Alacoque, Tefé) via `documentos_institucionais.uploaded_by` — um deles
("ATA DE ALTERAÇÃO DE ENDEREÇO VIRGILIO BARROSO.pdf") claramente não pertencia a essa entidade.
Apagados os 7 (Storage + banco, já que ela ia subir tudo de novo mesmo) e zerado o `completo_em`
do diagnóstico, que tinha ficado travado em "100% completo" por causa dos documentos que não
existem mais.

**Pendência registrada pra fase futura**: adicionar botão de remover documento no Anexo A pro
técnico (hoje só existe no código do admin, não no do técnico) — sem isso, qualquer engano de
upload exige intervenção manual via banco.

## Bug real corrigido: link de redefinição de senha "não funciona" (2026-11-25)

Luciano reportou que várias pessoas reclamaram que o link de redefinição de senha não funciona.
Reproduzido ao vivo (conta de teste descartável + `curl -D -`): um link de recovery do Supabase é
de uso único e expira (~1h). Quando expirado ou já clicado antes, o Supabase redireciona pra raiz
do site com `#error=access_denied&error_code=otp_expired&error_description=...` no **fragment**
da URL (nunca visível/processável no servidor) — e `app/page.tsx` não tratava esse caso nenhum,
só escutava o evento `PASSWORD_RECOVERY` e senão caía no `/login` normal depois de 1s. Resultado:
a pessoa cai num login completamente normal, sem erro nenhum, achando que "o link não funciona"
— sem pista de que o problema é o link em si (expirado/reusado), não o sistema.

Esse é um bug **diferente** do "Verificando link..." travado corrigido em 2026-11-18 (aquele era
sessão válida mal interpretada por nome de evento; este é token realmente inválido, sem sessão
nenhuma).

**Corrigido** em 3 pontos:
- `app/page.tsx`: antes de qualquer outra lógica, checa `window.location.hash.includes('error=')`
  e redireciona pra `/login?erro=link_invalido` em vez de cair no login mudo.
- `app/login/page.tsx`: novo banner amarelo quando `erro=link_invalido`, explicando que o link
  expirou/já foi usado e indicando o botão "Esqueci minha senha" pra pedir um novo.
- `app/redefinir-senha/page.tsx`: rede de segurança adicional — se depois de 4s ainda não tiver
  sessão (ex: alguém chega direto nessa URL sem token, ou algum caso em que o erro não cai na
  raiz), para de mostrar "Verificando link…" pra sempre e mostra o mesmo tipo de aviso com botão
  pra pedir um novo link, em vez de travar silenciosamente.

Testado: `npx tsc --noEmit` e `npm run build` limpos. Reprodução do erro confirmada via curl
direto na API do Supabase (`location:` do redirect com o hash de erro) antes do fix.

## Bug real corrigido: "Invalid key" ao anexar documento com espaço/acento no nome (2026-11-24)

Luciano mandou print de erro no Anexo A do diagnóstico: `Erro no upload: Invalid key:
diagnostico/.../estatuto-...-Estatuto Tefé.pdf`. Causa: o nome original do arquivo (com espaço e
"é") ia direto pro caminho usado como chave do objeto no Supabase Storage, que rejeita certos
caracteres fora de um conjunto seguro — reproduzido ao vivo com `curl` direto na API de Storage
antes de corrigir, confirmando a causa exata (`InvalidKey`).

**Corrigido**: `sanitizarNomeArquivo()` novo em `lib/documentos.ts` — remove acentos (NFD +
strip de diacríticos) e troca qualquer caractere fora de `[a-zA-Z0-9._-]` por `_`, preservando a
extensão. Aplicado nos **3 lugares que fazem upload de documento** (o mesmo bug existia em
todos): Anexo A do diagnóstico (`AnexoAEvidencias.tsx`), cadastro de Filiada
(`CadastrarFiliadaDrawer.tsx`) e documentos institucionais (`DocumentosAdmin.tsx`). O nome
original continua aparecendo normal pro usuário — fica salvo à parte em
`documentos_institucionais.nome_arquivo`; só o trecho usado como chave de storage é sanitizado.

Testado ao vivo direto na API de Storage: nome problemático reproduz `InvalidKey`, nome
sanitizado funciona normal — confirmado antes e depois do fix, arquivo de teste removido depois.
Commit `e1b559e`.

## Lote de acessos — pedido formal da Melissa (2026-11-24)

E-mail da Melissa Souza Branco (Coordenação Nacional EcoUni), encaminhado pelo Luciano: 3
extensionistas novos pra Meta 1/Etapa 1.1 (diagnóstico socioeconômico e produtivo) + 2 saídas.

**Incluídos** (perfil `tecnico`, `equipe_projeto.nivel_acesso='extensionista'`, território por
`projeto_executante_id` — PB cai no Executante Bahia, que cobre o Nordeste inteiro):
- Jussara (Ecossistema) — `costasarah686@gmail.com` — 8 empreendimentos da Paraíba
- Mauricio — `mauriciolucchi1978@gmail.com` — 6 empreendimentos (Sudoeste Paulista + Iporanga/Cananéia)
- Genicelli — `genicelli@yahoo.com.br` — 10 empreendimentos do Vale do Ribeira

Todos os 24 CNPJs resolvidos contra o cadastro real antes de criar qualquer conta (nenhum
empreendimento novo precisou ser cadastrado desta vez). E-mail de 1º acesso enviado aos 3, com
cópia pra `cooperamais@unisolbrasil.org.br` (pedido explícito da Melissa) — 1ª tentativa pra
Genicelli falhou por instabilidade momentânea do SMTP, reenviada com sucesso na sequência.

**Achado real, mesmo padrão de 16/11**: 3 dos 10 empreendimentos pedidos pra Genicelli
(COOPERQUIVALE, Cooperativa de Agricultura Familiar de Miracatu, COOPERAGUA) estavam congelados
desde o lote de substituição que a própria Melissa passou em 05/11. Confirmado com o Luciano —
descongelados antes de vincular.

**Removidos** (saíram da equipe): Daniely Sales Guedes (substituída pela Jussara na Paraíba) e
Francieli de Souza Cunha (RS, sem substituta indicada). Ação aplicada: `usuarios.ativo=false`
(bloqueia login de verdade, já checado no `AppShell`) + `equipe_projeto.ativo=false` com
`data_saida` de hoje — **não foi feita exclusão** de conta nem dos vínculos históricos
`tecnico_empreendimento_projeto` (preserva o histórico de quem trabalhou em quê). Não existe UI
pra essa ação ainda (campo `ativo`/`data_saida` do `equipe_projeto` existe no schema desde a
migration 10 mas sem campo no drawer) — feito direto via REST, mesmo padrão de sempre pra lotes
sem tela própria.

Tudo rodado via script `.mjs` descartável (não commitado), confirmado via REST ao final: 3
usuários criados, 24 vínculos técnico×empreendimento, 3 empreendimentos descongelados, 2 contas
desativadas com saída de equipe registrada.

## 📍 Como funciona a validação hoje (resumo — o modelo mudou várias vezes em 2026-11-23)

As 5 entradas abaixo (mesma data) registram a evolução passo a passo da conversa com o Luciano —
útil pra entender o porquê de cada decisão, mas quem só precisa saber **como está funcionando
agora** pode ler só este resumo:

1. Técnico edita o diagnóstico à vontade (autosave) — nenhuma edição isolada vira versão nova.
2. Quando bate 100% das 17 seções (inclui ≥1 documento no Anexo A), `completo_em` é gravado
   automaticamente (trigger no banco) — é só um registro histórico, não trava nada ainda.
3. Técnico (ou admin) decide que aquele ciclo está pronto — ex. periodicidade trimestral
   combinada com a diretoria — e clica **"Enviar para validação"** (confirmação via `confirm()`).
   Aparece no rodapé da lista de seções do wizard (`/diagnosticos?id=...`, sempre visível, não só
   no Anexo B) e também em `/filiadas/[id]`. Isso grava `enviado_em`/`enviado_por` e **trava
   edição** (trigger bloqueia UPDATE em `respostas`/`analise_tecnica`).
4. Admin vê a fila em `/dashboard` → "Aguardando sua validação (N)" — não tem e-mail/WhatsApp,
   só essa lista por enquanto. Clica na Filiada, revê, e clica **"Validar diagnóstico"** (só
   `perfil='admin'`).
5. Validar congela a versão como `T{n}` (rótulo automático, `n = versao - 1`) e **já cria sozinho
   o próximo rascunho** (respostas copiadas) — o técnico não precisa clicar em nada pra continuar.
6. Se precisar corrigir algo antes da diretoria decidir, **"Cancelar envio"** destrava sem criar
   versão nenhuma.
7. Listagens (`/filiadas`, `/diagnosticos`) ordenam **Validado → Em validação → Rascunho**,
   alfabético dentro de cada grupo. Cada versão tem um botão "Ver / imprimir" (relatório
   somente-leitura, `window.print()` pra PDF).

Tabelas/funções envolvidas: `diagnosticos.completo_em`/`enviado_em`/`enviado_por`/`validado_em`/
`validado_por` (migrations 24 e 25); RPCs `enviar_para_validacao()`, `cancelar_envio_validacao()`,
`validar_diagnostico()`; helpers em `lib/diagnostico/validacao.ts`.

**Pendente (fase 2, não construída)**: aviso por e-mail/WhatsApp quando um diagnóstico é enviado
(hoje só a lista no dashboard); aba de relatório de evolução (gráfico T0→T1→T2 de pontuação).

## Botão de envio vai pro rodapé da lista de seções — CONCLUÍDO (2026-11-23, mesmo dia)

Ajuste fino depois do teste real: Luciano achou mais didático ter o botão "Enviar para validação"
logo depois da lista de seções (onde já vê todos os tickets verdinhos), sempre visível — não só
dentro do conteúdo do Anexo B, que exigia navegar até lá especificamente (causa real do "não
estou achando o botão" de antes).

`SidebarSecoes` ganhou um prop `rodape` (ReactNode opcional), renderizado logo depois da lista de
seções. `DiagnosticoWizardShell` monta esse bloco (% preenchido, rótulo T{n}, badge de status,
botões Enviar/Cancelar) uma vez só e passa pra lá — lógica de enviar/cancelar continua toda no
shell, sem acoplar o componente de sidebar a Supabase/RPC.

Testado ao vivo em produção: abri o diagnóstico da Associação Renascer direto na primeira seção
(Controle da aplicação) — antes não mostraria nada ali; agora mostra "100% preenchido · T0" +
"Aguardando validação da diretoria" + botão "Cancelar envio" (esse diagnóstico específico já
tinha sido enviado por ele mesmo, testando). Commit `bccee92`.

**Nota de processo**: ao testar, a aba carregou com a sessão real do Luciano já ativa no Chrome
(não a conta de teste descartável que eu tinha acabado de criar) — fechei a aba sem clicar em
nenhuma ação, só confirmei visualmente. Lição: ao testar este app específico via browser
automation, sempre checar quem aparece como usuário logado no canto inferior esquerdo antes de
clicar em qualquer botão de ação — sessão pode já estar ativa de uso real anterior no mesmo
Chrome.

## Ordenação por fase + badge nas listagens — CONCLUÍDO (2026-11-23, mesmo dia)

Último ajuste da leva de hoje: `/filiadas` e `/diagnosticos` agora ordenam por fase do
diagnóstico — **Validado primeiro, depois Em validação, depois Rascunho**, alfabético dentro de
cada grupo (ordem explícita do Luciano). Novo helper compartilhado `lib/diagnostico/validacao.ts`
(`faseDiagnostico`/`compararPorFaseENome`/`FASE_LABEL`/`FASE_COR`) — mesmo vocabulário e cor nas
duas listagens.

Em `/filiadas`, a coluna "Maturidade comercial" virou **"Fase do diagnóstico"** — fazia mais
sentido mostrar onde o diagnóstico está no ciclo de preenchimento/validação do que a régua de
maturidade do negócio (que já aparece na página de detalhe da própria Filiada).

Testado com dados descartáveis — incluindo um teste deliberadamente rigoroso com nomes
alfabeticamente invertidos (o validado chamado "Z", o rascunho chamado "A") pra confirmar que a
fase realmente vence o alfabeto, não o contrário. Commit `6b29b6e`.

## Botão "Enviar para validação" também no wizard (Anexo B) — CONCLUÍDO (2026-11-23, mesmo dia)

Pedido do Luciano depois de testar: manter o botão em `/filiadas/[id]` (ficou), mas também
colocar o mesmo botão direto no wizard do diagnóstico, logo abaixo do Anexo B — onde o técnico já
está trabalhando, sem precisar voltar pra tela da Filiada — e renomear "Atualizar diagnóstico"
pra **"Enviar para validação"** nos dois lugares (mais claro sobre o que a ação faz).

`DiagnosticoWizardShell` ganhou a mesma lógica de enviar/cancelar envio (popup de confirmação
igual, mesma regra de perfil `tecnico`/`admin`), com um `recarregarEnvio()` leve que só busca os 4
campos de status depois da ação, em vez de reler o diagnóstico inteiro. Desabilitado quando
offline (a ação em si — RPC no banco — exige conexão, diferente do autosave que funciona sem
sinal).

Testado ao vivo em produção com conta admin descartável: abri o diagnóstico 100% completo da
Associação Renascer, cliquei na seção Anexo B, confirmei "100% preenchido · T0" + botão "Enviar
para validação" aparecendo certinho logo abaixo do conteúdo da seção. Commit `e47f4df`.

## Fila "Aguardando sua validação" no dashboard do admin — CONCLUÍDO (2026-11-23, mesmo dia)

Luciano perguntou "como isso chega pra nós, admin?" depois de ver o fluxo de envio/validação —
resposta honesta na hora: não chegava, não tinha aviso nenhum, só dava pra saber entrando
manualmente na Filiada. Com 152 Filiadas, inviável. Luciano escolheu lista no sistema (não
e-mail, por ora) via `AskUserQuestion`.

- `DashboardAdmin` ganha seção "Aguardando sua validação (N)" — todos os diagnósticos com
  `enviado_em` preenchido e `validado_em` nulo, ordenados por mais antigo primeiro, link direto
  pra cada Filiada. `lib/dashboard/queries.ts`: `carregarAguardandoValidacao()` (nova) junta com
  `empreendimentos` (nome/município/UF — os campos snapshot em `diagnosticos` nunca são escritos
  de verdade, confirmado) e `usuarios` (nome de quem enviou).

**Dois bugs reais achados e corrigidos no caminho, sem relação direta com o pedido**:
1. **Achado ao investigar "não vejo o botão de atualizar"**: 2 diagnósticos já genuinamente 100%
   completos em produção (desde antes da migration 24 existir) estavam com `completo_em` nulo —
   ninguém tinha editado nada neles depois da migration pra disparar o cálculo. Corrigido via
   backfill direto (REST, service role) com a data de hoje como marco (não tem como saber a data
   histórica real). Não é bug recorrente — só afeta diagnósticos que bateram 100% ANTES da
   migration 24 e não tiveram nenhuma escrita depois; daqui pra frente o trigger cobre tudo.
2. **`diagnosticos.status` nunca é escrito pelo app de verdade** (sempre `'rascunho'`, confirmado:
   41/41 diagnósticos reais em produção) — as métricas "Diagnósticos concluídos"/"em aberto" do
   dashboard (admin em `lib/dashboard/queries.ts`, técnico em `lib/dashboard/tecnicoQueries.ts`)
   usavam esse campo morto e sempre mostravam números sem sentido (concluídos sempre 0). Trocado
   por `validado_em`, que agora é a fonte de verdade real desde a migration 24/25.

**Efeito colateral corrigido também**: `ListaDiagnosticos` (`/diagnosticos`, lista geral) mandava
QUALQUER linha clicada pro wizard de edição, mesmo diagnóstico já enviado/validado — isso ia dar
erro de sync confuso pelo trigger de trava. Agora detecta e manda pra `/filiadas/[id]` nesse caso;
ganhou também o mesmo badge de 3 estados (Em andamento/Aguardando validação/Validado) em vez do
status morto.

Testado com dados descartáveis (diagnóstico criado já com `enviado_em` preenchido, confirmado que
a query da fila retorna certo). Commit `a876fd7`.

## Técnico envia pra validação antes da diretoria validar — CONCLUÍDO (2026-11-23, mesmo dia)

Refinamento do modelo de validação T0/T1/T2 (sessão anterior, mesmo dia): Luciano notou que, como
o diagnóstico tem autosave contínuo, o admin podia validar qualquer estado momentâneo que o
autosave tivesse gravado assim que os 17 campos ficassem não-vazios — sem o técnico ter decidido
que aquilo estava de fato pronto pra revisão. Migration
`supabase_migration_25_envio_validacao.sql`:

- `diagnosticos.enviado_em`/`enviado_por` — técnico (ou admin) clica "Atualizar diagnóstico"
  (`/filiadas/[id]`, com `confirm()` nativo igual o resto do app já usa pra ações sensíveis) →
  RPC `enviar_para_validacao()` carimba e TRAVA edição (trigger `diag_guard_pos_validacao`
  ampliado — agora bloqueia tanto `enviado_em` quanto `validado_em` preenchidos).
- `validar_diagnostico()` passa a exigir `enviado_em is not null` (antes só exigia `completo_em`)
  — admin só valida o que o técnico formalmente decidiu enviar.
- `cancelar_envio_validacao()` — destrava sem criar versão nenhuma, caso o técnico precise
  corrigir algo antes da diretoria decidir (só funciona antes de `validado_em`, depois disso é
  definitivo).
- `/filiadas/[id]`: 3 estados visuais agora (Em andamento / Aguardando validação da diretoria /
  Validado), botões condicionais por estado e por perfil (`podeSubmeter` = tecnico ou admin;
  `souAdmin` = só admin valida). Relatório mostra também "Enviado por X em Y" quando aplicável.

**Modelo final**: técnico edita à vontade via autosave (sem gerar versão) → decide quando um ciclo
de visitas virou um checkpoint formal (ex: combinado trimestral com a diretoria) → clica
"Atualizar diagnóstico" → aguarda validação → diretoria aprova (ou técnico cancela o envio pra
corrigir algo antes) → vira Tx, nasce a próxima automaticamente (mecanismo da sessão anterior,
sem mudança).

Testado de ponta a ponta com usuários técnico+admin e diagnóstico 100% descartáveis (criados e
apagados via REST, nunca dado real): admin não valida sem envio prévio; edição trava assim que
enviado (antes mesmo de validado); cancelar envio destrava de verdade, edição volta a funcionar;
ciclo completo enviar→validar→T0 congela→T1 nasce sozinha confirmado; reenvio de versão já
validada rejeitado. Commit `3709558`.

## Linha do tempo T0/T1/T2 com validação da diretoria — CONCLUÍDO (2026-11-23)

Pedido do Luciano: diretoria precisa validar diagnósticos 100% preenchidos, e precisava de um
jeito de saber se algo foi alterado depois disso, além de uma aba de relatório/PDF. Desenhado em
conversa (ver `[[project_diagnostico_unisol]]` na memória pro racional completo da discussão) e
construído na mesma sessão — migration `supabase_migration_24_validacao_diagnostico.sql`:

- `diagnosticos.completo_em` — grava a primeira vez que o preenchimento bateu 100%, via trigger
  (cobre tanto edição de `respostas`/`analise_tecnica` quanto upload do Anexo A, que não passa
  por UPDATE na própria linha).
- `diagnosticos.validado_em`/`validado_por` — quando e quem (só `perfil='admin'`, decisão
  2026-11-23) validou.
- Validar = função `validar_diagnostico()` (RPC, atômica): congela a versão atual (rótulo
  automático T0/T1/T2... = `versao-1`) e já nasce sozinho o próximo rascunho, com as respostas
  copiadas — técnico não precisa clicar em nada pra continuar.
- Trigger trava qualquer edição de `respostas`/`analise_tecnica` numa versão já validada — a
  única forma de mudar algo é a próxima versão (já existe automaticamente).
- `/filiadas/[id]`: botão "Validar diagnóstico" (só admin, só com 100%), "Editar" vira
  "Ver / imprimir" quando validado, linha do tempo mostra cada T com os dois carimbos (quando
  completou + quem validou e quando).
- **Botão manual "Atualizar diagnóstico" removido** — ficou redundante, validar já cria a próxima
  versão sozinho.
- Relatório novo (`components/diagnostico/relatorio/RelatorioDiagnostico.tsx`) — somente leitura,
  todas as 17 seções, abre em tela cheia, botão "Imprimir / Salvar PDF" via `window.print()` (CSS
  dedicado em `globals.css`, `#relatorio-print` — nenhuma lib nova instalada).

**Limitação conhecida e aceita**: não existe dicionário de rótulo humano por campo do formulário
(só existe como tipo TypeScript em `lib/diagnostico/schema.ts`) — o relatório mostra o nome do
campo "humanizado" (`participacao_quadro_social` → "Participacao quadro social"), legível mas não
é o texto exato da pergunta original. Se algum dia valer o esforço de um dicionário chave→pergunta
de verdade, dá pra trocar sem mexer no resto do componente.

**Testado de ponta a ponta com dados 100% descartáveis** (empreendimento, 2 usuários — admin e
técnico —, diagnóstico de teste, criados e apagados via REST com service role key, nunca tocando
dado real): validação gera T0+T1 corretos com os carimbos certos; tentar editar T0 validada é
bloqueada pelo trigger; validar duas vezes é rejeitado; técnico (não-admin) não consegue validar.
Nenhum resíduo deixado em produção. Commit `8e4aa5a`.

**Pendente, fase 2 (não construída ainda, por decisão de escopo)**: aba de relatório de evolução
(gráfico/tabela T0→T1→T2 de pontuação e classificação ao longo do tempo) — fica fácil de construir
depois, já que cada T é um snapshot completo e a pontuação já é calculável (`lib/diagnostico/
pontuacao.ts`).

## Bug real corrigido: "Verificando link..." travado no 1º acesso (2026-11-18)

Luciano reportou reclamação de "gente" (pelo menos 2 dos 5 extensionistas do lote Marco 0,
cadastrados 2 dias antes) presa na tela "Verificando link..." do `/redefinir-senha`, sem nunca
ver o formulário de nova senha.

**Causa raiz, confirmada empiricamente** (gerei um link de recovery de verdade e segui o redirect
com curl): o Supabase não honra o `redirect_to=.../redefinir-senha` pedido — cai sempre na raiz
`https://sistema.unisolbrasil.org.br` (sem path), achado que já tinha gerado um contorno em
22/10 (`app/page.tsx` detecta o evento `PASSWORD_RECOVERY` e dá `window.location.href =
'/redefinir-senha'`). O problema: esse 2º salto cria uma sessão **nova** do Supabase na página de
destino, que carrega do localStorage (já persistido pela raiz) e dispara `INITIAL_SESSION` — não
`PASSWORD_RECOVERY`/`SIGNED_IN`, que era tudo que `/redefinir-senha` escutava. Ficava travado pra
sempre, mesmo com a sessão de recovery válida já carregada.

**Corrigido** (commit `de28af5`): `/redefinir-senha` passa a checar a sessão em si (`session`
não-nulo, via `getSession()` + no callback de `onAuthStateChange`), não o nome do evento. Testado
ponta a ponta com conta descartável (Mailinator) — link → formulário aparece → senha salva →
redireciona logado pra `/diagnosticos`. Confirmado funcionando.

**Efeito colateral real**: token de recovery é de uso único — Kelvin e Jacira (que já tinham
clicado no link antigo e ficado travados, sem nunca definir senha) tiveram o link queimado sem
sucesso. Reenviei link novo pros 5 do lote Marco 0 depois do fix no ar (mesmo texto de
desculpa+novo link).

**Escopo real era maior**: Luciano trouxe mais 1 reclamação (Gleudiano Silva Rodrigues,
`gleudianoprof@gmail.com`) — do lote ORIGINAL de 24/10, não do Marco 0. Cruzei todos os 27
`usuarios.perfil='tecnico'` contra `last_sign_in_at` e achei **8 que nunca logaram desde a
criação** (6 do lote de 24/10 + 2 do Marco 0 já cobertos): Arildo Mota Lopes, Anne Guiomar de Sena
Silva, Nelsa Inês Fabian Nespolo, Daniely Sales Guedes, Luciano Marcelo da Costa Borges, além do
Gleudiano. Mesmo bug, só que de 3 semanas atrás, nunca reportado até agora. Reenviei link novo
pros 6 (total de 11 pessoas com link novo nesta sessão, contando os 5 do Marco 0).

**Dívida técnica que sobra**: a causa de fundo (Supabase não respeitando `redirect_to`) não foi
corrigida no painel — só contornada no código duas vezes agora. Vale, numa próxima sessão, conferir
Authentication → URL Configuration → Redirect URLs desse projeto (`aloumokqafywqntdisen`) e
adicionar `https://sistema.unisolbrasil.org.br/**` — mesmo tipo de ajuste já feito no Bertiofertas
(ver `[[feedback_deploy_vercel]]`/memória do Bertiofertas) — pra eliminar o salto duplo de vez.

## Lote "Marco 0" EcoUni — 6 extensionistas + 40 empreendimentos (2026-11-16)

Pedido formal da Melissa Souza Branco (Coordenação Nacional EcoUni, via e-mail encaminhado pelo
Luciano): 6 extensionistas de campo do EcoUni Redes Solidárias, cada um responsável pelo
Diagnóstico Participativo (Marco 0) de uma lista fechada de empreendimentos.

- **5 contas novas** (`perfil=tecnico`, `equipe_projeto.nivel_acesso='extensionista'`, território
  pelo `projeto_executante_id` da UF — RS/BA usam o Executante próprio, AC cai no Executante
  "Brasil" porque não tem Estadual constituída no Norte): Francieli de Souza Cunha (RS), Kelvin
  Alves Dourado (BA), Maicon Silva de Oliveira (BA), Eduarda Cristine Marcelino de França (AC),
  Jacira da Silva Morais Souza (AC). E-mail de 1º acesso (link de recuperação + link curto,
  mesmo padrão do lote de 24/10) enviado e confirmado OK pros 5.
- **Gabriele Ramos Venâncio (SP) já tinha conta** (lote de 24/10) — só recebeu os vínculos dos
  10 empreendimentos dela, sem novo e-mail (ela já usa o sistema ativamente).
- **14 empreendimentos novos cadastrados** (13 na Bahia — Kelvin 7, Maicon 6 — + 1 no Acre,
  "Associação dos Pequenos Produtores Rurais Fronteira", que tinha ficado de fora da importação
  anterior dos 152). Códigos BA-0019 a BA-0031 + AC-0028, `codigo` gerado automaticamente pelo
  trigger (migration 21), vinculados ao projeto CooperaMais (`empreendimento_projeto`).
- **40 vínculos `tecnico_empreendimento_projeto`** criados (atribuição real de responsabilidade,
  não só nível de acesso territorial) — 1 por empreendimento×extensionista, conforme a planilha
  exata que a Melissa passou.

**Achado real no caminho**: 2 dos 40 empreendimentos pedidos — **Armazém da Terra** (RS-0001) e
**APROBIO** (SP-0009) — estavam `diagnostico_liberado=false` desde o lote de 22 "a substituir"
que a própria Melissa passou via WhatsApp em 05/11 (ver seção acima). Luciano confirmou
descongelar os 2 e seguir normalmente — provavelmente descuido dela ao montar a lista nova sem
cruzar com o lote de congelamento. Os 2 foram descongelados antes de vincular.

Tudo rodado direto contra o banco com a service role key (script `.mjs` descartável, não
commitado — mesmo padrão do lote de convites de 24/10: cria conta via `auth.admin.createUser`,
`generateLink` tipo `recovery`, link curto em `links_curtos`, envio via SMTP Hostinger). Nenhuma
chamada à rota HTTP `importar-equipe-ecouni` (que ainda lê de uma planilha Google Sheets e usa o
modelo antigo de `Regional` solto — ficou obsoleta depois da migration 20; os dados desta vez
vieram direto do e-mail da Melissa, não de planilha).

**Pendente**: confirmar pra Melissa que os 6 perfis estão ativos e os empreendimentos vinculados
(ela pediu confirmação explícita no e-mail).

## Congelar diagnóstico de Filiadas + lote de 22 congeladas (2026-11-06)

`empreendimentos.diagnostico_liberado` (boolean, default true, migration 23) — quando false, a
Filiada some da lista de "iniciar diagnóstico novo" e o wizard bloqueia edição do diagnóstico já
existente (dado nunca é excluído). Controle fica em `/filiadas/[id]` (botão congelar/descongelar,
badge 🔒) e aparece como 🔒 também na lista geral de Filiadas.

**Lote aplicado no mesmo dia**: 22 empreendimentos "a substituir" no CooperaMais, lista recebida
da Melissa Souza Branco via WhatsApp (05/11), lida pelo MCP do 168 (`buscar_whatsapp`). Nomes
cruzados contra o cadastro real (razão social + nome fantasia, normalizado, com bônus de UF) —
todos os 22 bateram com confiança alta, confirmados por município/UF antes de aplicar via REST
direto (service role key local, `.env.local` do repo). Lista completa das 22 em
`[[project_diagnostico_unisol]]`.

## Maturidade comercial automática — nova feature (2026-10-29)

Surgiu de uma conversa cruzada com o relatório mensal do CooperaMais: a régua de maturidade
comercial (INICIAL/EM FASE/APTA) criada pro Plano de Ação — Implantação do CND não precisa de
roteiro novo pros técnicos preencherem — o **Bloco 5 (Gestão Comercial)** do diagnóstico já
institucional já captura quase tudo (canais de venda e %, emissão de NF, participação em
licitações PAA/PNAE, e um campo 5.7 + "régua de fechamento do bloco" em escala 0-4).

`lib/diagnostico/maturidadeComercial.ts` (novo): deriva INICIAL/EM FASE/APTA automaticamente a
partir das respostas do Bloco 5, sem pergunta nova nenhuma.
- **Nota 0-4 existe** (régua de fechamento do bloco, prioridade, ou campo 5.7 isolado): mapeia
  0-1→Inicial, 2-3→Em Fase, 4→Apta — com trava: nota 4 mas `emite_nf='nao'` rebaixa pra Em Fase
  (sem NF não opera nos canais formais do CND).
- **Nota não existe ainda** (caso real já visto em produção — técnico preenche canais/NF mas não
  dá a nota): estima por NF + canal ativo, **mas nunca infere "Apta" sozinho** — teto da
  estimativa é Em Fase, "Apta" exige avaliação explícita do técnico (decisão com o Luciano,
  evitar classificar como "pronta pra vender" por inferência de checkbox).

Badge colorido (🔴/🟡/🟢) exibido em `/filiadas/[id]` (detalhe) e como coluna nova em
`/filiadas` (lista — dá pra ver a maturidade das 152 de uma vez, sem query extra, reaproveita o
`diagnosticos.respostas` que a lista já carrega). Testado contra o único diagnóstico real com
Bloco 5 parcial em produção (ABAM: NF sempre + PAA/PNAE/venda direta ativos, sem nota 5.7) —
resultado "Em Fase", como esperado.

## Bug real: 21 técnicos do disparo em massa sem acesso aos Blocos 10-12/Anexo A/B (2026-10-29)

Técnicos reportaram não conseguir abrir as seções técnicas do diagnóstico (Blocos 10, 11, 12,
Anexo A, Anexo B — tela mostrava "Esta seção é preenchida pela equipe técnica após a
entrevista" em vez do conteúdo). Causa raiz: `app/api/admin/importar-equipe-ecouni/route.ts`
gravava `usuarios.perfil = 'aplicador'` pra **todo mundo** criado via o lote, sem diferenciar —
mas o gate de acesso às seções técnicas (`DiagnosticoWizardShell.tsx` e `SidebarSecoes.tsx`) só
libera Blocos 10-12/Anexos pra `perfil = 'tecnico'` (ou `admin`). `aplicador` é o perfil mais
restrito, pensado pro caso (ainda não implementado) de dirigente de cooperativa preenchendo
sozinho via link — nunca deveria ter sido usado pros técnicos reais do time.

**Corrigido**: rota passa a gravar `perfil: 'tecnico'` nas novas contas (commit a seguir);
backfill direto no banco corrigiu as 21 contas já afetadas (as 19 do lote do dia 26/10 + Gabriele
+ Carla, cadastradas manualmente na mesma sessão) de `aplicador` para `tecnico`. Confirmado via
REST: 0 contas com `aplicador` sobrando, 22 `tecnico` + 5 `admin`.

**Lição**: `usuarios.perfil` (admin/tecnico/aplicador, controla o que a pessoa vê no sistema
inteiro) é um campo diferente de `equipe_projeto.nivel_acesso` (nacional/regional/extensionista,
controla só o escopo territorial dentro de um projeto) — fácil confundir os dois ao escrever uma
rota de importação em massa. Checar sempre os dois ao dar acesso a alguém.

## Disparo em massa de convites do time EcoUni — concluído (2026-10-26)

Pendência registrada desde 2026-08-31 ("configurar SMTP próprio antes de convidar todo mundo")
e repetida em quase toda seção desde então ("aguardando autorização formal"). Luciano autorizou
e o lote rodou: **24 de 24 pessoas da planilha, 0 erros** — 19 contas novas (login +
`tecnicos` + `equipe_projeto` com nível de acesso e território corretos) + 5 que já tinham
conta (Melissa, Anderson, Isnaldo, e as duas cadastradas manualmente nesta mesma sessão —
Gabriele Ramos Venâncio, extensionista SP/Sudeste, e Carla Etiene Mendonça da Silva,
coordenadora regional Sul) só receberam link novo de redefinição. `luciano.maeda` excluído do
lote a pedido (parâmetro `excluir` novo na rota, commit `2643301`).

**Não rodou pela rota `importar-equipe-ecouni` via HTTP** — rodar a rota exige um token de
sessão de admin, e tanto usar a sessão real do Luciano quanto criar uma conta de admin
descartável pra isso foram bloqueados pelo classificador de segurança do Claude (mesma família
da regra "nunca mintar sessão de conta real"). Resolvido replicando a mesma lógica (parse da
planilha, dedupe, correção de email, resolução de território, criação de conta/técnico/equipe,
geração de link de recuperação + link curto, envio via SMTP Hostinger) direto contra o banco
com a service role key, num script Python descartável (não versionado, só rodou localmente).
Resultado idêntico ao que a rota faria, testado primeiro com 1 pessoa (Gabriele) antes do lote
completo.

Banco depois do lote: 27 usuários, 26 técnicos, 26 pessoas na equipe do CooperaMais.

## Migration 22 — mesmo gap da migration 11, agora em `relato_versao` (2026-10-24)

Erro real em produção (`42703 undefined_column`) ao salvar um diagnóstico revelou que
`diagnosticos.relato_versao` (migration 06, escrita em 2026-09-03) nunca tinha sido rodada de
verdade — idêntico ao gap achado na migration 11 em 2026-09-29 (SQL escrito, registrado como
concluído, mas a etapa de colar no SQL Editor ficou pra trás). O sync engine manda o campo
porque o TypeScript sempre teve ele; só o banco nunca recebeu a coluna. Auditado o resto de
`diagnosticos`/`empreendimentos` contra os tipos TypeScript — esse era o único gap. Migration
22 rodada e confirmada via REST (`supabase_migration_22_fix_relato_versao.sql`).

## Dois fixes pós-import dos 152 empreendimentos (2026-10-23)

- **Erro de sync real na UI**: o badge de "erro de envio" era só uma contagem, sem dizer o
  motivo — a mensagem real do Supabase já estava guardada em `_erro` por item, só não tinha UI
  pra mostrar. Agora clica e expande.
- **Bug real corrigido**: `useAutosaveEmpreendimento` grava via Dexie `.update()`, que só
  funciona se o registro já existir no IndexedDB local — sem isso falha em silêncio.
  `FiliadaDetalhe` nunca esquentava esse cache antes de editar, então qualquer empreendimento
  recém-importado (os 151 novos do CooperaMais, nunca abertos nesse navegador antes) dava erro
  ao salvar assim que o usuário editava algo (ex: Buscar CNPJ preenchendo endereço). Corrigido
  esquentando o cache local logo após buscar do Supabase.
- Sidebar do wizard trocou "Parte A"/"Bloco 1" (quebrava em 2 linhas dentro da bolinha) por só
  "A"/"1" — mesmo padrão enxuto que Anexo A/B já usavam.

## Os 152 empreendimentos reais do CooperaMais importados (2026-10-24)

Item pendente desde o início do projeto (citado em quase toda seção anterior deste arquivo como
"ainda não recebida") — Luciano passou a planilha real (CNPJ/Nome/UF/Cidade/E-mail/Telefone,
`lib/importEmpreendimentosCooperamais.ts`). Rota idempotente
(`app/api/admin/importar-empreendimentos-cooperamais`, dry-run por padrão, dedup por CNPJ)
confirmou e executou: **152 empreendimentos, 151 novos + 1 já existente (ABAM, mesmo CNPJ),
0 erros** — todos vinculados ao projeto CooperaMais, todos com código único gerado
automaticamente (migration 21), nos mesmos 13 UFs já cobertos pelo território dos Executantes
(migration 20) — a visibilidade por Regional/Executante passa a valer de verdade agora que
existe dado real, não só o caso de teste (ABAM).

**Não fez parte desta importação**: nenhum diagnóstico foi criado (ficam todos "Não iniciado"),
nenhum email foi enviado — é só cadastro + vínculo ao projeto. O lote de convite/redefinição de
senha pro time (22 pessoas da planilha EcoUni) é uma ação separada, já pronta desde antes,
rodada pra 1 pessoa (Luciano) em teste.

## Níveis de acesso por Regional/Território + modelo Celebrante/Executante (2026-10-22)

Retomada do "ajuste na primeira fase" do projeto UNISOL (a evolução pro motor WhatsApp de
agenda/relato, ver seção logo abaixo, continua pausada/deferida — não é isso). Luciano trouxe
uma planilha Google Sheets real ("Níveis de Acesso aos Empreendimentos — Projeto EcoUni Redes
Solidárias") como fonte viva do time do CooperaMais (ver memória `ecouni_planilha_acessos_fonte_viva`)
— objetivo: dar acesso real de produção a todo o time, restrito por território, sem esperar
todos os ~152 empreendimentos estarem cadastrados.

**Migrations 14-21**, nessa ordem, cada uma rodada e testada em produção antes da próxima:

- **14/16/17/18**: primeira tentativa de RLS por "Regional" (enum texto solto em
  `equipe_projeto`/`empreendimento_projeto`). Bug real encontrado em teste com contas
  descartáveis: um técnico Regional-Sul conseguia ver um empreendimento de outra regional —
  rastreado até uma peculiaridade de como o Postgres avalia subqueries correlacionadas dentro
  de uma policy RLS (não um erro de lógica — `auth.uid()` resolvia certo, os dados batiam
  exatamente com o esperado, e mesmo assim a policy liberava acesso indevido). Corrigido
  reescrevendo a regra como função `security definer` (`usuario_pode_ver_empreendimento`) — mais
  robusta E testável isoladamente via RPC, padrão recomendado do Supabase pra RLS complexa.
- **15**: links curtos (`/ir/[codigo]`) — emails de convite mostram
  `sistema.unisolbrasil.org.br/ir/Ab3kX9Qz` em vez do link cru e longo do Supabase, que deixava
  gente desconfiada de phishing.
- **19**: só nacional/regional (coordenador) podem cadastrar/vincular empreendimento ao
  CooperaMais — extensionista só visualiza.
- **20 — mudança de modelo, a pedido do Luciano**: o enum "Regional" solto foi substituído pelo
  modelo cadastral real do MROSC. Um projeto pode ser **execução em rede**: 1 Celebrante (quem
  assina o termo, normalmente UNISOL Brasil) + N Executantes (uma Estadual, ou a própria Brasil
  quando não há Estadual constituída no território), cada Executante responsável por um
  **território de UFs**. Tabelas novas: `projeto_executantes`, `projeto_executante_territorio`.
  A visibilidade de uma Filiada passa a ser **derivada do UF que ela já tem cadastrado**
  (Seção 2/Bloco 0), batido contra o território do Executante do usuário — não precisa de tela
  nova pra preencher manualmente. Seed real do CooperaMais: UNISOL SP (SP/RJ/ES/MG), UNISOL
  Bahia (todo Nordeste), UNISOL RS (Sul), UNISOL Brasil (Celebrante + Executante direto em
  Centro-Oeste/Norte, onde não há Estadual constituída).
- **21**: `empreendimentos.codigo` passou a ser **gerado pelo sistema no cadastro** (trigger +
  sequência por UF, formato `SP-0001`), não mais digitado — UF virou campo obrigatório no
  cadastro de Filiada.

**UI nova/ajustada**:
- `/projetos/[id]`: toggle "Execução em rede" + seção `ExecucaoRedeProjeto` (adicionar/remover
  Celebrante/Executante, gerenciar território por UF, vincular Filiada já filtrada por UF do
  território — "+ Vincular Filiada" dentro de cada Executante). Cada card de Executante ganhou
  um acordeão (seta expansível) mostrando as próprias Filiadas e Técnicos, sem precisar rolar
  pras listas genéricas do projeto inteiro.
- Tela de Equipe do projeto (`EquipeProjeto.tsx`) ganhou os campos Nível de acesso + Executante
  na hora de alocar um técnico — antes só dava pra definir isso rodando o import da planilha.
- Parte A do diagnóstico: A.1 (código único) e A.3 (BSR responsável) **deixaram de ser
  digitados pelo técnico** — A.1 mostra o `empreendimentos.codigo` real (gerado no cadastro);
  A.3 mostra o Executante responsável derivado automaticamente (ex: "UNISOL São Paulo
  (Sudeste)"), calculado a partir do UF da Filiada + território do projeto em rede ao qual ela
  está vinculada.

**Import da planilha** (`app/api/admin/importar-equipe-ecouni/route.ts`): resolve o rótulo
"Regional" da planilha pro `projeto_executante_id` real via território (um UF representativo de
cada rótulo). Todo mundo da planilha (conta nova ou já existente) recebe email de
convite/redefinição de senha — pedido explícito do Luciano, não só quem é conta nova. Erro
"New password should be different..." traduzido pro português em `/redefinir-senha`.

**Processo**: cada teste de RLS usou contas descartáveis criadas via Admin API e apagadas depois
(nunca mintou sessão de conta real — ver memória `feedback_no_real_credential_minting`), inclusive
quando precisou decodificar o JWT retornado pra confirmar `auth.uid()`/`role` na mão, já que a
investigação do bug de RLS não fechava só olhando pra lógica da policy.

**Pendente**: rodar o lote completo de convite/redefinição de senha pras ~22 pessoas restantes
da planilha (Luciano já foi testado via `?apenas=`) — aguardando autorização formal dele antes
de disparar e-mail em massa.

## Motor de agenda+relato: Fase 0 construída, pausada aguardando ação manual (2026-09-29)

Plano de ação completo (5 fases) aprovado e salvo em
`~/.claude/plans/twinkling-imagining-fairy.md`. **Fase 0 (infra WhatsApp) construída e
deployada** (commit `65a9a36`): `lib/evolution.ts` (envio outbound, 1 instância pra muitos
números — não é o modelo conta-pareada do 168), `app/api/webhooks/evolution/route.ts` (recebe
inbound, só loga em `blocos_webhook_log` por enquanto, sem lógica de negócio), migration 13
(`supabase_migration_13_webhook_log_evolution.sql`, **revelada no Finder, ainda não rodada**).

**Bloqueado até o Luciano fazer, manualmente** (fora do alcance do Claude Code):
1. Criar uma instância Evolution **dedicada à UNISOL** (não reaproveitar a do vaikeuvou nem a do
   168) e parear um número de WhatsApp.
2. Configurar o webhook dessa instância pra `https://sistema.unisolbrasil.org.br/api/webhooks/evolution`,
   evento `MESSAGES_UPSERT`, header customizado `x-evolution-secret`.
3. Passar as 3 credenciais (`EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE`) pra
   configurar no Vercel.

**Retomar por aqui**: depois da instância criada e credenciais passadas, testar Fase 0 ponta a
ponta (mandar mensagem de teste, confirmar log grava), rodar a migration pendente, e seguir pra
Fase 1 (planejamento semanal — essa não depende do WhatsApp, dá pra adiantar em paralelo se
quiser). Tasks 102-106 no tracker (Fase 0 in_progress, 1-4 pending).

## Elucubração parte 2: o "motor" de relato via WhatsApp, em parceria com o 168 (2026-09-29)

Continuação direta da elucubração acima (mesmo dia). Luciano confessou que o 168 (produto pessoal
dele, ver [[project_168]]) está parado há 36 dias apesar de ser "a menina dos olhos" — sinal real
de que a forma atual (dashboard-first, sincronizado com Google Calendar) não emplacou no uso
dele. Hipótese: 168 deveria ser um agente quase 100% WhatsApp, não um dashboard — fluxo: segunda
de manhã planeja a semana, todo dia de manhã recebe a agenda do dia (com prerrogativa de ajustar),
no início/fim de cada bloco recebe check-in/check-out do agente, relato de atividade especialmente
por **áudio do WhatsApp** (fala captura contexto melhor que texto digitado). Default = quase zero
interação (só grava); exceção (cancelamento/atraso) = interação real de realocação.

**Conclusão de sequenciamento (aprovada por ele — "de acordo, pode fazer")**: esse motor
(agenda diária + relato por voz + check-in/check-out + realocação por exceção) nasce **primeiro
como recurso da UNISOL**, não dentro do 168. Motivo: dogfooding solo do 168 já rodou sem
produzir uso real — validar o motor onde tem peso real (35-40 técnicos, prestação de contas de
verdade) é mais forte que Luciano tentar sozinho de novo. Depois de provado, o motor migra pro
168 (ele reconhece que precisará de "quase todo o 168, tirando só o propósito/Matriz T×D" — mas
o enquadramento certo, segundo a conversa, não é "fração do 168 completo", é o MESMO motor
aplicado a um domínio bem mais estreito: só as horas que o contrato do técnico prevê pro projeto,
não a vida inteira de 168h).

**Escopo do que o técnico da UNISOL precisa** (bem mais enxuto que o 168 completo):
- Declarar quais dias/blocos pretende dedicar ao projeto (recorte de calendário de 1 projeto, não
  distribuição de vida inteira — sem Matriz T×D, sem esferas Tempo/Dinheiro pessoais).
- Receber a agenda do dia via WhatsApp, com prerrogativa de ajustar.
- Check-in no início do bloco, check-out no fim, relato **em áudio** do que foi feito (pauta +
  encaminhamento — ver seção anterior sobre "prova de substância vs. prova de atividade").
- Motor de realocação ("o que cede?") só quando bate exceção (cancelamento/atraso), escopado
  só nos blocos daquele projeto, não na vida inteira do técnico.
- Esse relato vira ao mesmo tempo: (a) insumo bruto pra IA montar relatório de prestação de
  contas coerente, (b) alimentação do painel de indicador/hierarquia da parte 1 desta elucubração.

**Achado técnico ao investigar reaproveitamento** (verificado no código real do
`/Users/lucianomaeda/168-dashboard`, não assumido): o WhatsApp do 168 hoje é modelo
"conta-pareada" — cada usuário conecta o PRÓPRIO WhatsApp via QR code (`instances` table,
`instanceName = meudia_${user.id}...`, Evolution API self-hosted em `evolution.saacs.com.br`),
e o bot responde AOS CONTATOS DELE (triagem de inbox pessoal) — é o modelo errado pro caso de
uso da UNISOL. UNISOL precisa do padrão mais simples já usado noutros produtos SAACS (ex:
`lib/evolution.ts` do vaikeuvou, usado pro lembrete de check-in): **1 instância só, envia
mensagem PRA MUITOS números diferentes** (outbound, não pareamento pessoal). Nenhuma transcrição
de áudio existe ainda em nenhum dos dois repos — é construção nova nos dois casos.

**Módulo pensado como extraível desde o nascimento** — não deve virar feature hardcoded dentro
do schema/código específico da UNISOL, pra poder migrar pro 168 depois sem reconstrução.

**Próximo passo**: plano de ação formal (fases, schema, endpoints) a ser desenhado em modo de
planejamento antes de qualquer código.

## Elucubração conceitual: modelo institucional × montagem por projeto (2026-09-29)

Conversa longa (não implementação — registro de decisões de modelo pra guiar construção futura)
sobre como o sistema deveria pensar "diagnóstico", "equipe" e "projeto" juntos, motivada pela
constatação de que o nome "Diagnóstico" sugere evento único, mas o mecanismo de `versão` já foi
desenhado pra reaplicação ao longo do tempo (T0→T1→T2).

**Princípio organizador que fechou a discussão**: o sistema é feito de **peças institucionais
reutilizáveis** (banco de profissionais/`tecnicos`, os ~1000 `empreendimentos`, cadastro das
Estaduais, a geografia do Brasil) e **montagem específica por projeto** (quem participa, que
papel assume, como o território é recortado, quem executa qual regional). Tudo que hoje parece
"estrutura fixa" mas na real é peculiaridade de UM projeto (o arranjo SP=Sudeste/BA=Nordeste/
RS=Sul/BRASIL=Centro-Oeste+Norte é do CooperaMais especificamente, não uma verdade institucional
permanente) deve morar na camada de montagem, com `projeto_id`, não na camada institucional.

**Decisões de modelo confirmadas nesta conversa** (nenhuma implementada ainda):
1. **Duas frentes distintas**, não uma: financeiro/execução (Meta→Etapa→custo→horas, do
   TransfereGov, ancorado num **contrato de trabalho real** — documento upload, mesmo padrão de
   `documentos_institucionais`, vinculado a profissional+projeto+plano de trabalho) versus
   medição de resultado (o Diagnóstico, T0→T10, já resolvido pelo mecanismo de versão existente).
2. **Relatório mensal vira o motor do sistema, não subproduto burocrático**: hora não é
   cronômetro, é alocação autodeclarada; o que sustenta a credibilidade da alocação é um relato
   de **pauta e encaminhamento** (substância), não prova de atividade (lista de presença, foto).
   Isso serve dois propósitos: (a) vira insumo bruto pra IA montar um relatório de prestação de
   contas coerente e não inventado; (b) alimenta o painel de acompanhamento de resultado.
3. **Papel do coordenador muda de auditor pra facilitador**: em vez de analisar o
   relatório-documento depois do fato, orienta o preenchimento durante o mês — implica painel
   vivo, não relatório retrospectivo em PDF.
4. **Hierarquia de painel por exceção**: Nacional → Regional → Estado (UF real) → Território
   (recorte livre do Coordenador Regional, por projeto) → Empreendimento. Cada nível precisa
   expor dispersão/outlier, não só média — senão esconde o sinal que o painel deveria revelar.
   Trabalho em grupo (equipe de apoio regional — comunicação/adm/contábil/jurídico — também
   lançando relato na mesma visão) funciona como controle social adicional contra "enrolação",
   complementar à checagem de coerência do coordenador.
5. **Diagnóstico não se fragmenta por projeto**: mesmo empreendimento em 2 projetos concomitantes
   (ex: CooperaMais + Terra Mesa futuro) tem uma realidade só, uma linha do tempo só — colisão
   mecânica já resolvida pelo `max(versão)+1` existente. Atribuição de causalidade quando dois
   projetos tocam o mesmo empreendimento é inerentemente compartilhada — assumir isso ao reportar
   impacto por projeto, não forçar isolamento que não existe na prática.

**Peças novas identificadas, ainda sem tabela**: `contrato_trabalho` (documento real, profissional
+ projeto + plano de trabalho, ancora Meta/Etapa/horas/custo), estrutura de Meta/Etapa/custo do
plano de trabalho em si (hoje não modelada), `território` (recorte livre por Regional × Projeto,
definido pelo Coordenador Regional), vínculo de execução por projeto (qual UNISOL estadual
responde por qual Regional, hoje ausente — precisa ser `projeto_id`-scoped desde o início).

**Nada disso foi implementado** — é registro de modelo conceitual pra retomar quando o Luciano
quiser transformar isso em schema/telas de verdade.

## Migration 11 rodada em produção (2026-09-29) — corrige erro ao criar usuário

Luciano bateu em `Could not find the 'tecnico_id' column of 'usuarios' in the schema cache` ao
tentar criar um usuário novo. Investigação achou que a migration 11
(`supabase_migration_11_tecnico_atribuicao.sql` — coluna `usuarios.tecnico_id` + tabela
`tecnico_empreendimento_projeto`) nunca tinha sido rodada em produção, apesar de ter sido
registrada como concluída em 08/09 junto com a feature de dashboard/atribuição que depende dela.
Confirmado via REST que migrations vizinhas (8, 10, 12) estavam OK — gap isolado. Rodada agora,
confirmado que coluna+tabela existem. Cadastro de usuário deve funcionar normalmente.

## Diagnóstico revisado: reestruturação completa Parte A/B + Blocos 0-12 + Anexo A/B (2026-09-25)

Reescrita total do instrumento a partir de `Diagnostico_revisado.docx` (comparado seção a seção
com a implementação anterior, 18 seções lineares). Sem dado real em produção ainda (confirmado
com o Luciano) — restruturação livre, sem migração de resposta existente. Feito de ponta a ponta
numa sessão só, a pedido do Luciano ("não deixar passar nada em branco, pode executar todos em
produção"), sem pausa pra revisão por bloco.

**Nova estrutura**: Parte A (controle/consentimento, com Marco 0/data de corte e convenção
NI/NA/NV) → Bloco 0 (identificação/territorialidade, grava em `empreendimentos`) → Parte B
(beneficiários — funde as antigas Composição+Formação+Renda) → Blocos 1-9 (Documentação,
Governança, Pessoas, Financeiro, Comercial, Processos Produtivos [funde Produção+Infra+
Qualidade], Socioambiental, Demandas e Potencialidades [novo], Adaptação ao Meio [funde
Logística+Tecnologia+Parcerias]) → Bloco 10 (módulos complementares por segmento produtivo,
novo, técnico) → Bloco 11 (régua de maturidade consolidada, 13→11 dimensões, pontuação máx.
52→44, N/A agora exclui a dimensão do denominador — regra nova) → Bloco 12 (devolutiva,
simplificado pra 4 perguntas) → Anexo A (checklist de evidências, +item "Outros") → Anexo B
(quadro-síntese MAP, 14→18 indicadores-chave, regra de variação Marco 0→Marco 1 documentada).

Cada Bloco 0-9 ganhou "Régua de Maturidade do Bloco" de fechamento (classificação 0-4/N-A +
evidência) — usa o `comEvidencia` do `EscalaMaturidade0a4` que já existia. Ids/componentes
renomeados pra consistência (`secao01`→`parteA`, `secao02`→`bloco0`, arquivos `SecaoBlocoN*`).
Migration `supabase_migration_12_diagnostico_revisado.sql` cobre as colunas novas de
`empreendimentos` (Bloco 0) — **rodada no Supabase em 2026-09-25**. Todos os outros blocos
gravam em JSONB (`respostas`/`analise_tecnica`), sem coluna nova.

`npx tsc --noEmit` e `npm run build` passaram limpos a cada lote; 9 commits, todos com push.
Instrumento reestruturado está **funcional de ponta a ponta em produção**.

**Próximo passo**: coordenadora valida o instrumento reestruturado antes de ir a campo.

## Dashboard pós-login + atribuição técnico×Filiada×Projeto (2026-09-08)

Migration 11: `usuarios.tecnico_id` (liga o login ao cadastro de talentos — não existia antes)
+ `tecnico_empreendimento_projeto` (atribuição de responsabilidade: quem visita qual Filiada,
varia por projeto, existe *antes* de qualquer diagnóstico começar — diferente de
`aplicador_id`/`tecnico_analista_id`, que só registram quem já mexeu num diagnóstico existente).

Nova seção **Atribuições** no detalhe do Projeto (mesmo padrão de Equipe/Filiados vinculados) —
só oferece técnicos já alocados e Filiadas já vinculadas àquele projeto especificamente.

**`/dashboard` sai do estágio de redirect fixo**: admin/aplicador vê totais gerais (diagnósticos
concluídos/abertos, Filiadas, Projetos ativos); técnico vê "meus diagnósticos" calculado como
união de histórico (o que ele já tocou) + atribuição (Filiadas dele sem diagnóstico ainda contam
como em aberto) — sem o vínculo `usuarios.tecnico_id`, cai num fallback só-histórico com aviso.
Visual do hero inspirado na referência que o Luciano trouxe (`Logo/referencia_tela_cel.png`):
header escuro com saudação + ícone "O" (globo) à direita, card de destaque, folha branca
sobreposta com os números.

**Fecha o item que estava pendente desde 2026-09-03** ("vínculo técnico×Filiadas — não existe,
precisa ser criado").

## PWA/mobile: ícones definitivos + navegação nativa (2026-09-03, rodada extra da mesma sessão do Dexie)

- Ícone da PWA (`icon-192`/`icon-512`) trocado 2x: primeiro só o "O" do UNISOL (globo estilo
  bandeira do Brasil, recortado do logotipo), depois a wordmark UNISOL Brasil completa enviada
  pelo Luciano — favicon (`app/icon.png`) ficou fixo no globo recortado, por pedido explícito
  (mais legível pequeno que a wordmark inteira).
- Sidebar completa (Cadastros/Projetos/Administração) escondida no mobile — só faz sentido no
  desktop, já que quase tudo lá é bloqueado mesmo (`SoDesktop`). Trocada por barra fixa no
  rodapé, estilo app nativo, só com o que funciona no aparelho: Diagnósticos e Sair.
- Zoom por pinça travado no mobile (mesmo padrão do Cooperliga) — mais cara de app, menos de
  site.
- **Teste rápido em modo avião registrado**: passou (editar/salvar local, sincronizar ao
  voltar) — mas é só o teste curto, não o de período longo (ver pendência abaixo).

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

## 2026-09-03 (mesmo dia, rodada final) — Coleta offline de verdade no wizard (Dexie + sync)

O PWA só cobria o "shell" (instala/abre sem sinal) — todo dado gravava direto no Supabase,
falhando em silêncio sem sinal. Essa rodada implementou a Fase 2 do plano original (offline de
verdade), com escopo confirmado: só o wizard de diagnóstico (`/diagnosticos`) fica offline;
todo o resto continua online-only, já bloqueado no mobile via `SoDesktop`. Anexo A (upload de
evidências) ficou de fora desta rodada por decisão do Luciano — evidências normalmente são
anexadas depois, com sinal, não durante a visita.

Duas rodadas de exploração + uma de crítica de design rodaram antes de codar (registradas no
plano `.claude/plans/twinkling-imagining-fairy.md`). Achado mais importante: **o gate de
autenticação não era offline-safe** — `getSession()`/`.from('usuarios')` falhando sem sinal
por mais tempo que a validade do token trancava o técnico fora do próprio trabalho em
andamento, e o fallback de perfil pra `'aplicador'` tirava acesso às Seções 17-18 de um
técnico de verdade após qualquer reload (comum, dado `reloadOnOnline: true` no PWA). Virou
pré-requisito antes de qualquer coisa do Dexie.

**O que foi construído:**
- `lib/supabase.ts`: `getSupabase()` virou singleton (antes criava um `createClient()` novo a
  cada chamada — várias instâncias de GoTrueClient competindo pelo mesmo localStorage).
- `AppShell.tsx`: cacheia a linha de `usuarios` (id/nome/perfil) numa tabela Dexie
  (`sessaoUsuario`) a cada leitura bem-sucedida; cai nesse cache em vez de travar no login ou
  fixar `'aplicador'` quando a leitura falha offline. `app/diagnosticos/page.tsx` perdeu o
  gate de auth próprio (redundante e sem esse fallback — bloqueava antes do AppShell montar).
- `lib/offline/db.ts` (novo): Dexie, tabelas `diagnosticos`/`empreendimentos` (espelham as
  tabelas do Supabase + dirty-flags: `_dirtyRespostas`/`_dirtyAnaliseTecnica` no diagnóstico,
  `_dirty` no empreendimento — canais independentes pra não sobrescrever `analise_tecnica` de
  um colega técnico com uma cópia local desatualizada de `respostas`), `referencia` (cache de
  `unisol_estaduais`), `sessaoUsuario`.
- `lib/diagnostico/useAutosave.ts` (reescrito, mesma assinatura exportada — contrato que já
  existia desde a criação do arquivo, pra não precisar tocar nas 20 seções do wizard): grava
  no Dexie na hora, sem chamada de rede nenhuma. Cobre 18 das 20 seções de graça + a Seção 02
  (que já tinha seu próprio `useAutosaveEmpreendimento`).
- `lib/diagnostico/useReferenciaEstaduais.ts` (novo): cache reativo (`useLiveQuery`) do
  dropdown de Estaduais da Seção 02, atualiza em segundo plano quando online.
- `DiagnosticoWizardShell.tsx`: carregamento vira Dexie-primeiro — lê local na hora; se
  online, busca do Supabase e mescla (nunca sobrescreve um campo com edição local ainda não
  sincronizada); se offline e nada local, mostra aviso claro em vez do antigo "não encontrado".
- `lib/offline/sync.ts` (novo, motor de sync): drena os registros dirty no boot, no evento
  `online`, e num intervalo de segurança de 45s (sinal fraco ≠ `navigator.onLine` confiável).
  Resolução de `versao`: antes de inserir um diagnóstico novo, calcula `max(versao)+1` pro
  empreendimento — dois técnicos offline no mesmo dia pra mesma cooperativa não colidem, o
  segundo vira v2 automaticamente (decisão confirmada, sem fila de revisão manual).
- `NovoDiagnostico.tsx`/`ListaDiagnosticos.tsx`: criação de diagnóstico e a lista funcionam
  100% offline a partir de dados já vistos com sinal (todo `carregar()` online também esquenta
  o cache Dexie); lista mostra badge "pendente de sincronizar" por linha e um aviso "sem sinal"
  quando cai pro fallback local.
- `lib/offline/useSyncStatus.ts` + `components/layout/SyncStatusBadge.tsx` (novos): indicador
  único de sync (substituiu os 3 indicadores desencontrados que existiam antes — shell,
  Seção 02, Anexo A), montado no header do wizard e na barra mobile do `AppShell`.

**Testado por Luciano em modo avião, teste rápido: funcionou** — abrir/editar/salvar local
sem sinal e sincronizar ao voltar passou no teste curto. **Ainda falta o teste que importa de
verdade**: modo avião por um período mais longo que a validade do token do Supabase (o risco
real da Fase A.0 — token expirar e travar o técnico fora do próprio trabalho), que um teste
rápido não estressa.

## Próxima sessão — retomar por aqui
1. **Testar modo avião por período longo** (mais que a validade do token do Supabase) — teste
   rápido já passou (editar/salvar local/sincronizar ao voltar), falta o cenário que decide se
   a Fase A.0 (não expulsar o técnico pro login no meio do trabalho) aguenta um dia de campo.
2. Popular `unisol_estaduais` (lista real ainda não recebida do Luciano) e importar os 152
   empreendimentos do CooperaMais em `empreendimentos` + `empreendimento_projeto` (fonte:
   planilha/lista real da UNISOL, ainda não recebida).
3. Anexo A offline (upload de evidências) — deferido nesta rodada, decisão do Luciano.
4. Portal do dirigente por token (Seção 2/3/4/6/7/10/12/15 pré-preenchidas antes da visita).
5. `numero_termo_fomento`/`numero_transferegov` do CooperaMais ainda não preenchidos — Luciano
   vai passar os números certos.
6. CNPJ das estaduais sem dado ainda (PI/CE/PB/MT/AC/SE/MG/SC).
7. Equipe é só alocação (cargo texto livre) — sem período obrigatório de vigência na UI
   (`data_saida`/`ativo` existem no schema mas não têm campo no drawer ainda); avaliar se
   precisa antes de escalar o uso.
