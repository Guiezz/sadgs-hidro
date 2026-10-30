# Repaginação visual do SADGS — Design

- **Data:** 29/10/2026
- **Origem:** canvas Claude Design "SADGS — Repaginação visual" (https://claude.ai/artifact/9o2tmE8gHq2xdHV8HG6n6x), 11 artboards.
- **Repositórios afetados:** `dashboard-front` (principal) e `dashboard-api` (ficha técnica).
- **Branch:** `feat/repaginacao-visual` a partir de `dev`, em cada repositório.

## 1. Objetivo e critérios de sucesso

Modernizar a interface do `dashboard-front`, melhorando UX e acessibilidade, implementando **fielmente** o design — incluindo as funcionalidades novas que ele introduz.

Pronto quando:

1. As 10 telas desenhadas batem visualmente com seus artboards em 1440 px e funcionam na largura de celular (sem rolagem horizontal da página).
2. Nenhuma violação `serious`/`critical` do axe em cada tela; navegação completa por teclado, foco visível, skip link funcional.
3. Texto com contraste ≥ 4,5:1 (≥ 3:1 em ≥ 24 px); estado de seca nunca comunicado só por cor.
4. Nenhuma funcionalidade atual perdida (incluindo Admin, Relógio 3D, login/logout, alteração de status de ações).
5. `npm run lint`, `npm run build` e `npm test` passam; testes Go da API passam.

## 2. Decisões tomadas

| Tema | Decisão |
|---|---|
| Escopo | Tudo do design, incluindo funcionalidades novas e ajuste na API |
| Dark mode | **Removido** (sem tema escuro, sem toggle, sem `next-themes`) |
| Login, Admin, Relógio 3D | Não redesenhados; herdam tokens, tipografia, componentes e shell |
| Ficha técnica | Novos campos opcionais na API, extraídos das descrições existentes; linha sem dado não aparece |
| Abordagem | Tokens primeiro → componentes compartilhados + shell → telas uma a uma |
| Sidebar | Mantém o recolhimento no modo só-ícones |
| Infográfico de Impactos | Mantido, atrás do botão "Ver infográfico" (Dialog) |
| Rotas | Inalteradas (`/estado-de-seca` passa a ser rotulada "Monitoramento") |
| Testes | Vitest + Testing Library apenas para lógica pura nova |

## 3. Fundamentos

### 3.1 Tokens (`src/app/globals.css`)

Mantêm-se os nomes semânticos do shadcn para que as primitivas de `components/ui` herdem a nova paleta sem reescrita.

| Token | Valor | Uso |
|---|---|---|
| `--background` | `#FAF5EF` | fundo da aplicação |
| `--foreground` | `#2A1405` | texto (16,1:1) |
| `--card` / `--popover` | `#FFFFFF` | superfícies |
| `--card-foreground` / `--popover-foreground` | `#2A1405` | |
| `--border` | `#EADBC8` | bordas de cards (substitui sombras) |
| `--input` | `#D9C2A8` | bordas de controles |
| `--muted` | `#F5EBDF` | hover / fundos sutis |
| `--muted-foreground` | `#5C3317` | texto secundário (10:1) |
| `--label` (novo) | `#7A4E2E` | rótulos (6,5:1) |
| `--primary` | `#F99100` | **só preenchimento** (botão primário, item ativo) |
| `--primary-foreground` | `#2A1405` | texto sobre laranja |
| `--link` (novo) | `#A34E00` | links, sobretítulos (5,3:1); hover `#7A3A00` |
| `--water` (novo) | `#1D6A8A` | volume, série principal de gráficos |
| `--ring` | `#1D6A8A` | foco |
| `--secondary` | `#3A1503` | botão "escuro" |
| `--secondary-foreground` | `#FFFFFF` | |
| `--accent` | `#FDE6D3` | hover de pills |
| `--accent-foreground` | `#2A1405` | |
| `--destructive` | `#C0392B` | |
| `--sidebar` | `#3A1503` | menu |
| `--sidebar-foreground` | `#E9D3BD` | links do menu |
| `--sidebar-muted` (novo) | `#D9B99A` | rótulos de grupo do menu |
| `--sidebar-primary` | `#F99100` | item ativo |
| `--sidebar-primary-foreground` | `#2A1405` | |
| `--chart-1..5` | `#1D6A8A`, `#F99100`, `#3A1503`, `#E5B000`, `#7A4E2E` | Recharts via `var()` |

**Estados de seca** — substituem os 5 tokens antigos (`atencao`, `emergencia`, `colapso` deixam de existir):

| Estado | `--estado-*-text` | `--estado-*-bg` | `--estado-*-dot` |
|---|---|---|---|
| Normal (`normal`) | `#1F5C34` | `#E3F1E6` | `#3E8E5A` |
| Alerta (`alerta`) | `#6E4D00` | `#FBF0CC` | `#E5B000` |
| Seca (`seca`) | `#8F3D08` | `#FDE6D3` | `#E8731A` |
| Seca Severa (`severa`) | `#8C1F16` | `#F9DCD8` | `#C0392B` |

Raios: `--radius: 10px` (controles); cards usam 16–20 px (`rounded-2xl` / `rounded-[20px]`). Sombras de card removidas (`--card-shadow*` saem); hover de cards clicáveis usa borda `#E0B98F` + sombra suave + `translateY(-2px)`.

### 3.2 Tipografia

- `next/font/google`: **Inter** (400/500/600/700) → `--font-sans`; **Bricolage Grotesque** (500/700/800, eixo `opsz`) → `--font-display`.
- Escala: títulos de página `font-display` 800, 44 px (hero 56–60 px), `letter-spacing -0.02em`, `line-height 1.05`; números de KPI `font-display` 700, 32–40 px, `tabular-nums`; título de card Inter 700 18 px; corpo Inter 400 15–16 px, entrelinha 1,6, `max-width ~68ch`; sobretítulo (`.eyebrow`) Inter 700 13 px, caixa alta, `0.08em`, cor `--link`.

### 3.3 Acessibilidade global

- `<html lang="pt-BR">`; skip link "Pular para o conteúdo" → `main#conteudo`.
- `*:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px }`.
- `@media (prefers-reduced-motion: reduce)` desliga transições/animações; framer-motion envolto em `<MotionConfig reducedMotion="user">`.
- Alvos de toque ≥ 44 px (botões 48 px, selects/inputs 40–44 px).
- Controles reais (`button`, `a href`, `input` + `label`); botões só-ícone com `aria-label`; SVG decorativo `aria-hidden`.
- Links externos com ícone e texto oculto "(abre em nova aba)".

### 3.4 Remoção do dark mode

Remover: bloco `.dark` e `@custom-variant dark` do CSS, `src/components/theme-provider.tsx`, `src/components/layout/ThemeToggle.tsx`, dependência `next-themes`, uso de `useTheme` no `components/ui/sonner.tsx` (tema fixo `light`) e no `components/dashboard/InteractiveMap.tsx` (camada de tiles fixa na versão clara), e todas as classes `dark:` em `src/` (~33 ocorrências).

## 4. Shell

### 4.1 Estrutura

- `src/app/layout.tsx` volta a ser **server component**: `metadata`, fontes, `<html lang="pt-BR">`, e renderiza `<AppShell>{children}</AppShell>`.
- `src/components/app/AppShell.tsx` (client): `AuthProvider` → `ReservoirProvider` → `MotionConfig`; em `/login` renderiza só `children`; nas demais, `SkipLink` + `Sidebar` + coluna (`Header` + `main#conteudo`).
- `src/components/app/nav-items.ts`: **fonte única** da navegação (hoje duplicada entre `Header.tsx` e `Sidebar.tsx`):
  - Início `/`
  - **Hidrossistema:** Visão Geral `/visao-geral`, Monitoramento `/estado-de-seca`, Implementação `/implementacao-planos-de-seca`, Planos de Ação `/planos-de-acao`
  - **Análises:** Impactos `/impactos`, Usos da Água `/usos-agua`, Balanço Hídrico `/balanco-hidrico`, Simulador `/simulacao`
  - **Institucional:** Responsáveis `/responsaveis`
  - Admin `/admin` (somente autenticado)
  - Relógio 3D `/relogio-3d` não entra no menu; é acessado pelo Monitoramento.

### 4.2 Sidebar

- Fundo `--sidebar`, largura 248 px; topo com logo (`public/logos/logo-sadgs.png`) + "SADGS" (display 800, 20 px) + "Apoio à Decisão em Secas".
- `nav aria-label="Seções"`, grupos com rótulo (11 px, caixa alta, `--sidebar-muted`).
- Item: ícone lucide 18 px + texto 14 px, `padding 10px 12px`, raio 8 px; ativo com fundo `--sidebar-primary`, texto `--sidebar-primary-foreground`, `aria-current="page"`.
- **Modo só-ícones** (recolhido): largura ~72 px, rótulos de grupo escondidos, cada item com `aria-label` e `Tooltip` com o nome; botão de recolher com `aria-expanded` e `aria-controls`. Estado persistido em `localStorage` (try/catch).
- Mobile (< `md`): sidebar oculta; botão de menu no header abre `Sheet` com a mesma navegação (`nav-items.ts`), fecha ao navegar.

### 4.3 Header

- Fundo `--card`, borda inferior `--border`, `padding 14px 40px` (16 px no mobile), quebra em duas linhas quando estreito.
- Esquerda: botão de menu (mobile) e `Breadcrumb` (`nav aria-label="Você está em"`, `ol`, item atual com `aria-current="page"`), derivado de `nav-items.ts`.
- Direita: `<label for>` "Hidrossistema" visível + `ReservoirSelector` restilizado (select 40 px, min 220 px); botão Entrar/Sair (mantém `useAuth`).
- Toggle de tema removido.

### 4.4 Componentes compartilhados (`src/components/app/`)

| Componente | Responsabilidade |
|---|---|
| `SkipLink` | link "Pular para o conteúdo" visível no foco |
| `PageHeader` | `eyebrow`, `h1`, subtítulo, slot de ação à direita |
| `SectionCard` | `section` com `aria-labelledby`, card branco, borda, raio 20 px, título 18 px |
| `StateBadge` | estado (`Normal`/`Alerta`/`Seca`/`Seca Severa`) → pill com ponto + texto; aceita string da API e normaliza |
| `KpiCard` | `div` dentro de `dl`: `dt` rótulo, `dd` número tabular + unidade, `dd` nota opcional, slot (barra/link) |
| `SegmentedControl` | `role="group"` + `button aria-pressed` |
| `Breadcrumb` | ver 4.3 |
| `ChartFigure` | `figure` + legenda HTML (`ul aria-label="Legenda"`) + `figcaption`; recebe `ariaLabel` resumo para o gráfico |
| `EmptyState` | ícone, título, texto, ação opcional |
| `ExternalLink` | ícone + "(abre em nova aba)" oculto |

`src/lib/drought-state.ts`: mapeamento estado → chave de token (`normal|alerta|seca|severa`) e ordem dos estados; usado por `StateBadge`, tabs, gráficos e `ReservoirScene`.

## 5. Telas

Cada tela segue `main` com `max-width: 1240px`, `padding 36px 40px 80px`, `gap 24px`, e começa com `PageHeader`. Carregamento usa `Skeleton` no formato do conteúdo; sem reservatório selecionado usa `EmptyReservoirState` restilizado; erro usa `EmptyState` com "Tentar novamente".

### 5.1 Início `/` (artboard Início)

- Hero: selo "Gestão Proativa de Secas · Ceará", h1 "Decisões melhores antes que a seca chegue.", parágrafo; formulário "Comece escolhendo um hidrossistema" com select rotulado + "Ver monitoramento" (primário) + "Visão geral" (ghost); aviso "O primeiro carregamento pode levar até 1 minuto enquanto o servidor inicia." enquanto `reservatorios` carrega.
- Lado direito: logo SADGS + `dl` com Hidrossistemas (`reservatorios.length`), Anos de dados (107, constante 1911–2017), Instituições (7, constante).
- "Ferramentas para a governança hídrica": 7 cards-link (destaque maior para Monitoramento).
- "Hidrossistemas monitorados": contador + pills de todos os reservatórios; clicar seleciona no contexto e navega para `/estado-de-seca`.

### 5.2 Visão Geral `/visao-geral`

- `PageHeader` (nome; "Açude no Rio X · Município – CE · Bacia", montado só com o que existir) + link-cartão com `StateBadge`, volume atual (hm³ · %) e "Abrir monitoramento".
- Foto (`url_imagem`) em `figure` com `alt` descritivo e `figcaption` (ano de construção quando houver).
- Duas colunas: "Sobre o reservatório" (descrição, parágrafos preservados) e **Ficha técnica** (`dl`): Capacidade, Área de drenagem, Construção (ano · construtor), Rio barrado, Código FUNCEME, Coordenadas (formato GMS a partir de `lat`/`long`); "Municípios atendidos" em lista. Linhas sem dado são omitidas.
- "Localização": mapa Leaflet atual, botões de zoom acessíveis, link externo "Abrir no OpenStreetMap".

### 5.3 Monitoramento `/estado-de-seca`

- `PageHeader`: eyebrow "Monitoramento do estado de seca", nome, "Município – CE · Última leitura em dd/mm/aaaa"; ação "Relógio da Seca 3D" (selo "Novo") → `/relogio-3d`.
- "Estado atual": `StateBadge` grande, legenda dos 4 estados, metas do mês corrente (de `gatilhos-pgps`).
- 4 `KpiCard`s: **Volume atual** (hm³ + % da capacidade + barra), **Variação em 7 dias** (de `/history`; texto "Queda/Alta média de X hm³ por dia"), **Tempo no estado atual** (`diasDesdeUltimaMudanca` + distância em p.p. da meta acima/abaixo), **Medidas ativas** (`medidasRecomendadas.length` + link para Implementação).
- "Volume comparado com as metas": `SegmentedControl` **1 ano / 5 anos / 10 anos / Tudo** (padrão 10 anos) filtrando no cliente os dados de `/dashboard/volume-chart`; `ChartFigure` com legenda Volume/Meta 1/2/3; `<details>` "Entenda as metas".
- "Histórico recente": tabela com `caption`, `th scope="col"`, colunas Data / Estado / Volume (hm³) / Variação (diferença dia a dia); paginação atual mantida; **"Baixar CSV"** gera CSV (`;` separador, vírgula decimal, BOM UTF-8) com todo o histórico carregado.
- O `DroughtGauge` atual é substituído pelo bloco "Estado atual" (componente fica sem uso e é removido).

### 5.4 Implementação `/implementacao-planos-de-seca`

- Faixa de resumo: estado atual + contadores (medidas recomendadas, ações em andamento, concluídas).
- Tabs por estado (`role="tablist"`, setas do teclado via Radix Tabs), o atual marcado "· atual".
- Lista ordenada de medidas: número, título, contagem de ações, 5 primeiras ações + botão "Ver mais N ações" (`aria-expanded`), barra "X de N em andamento".
- Aside "Situação das ações": tabs Em andamento (n) / Concluídas (n); `EmptyState` quando vazio. Fluxo de alteração de status (autenticado) preservado.

### 5.5 Planos de Ação `/planos-de-acao`

- `form role="search"`: campo "Buscar ação" (filtra no cliente por ação, descrição e responsáveis) + 4 selects rotulados (Estado de seca, Tipo de impacto, Problema, Classe da ação) alimentados por `/action-plans/filters`.
- Chips de filtros ativos com botão remover (`aria-label="Remover filtro …"`) e "Limpar filtros".
- "Resultados" com contador `aria-live="polite"`; cada plano é um `article`: título, lista de itens (5 + "Ver mais N itens"), `dl` com Classe da ação (pills) e Responsáveis (até 5 pills + "+N").
- Paginação acessível (`nav aria-label="Paginação"`, `aria-current="page"`, anterior/próxima com `aria-label`).

### 5.6 Impactos `/impactos`

- Bloco escuro (`--secondary`) "Conte como a seca afeta o seu dia a dia" com lista do que pode ser anexado e CTA externo "Responder ao formulário" (link atual `cepas.ufc.br/...`).
- "Principais impactos": 4 cards (Provisão de água, Impactos econômicos, Desafios sociais, Consequências ambientais) + botão **"Ver infográfico"** que abre `Dialog` com `public/infografico/infografico.png` (alt descritivo).
- "O contexto local": texto atual da página, com nome do reservatório em destaque.

### 5.7 Usos da Água `/usos-agua`

- `PageHeader` "Usos da água · {nome}" / "Para onde vai a água".
- 3 `KpiCard`s: Demanda em normalidade (Σ `vazao_normal`, L/s), Demanda em escassez (Σ `vazao_escassez` + "% menor"), Perdas e irregularidades (uso cujo nome contém "perdas"/"irregularidades"; nota "% da demanda em escassez").
- "Vazão por uso": ordenado por normalidade desc.; `SegmentedControl` **Gráfico / Tabela**; gráfico = barras horizontais pareadas em HTML/CSS (normalidade `--water`, escassez `--primary`), valor 0 em escassez mostra "0 — suspenso"; tabela = `table` com as mesmas colunas. Substitui `UsoAguaChartV2/Mobile/Responsive`.
- "Diagrama de usos": `url_imagem_usos` em `figure` + botão "Ampliar imagem" (`Dialog`).

### 5.8 Balanço Hídrico `/balanco-hidrico`

- "Oferta x demanda por garantia": um card por item de `ofertaDemanda` (ex.: Garantia 90/95/98%): selo **Atende** (oferta ≥ demanda) ou **Déficit**, número de folga/déficit em L/s, duas barras oferta × demanda com valores.
- "Afluência mensal x demanda": barras mensais coloridas por acima/abaixo da demanda + linha de referência da demanda; frase-resumo gerada dos dados (meses abaixo da demanda).
- "Composição da demanda": barra empilhada horizontal + lista com % (5 maiores + "Outros N usos (…)").

### 5.9 Simulador `/simulacao`

- `PageHeader` "Simulador de balanço hídrico" / "E se a seca voltar?".
- Duas colunas (formulário ~400 px, sticky em desktop; empilha no mobile):
  - Formulário: `fieldset` "Modo de simulação" com radio-cards (Cenário único / Comparação); bloco do reservatório (nome + capacidade); Volume inicial (%) com "Usar volume atual (x%)" (do summary) e dica "= x hm³"; `fieldset` Período De/Até; Demanda (m³/s) com "Usar demanda atual" (Σ demanda cadastrada) e dica; modo Comparação mantém a lista de cenários atual; botão primário "Gerar simulação".
  - Resultados (`aria-live="polite"`): antes de simular, estado "Pronto para simular" com passos 1–3; depois, os componentes atuais (`KPICards`, `MainChart`, `FNAChart`, `ResultsTable`, `HistoricalCharts`, `ScenarioKPIs`, `DemandComparisonChart`, `ComparisonTable`, `SimulationSummary`, `SimulationDetails`) restilizados com os novos tokens.
- Refatoração: estado e handlers da página (807 linhas) movidos para `src/components/simulacao/useSimulacao.ts`; a página fica com a composição.

### 5.10 Responsáveis `/responsaveis`

- `PageHeader` "Responsáveis · {nome}" / "Quem faz o plano acontecer".
- Índice `nav aria-label="Nesta página"` com âncoras para cada seção.
- Seções a partir do agrupamento atual de `/responsibles`: Créditos institucionais, Comitê de Bacia, Outros atores, Equipe de execução; pessoas em `dl` (nome → cargo), instituições em listas; seção "Financiamento e realização" com logos de `public/logos` (alt com o nome da instituição).

### 5.11 Telas fora do design

- `/login`: card centralizado sobre `--background`, logo, `label`s visíveis, erro com `role="alert"`, botão primário.
- `/admin` e `/relogio-3d`: dentro do shell, com `PageHeader`, `SectionCard`, tokens e estados (`ReservoirScene` usa `lib/drought-state.ts`). Sem mudança de layout.

## 6. Gráficos

- Cores via `var(--chart-*)` / `var(--water)` / tokens de estado; nada de hex solto nos componentes.
- Todo gráfico dentro de `ChartFigure`: legenda HTML, `figcaption` com período/fonte, `role="img"` + `aria-label` com resumo (ex.: "Volume caiu de 25,1 para 23,0 hm³ no período; acima das três metas").
- Eixos e tooltips com números em pt-BR (`toLocaleString('pt-BR')`) e `tabular-nums`.
- Animações do Recharts desligadas quando `prefers-reduced-motion`.

## 7. Backend — ficha técnica (`dashboard-api`)

- `model.Reservatorio` ganha campos opcionais: `Bacia *string`, `AreaDrenagemKm2 *float64`, `AnoConstrucao *int`, `Construtor *string`, `RioBarrado *string`, `MunicipiosAtendidos *string` (separados por `;`).
- Colunas criadas por `AutoMigrate(&model.Reservatorio{})` em `cmd/main.go` (aditivo).
- Dados: `dados_importacao/ficha_tecnica.csv` (`nome;bacia;area_drenagem_km2;ano_construcao;construtor;rio_barrado;municipios_atendidos`), extraído manualmente das 17 descrições de `identificacao.xlsx`; campo vazio quando o texto não informa. **Revisado pela equipe antes de importar.**
- Carga: novo comando `cmd/import-ficha` que lê o CSV e faz `UPDATE` por `nome` (idempotente, sem `TRUNCATE`); o seeder também lê o CSV.
- `/reservatorios/:id/identification` (`ReservatorioDetalhes`) passa a expor `capacidade_hm3`, `codigo_funceme` e os novos campos (`omitempty`).
- Testes (TDD): repository retorna os campos; controller serializa; import atualiza por nome e ignora nomes desconhecidos. Swagger atualizado.
- Front: `IdentificationData` em `src/lib/types.ts` ganha os campos opcionais.

## 8. Testes e verificação

- Adicionar **Vitest + @testing-library/react + jsdom**, script `npm test`.
- Testes unitários para lógica pura em `src/lib/` e helpers de tela: variação em 7 dias, filtro de período, geração de CSV, folga/déficit por garantia, ordenação/agrupamento "Outros N", soma de demandas, formatação GMS, normalização de estado → token, derivação do breadcrumb.
- Por tela: `npm run lint`, `npm run build`, checagem no navegador contra o artboard (1440 px e 390 px), teclado (Tab/Shift+Tab, skip link, foco visível, tabs com setas), axe sem violações `serious`/`critical`.
- Regressão funcional manual: seleção de reservatório persiste entre telas, login/logout, alteração de status de ação, simulação única e comparação, backfill do admin, Relógio 3D.

## 9. Ordem de entrega

1. Tokens, fontes e utilitárias
2. Remoção do dark mode
3. `AppShell`, `nav-items`, Sidebar (com só-ícones), Header, Breadcrumb, SkipLink
4. Componentes compartilhados + `lib/drought-state.ts` + Vitest
5. Telas: Início → Monitoramento → Visão Geral → Implementação → Planos → Impactos → Usos → Balanço → Simulador → Responsáveis
6. API da ficha técnica (+ CSV revisado) e ficha na Visão Geral
7. Login, Admin, Relógio 3D

Cada item em commits próprios, verificáveis isoladamente.

## 10. Fora de escopo

- Tema escuro.
- Redesenho de layout de Login, Admin e Relógio 3D.
- Proteção de rota server-side (`middleware.ts`) e mudanças de autenticação.
- Testes de componente/tela inteira e E2E.
- Mudanças nos endpoints além de `/identification`.
