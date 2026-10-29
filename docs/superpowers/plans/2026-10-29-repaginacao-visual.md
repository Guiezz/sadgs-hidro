# Repaginação visual do SADGS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar o design "SADGS — Repaginação visual" ao `dashboard-front` (tokens, shell, 10 telas, funcionalidades novas, acessibilidade) e expor a ficha técnica dos reservatórios no `dashboard-api`.

**Architecture:** Tokens novos mapeados nos nomes semânticos do shadcn em `globals.css`; um shell client (`AppShell`) com navegação de fonte única; componentes do app em `src/components/app/`; lógica pura nova em módulos `src/lib/*.ts` testados com Vitest; telas migradas uma a uma sem mudar rotas. No backend, campos opcionais em `model.Reservatorio`, expostos no `/identification` e carregados de um CSV por um comando idempotente.

**Tech Stack:** Next.js 15.5 (App Router), React 19.1, TypeScript strict, Tailwind CSS 4, shadcn/ui (Radix), Recharts 3, Leaflet, framer-motion, Vitest; Go 1.25 + Gin + GORM (Postgres; SQLite nos testes).

**Spec:** `docs/superpowers/specs/2026-10-29-repaginacao-visual-design.md` (neste repositório). Design de referência: https://claude.ai/artifact/9o2tmE8gHq2xdHV8HG6n6x — cada tarefa de tela cita o artboard; o executor abre o artboard correspondente e segue espaçamentos, tamanhos e textos dele.

## Global Constraints

- Todo texto de UI em pt-BR; `<html lang="pt-BR">`.
- Cores somente via tokens da spec §3.1 (nenhum hex solto em componentes, exceto `globals.css`).
- Estados de seca: exatamente `Normal`, `Alerta`, `Seca`, `Seca Severa` (chaves `normal|alerta|seca|severa`), cores da spec §3.1; sempre com texto, nunca só cor.
- Contraste de texto ≥ 4,5:1 (≥ 3:1 em ≥ 24 px). Foco: `outline: 3px solid var(--ring)` + `outline-offset: 2px`.
- Alvos de toque ≥ 44 px; botões 48 px; selects/inputs 40–44 px.
- Tipografia: Inter (corpo) e Bricolage Grotesque (display), via `next/font/google`.
- Raio `--radius: 10px` nos controles; cards 16–20 px; borda `--border` no lugar de sombra.
- Sem dark mode: nenhuma classe `dark:`, nenhum `next-themes`.
- Rotas inalteradas: `/`, `/visao-geral`, `/estado-de-seca`, `/implementacao-planos-de-seca`, `/planos-de-acao`, `/impactos`, `/usos-agua`, `/balanco-hidrico`, `/simulacao`, `/responsaveis`, `/admin`, `/login`, `/relogio-3d`.
- Números exibidos em pt-BR (`toLocaleString("pt-BR")`), KPIs com `tabular-nums`; sinal negativo exibido com `−` (U+2212); CSV usa `-` ASCII.
- `prefers-reduced-motion` desliga transições, animações do framer-motion e do Recharts.
- Branch `feat/repaginacao-visual` (já criada no front a partir de `dev`; criar a homônima no `dashboard-api` na Task 17). Commits terminam com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Reservatório sem histórico ou com um só registro** → KPIs mostram "—" e o gráfico mostra `EmptyState`, nunca `NaN`/`undefined`. (Task 7: testes `variation7d` com 0/1 registro, `KpiCard` com `value={null}`.)
2. **Troca rápida de reservatório enquanto uma requisição está pendente** → a tela mostra só os dados do último selecionado. (Task 5: teste `useReservoirQuery` descarta resposta antiga.)
3. **Estado vindo da API em grafia inesperada** (`"SECA SEVERA"`, `"seca_severa"`, `" Alerta "`, `""`, valor desconhecido) → badge correto ou neutro "Sem estado", sem quebrar. (Task 1: testes `normalizeDroughtState`.)
4. **Dias faltando na série diária** → variação em 7 dias usa o registro mais próximo anterior e divide pelos dias reais. (Task 7: teste com lacuna.)
5. **CSV aberto no Excel pt-BR e campos com `;`/aspas** → BOM UTF-8, `;` como separador, vírgula decimal, campos com `;`/`"` entre aspas. (Task 7: testes `historyToCsv`.)

---

## Checklist de verificação de tela (CV)

Referenciado por toda tarefa de tela. Uma tela só é commitada quando todos os itens passam:

1. `npm run lint` sem erros novos; `npm run build` conclui; `npm test` passa.
2. `npm run dev`, abrir a rota no navegador do app com um reservatório selecionado; comparar com o artboard em 1440 px e em 390 px (sem rolagem horizontal da página; tabelas largas rolam dentro do próprio contêiner).
3. Teclado: Tab do topo passa pelo skip link (visível), sidebar, header e conteúdo na ordem visual; foco sempre visível; tabs navegam com setas; Esc fecha Dialog/Sheet.
4. axe: injetar `https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js` na página e rodar `(await axe.run()).violations.filter(v => ["serious","critical"].includes(v.impact))` → `[]`.
5. Estados: carregando (Skeleton), sem reservatório (`EmptyReservoirState`), erro da API (desligar a rede → `EmptyState` com "Tentar novamente").
6. Funcionalidades que a tela já tinha continuam funcionando.

---

## File Structure

**Front — criar**
- `vitest.config.ts`, `src/test/setup.ts` — infraestrutura de testes.
- `src/lib/drought-state.ts` — estados, normalização, classes por token.
- `src/lib/format.ts` — números pt-BR, sinal, coordenadas GMS.
- `src/lib/monitoring.ts` — período, variação, diferenças diárias, CSV, distância a metas.
- `src/lib/water.ts` — usos, garantias, composição, afluência.
- `src/lib/text.ts` — `normalizeText`, `splitList`.
- `src/hooks/useReservoirQuery.ts` — fetch por reservatório com descarte de resposta antiga.
- `src/components/app/` — `AppShell.tsx`, `nav-items.ts`, `Sidebar.tsx`, `Header.tsx`, `MobileNav.tsx`, `Breadcrumb.tsx`, `SkipLink.tsx`, `ReservoirSelect.tsx`, `PageHeader.tsx`, `SectionCard.tsx`, `StateBadge.tsx`, `KpiCard.tsx`, `SegmentedControl.tsx`, `ChartFigure.tsx`, `EmptyState.tsx`, `ExternalLink.tsx`.
- Componentes de tela novos dentro das pastas existentes (`components/dashboard/`, `components/usos/`, `components/balance/`, `components/plans/`, `components/simulacao/`), listados em cada tarefa.

**Front — remover**
- `src/components/layout/` (Sidebar, Header, ThemeToggle, ReservoirSelector), `src/components/theme-provider.tsx`, `src/components/dashboard/DroughtGauge.tsx`, `src/components/usos/UsoAguaChart{V2,Mobile,Responsive}.tsx`.

**API — criar/alterar**
- `model/reservatorio.go`, `usecase/reservatorio_usecase.go`, `cmd/main.go`, `cmd/seeder/main.go`.
- `internal/ficha/ficha.go` + `internal/ficha/ficha_test.go` — parse e aplicação do CSV.
- `cmd/import-ficha/main.go` — comando de carga.
- `dados_importacao/ficha_tecnica.csv` — dados extraídos das descrições.

---

## Fase 1 — Fundação

### Task 1: Vitest + estados de seca

**Files:**
- Create: `vitest.config.ts`, `src/test/setup.ts`, `src/lib/drought-state.ts`, `src/lib/drought-state.test.ts`
- Modify: `package.json` (devDeps + script `"test": "vitest run"`)

**Interfaces:**
- Produces:
  - `type DroughtStateKey = "normal" | "alerta" | "seca" | "severa"`
  - `const DROUGHT_STATES: readonly { key: DroughtStateKey; label: string }[]` na ordem Normal, Alerta, Seca, Seca Severa
  - `normalizeDroughtState(raw: string | null | undefined): DroughtStateKey | null`
  - `droughtLabel(key: DroughtStateKey): string`
  - `droughtClasses(key: DroughtStateKey | null): { text: string; bg: string; dot: string }` — classes Tailwind `text-estado-<key>-text`, `bg-estado-<key>-bg`, `bg-estado-<key>-dot`; `null` → `text-muted-foreground`, `bg-muted`, `bg-label`

- [ ] **Step 1: Instalar dependências**

Run: `npm i -D vitest@3.2.4 @vitejs/plugin-react@4.7.0 jsdom@26.1.0 @testing-library/react@16.3.0 @testing-library/jest-dom@6.6.3 @testing-library/user-event@14.6.1 vite-tsconfig-paths@5.1.4`
`vitest.config.ts`: plugins `react()` + `tsconfigPaths()`, `test.environment: "jsdom"`, `test.setupFiles: ["src/test/setup.ts"]` (importa `@testing-library/jest-dom/vitest`), `test.include: ["src/**/*.test.{ts,tsx}"]`.

- [ ] **Step 2: Escrever o teste que falha**

```ts
describe("normalizeDroughtState", () => {
  it.each([
    ["Normal", "normal"], ["Alerta", "alerta"], ["Seca", "seca"],
    ["Seca Severa", "severa"], ["SECA SEVERA", "severa"], ["seca_severa", "severa"],
    [" Alerta ", "alerta"], ["Séca", "seca"],
  ])("%s → %s", (raw, key) => expect(normalizeDroughtState(raw)).toBe(key));
  it.each([[""], [null], [undefined], ["Colapso"]])("%s → null", (raw) =>
    expect(normalizeDroughtState(raw as string)).toBeNull());
});
it("DROUGHT_STATES na ordem do plano", () =>
  expect(DROUGHT_STATES.map((s) => s.label)).toEqual(["Normal", "Alerta", "Seca", "Seca Severa"]));
it("droughtClasses(null) é neutro", () =>
  expect(droughtClasses(null).bg).toBe("bg-muted"));
```

- [ ] **Step 3: Rodar e ver falhar** — Run: `npm test` → FAIL (módulo inexistente).
- [ ] **Step 4: Implementar `src/lib/drought-state.ts`** — normalizar com `trim`, `toLowerCase`, remover acentos (`normalize("NFD")` + remover `\p{Diacritic}`), trocar `_`/espaços múltiplos por um espaço; mapear `"seca severa"` antes de `"seca"`.
- [ ] **Step 5: Rodar e ver passar** — Run: `npm test` → PASS.
- [ ] **Step 6: Commit** — `git add package.json package-lock.json vitest.config.ts src/test src/lib/drought-state*` · `git commit -m "test: configurar Vitest e mapear estados de seca"`

### Task 2: Tokens, fontes e utilitárias

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx` (só fontes nesta tarefa)

**Interfaces:**
- Produces (classes Tailwind disponíveis para as próximas tarefas): `bg-background`, `text-foreground`, `text-muted-foreground`, `text-label`, `text-link`, `bg-water`/`text-water`, `bg-primary`, `bg-secondary`, `bg-sidebar`, `text-sidebar-foreground`, `text-sidebar-muted`, `border-border`, `border-input`, `text-estado-{normal,alerta,seca,severa}-text`, `bg-estado-…-bg`, `bg-estado-…-dot`, `font-sans`, `font-display`, utilitária `.eyebrow`; CSS vars `--chart-1..5`.

- [ ] **Step 1: Reescrever `:root` em `globals.css`** com todos os valores da spec §3.1 (tabela de tokens e tabela de estados). Remover `--card-shadow*` e os tokens `--estado-{atencao,emergencia,colapso}-*`. Registrar no `@theme inline`: `--color-label`, `--color-link`, `--color-link-hover` (`#7A3A00`), `--color-water`, `--color-sidebar-muted`, as 12 cores `--color-estado-*`, `--font-sans: var(--font-inter)`, `--font-display: var(--font-bricolage)`.
- [ ] **Step 2: Adicionar em `@layer base`**: `a` com `color: var(--link)` e hover `--color-link-hover`; `*:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }`; `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; } }`. Em `@layer utilities`: `.eyebrow` (13 px, 700, uppercase, `letter-spacing: .08em`, `color: var(--link)`).
- [ ] **Step 3: Fontes em `layout.tsx`** — `Inter({ subsets: ["latin"], variable: "--font-inter" })` e `Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz"], variable: "--font-bricolage" })`; aplicar as duas `variable` no `<html>` e `font-sans` no `<body>`.
- [ ] **Step 4: Verificar** — `npm run build` conclui; `npm run dev` e abrir `/`: fundo `#FAF5EF`, texto `#2A1405`, botões shadcn em laranja com texto escuro; inspetor mostra Inter no corpo.
- [ ] **Step 5: Commit** — `git commit -am "style: aplicar tokens, fontes e foco da repaginação"`

### Task 3: Remover dark mode

**Files:**
- Delete: `src/components/theme-provider.tsx`, `src/components/layout/ThemeToggle.tsx`
- Modify: `src/app/globals.css` (remover `.dark` e `@custom-variant dark`), `src/components/ui/sonner.tsx` (`theme="light"` fixo, sem `useTheme`), `src/components/dashboard/InteractiveMap.tsx` (tiles fixos na camada clara), `src/components/layout/Header.tsx` (remover o toggle), todo arquivo em `src/` com `dark:`
- Modify: `package.json` (`npm uninstall next-themes`)

- [ ] **Step 1: Remover arquivos, imports e o bloco `.dark`.**
- [ ] **Step 2: Remover as classes `dark:`** — Run: `grep -rn "dark:" src | wc -l` → `0`.
- [ ] **Step 3: Verificar** — `grep -rn "next-themes\|useTheme" src` → vazio; `npm run build` conclui; o mapa da Visão Geral carrega tiles claros.
- [ ] **Step 4: Commit** — `git commit -am "refactor: remover tema escuro"`

### Task 4: Shell (navegação, sidebar, header, skip link)

**Files:**
- Create: `src/components/app/nav-items.ts`, `src/components/app/nav-items.test.ts`, `AppShell.tsx`, `Sidebar.tsx`, `MobileNav.tsx`, `Header.tsx`, `Breadcrumb.tsx`, `SkipLink.tsx`, `ReservoirSelect.tsx`
- Modify: `src/app/layout.tsx` (server component)
- Delete: `src/components/layout/`

**Interfaces:**
- Produces:
  - `type NavItem = { href: string; label: string; icon: LucideIcon; requiresAuth?: boolean }`
  - `type NavGroup = { label: string | null; items: NavItem[] }`
  - `const NAV_GROUPS: NavGroup[]` — grupos e itens exatamente como a spec §4.1 (ícones: `Home`, `Globe`, `Activity`, `ClipboardCheck`, `ListChecks`, `AlertTriangle`, `Droplet`, `Scale`, `SlidersHorizontal`, `Users`, `ShieldAlert` para Admin)
  - `findNavItem(pathname: string): NavItem | null`
  - `breadcrumbFor(pathname: string): { label: string; href?: string }[]`
  - `<AppShell>{children}</AppShell>`; `<ReservoirSelect id: string; className?: string />` (usado também na Home)

- [ ] **Step 1: Teste que falha (`nav-items.test.ts`)**

```ts
it("Monitoramento rotula /estado-de-seca", () =>
  expect(findNavItem("/estado-de-seca")?.label).toBe("Monitoramento"));
it("breadcrumb da home", () => expect(breadcrumbFor("/")).toEqual([{ label: "Início" }]));
it("breadcrumb de seção", () =>
  expect(breadcrumbFor("/usos-agua")).toEqual([{ label: "Início", href: "/" }, { label: "Usos da Água" }]));
it("rota fora do menu usa título próprio", () =>
  expect(breadcrumbFor("/relogio-3d")).toEqual([
    { label: "Início", href: "/" }, { label: "Monitoramento", href: "/estado-de-seca" }, { label: "Relógio da Seca 3D" }]));
it("Admin exige auth", () => expect(findNavItem("/admin")?.requiresAuth).toBe(true));
```

- [ ] **Step 2: Rodar e ver falhar** — `npm test` → FAIL.
- [ ] **Step 3: Implementar `nav-items.ts`** (inclui um mapa `EXTRA_CRUMBS` para `/relogio-3d` e `/login`) → `npm test` PASS.
- [ ] **Step 4: Implementar o shell**
  - `layout.tsx` sem `"use client"`: exporta `metadata = { title: "SADGS — Apoio à Decisão em Secas", description: … }`, renderiza `<AppShell>`.
  - `AppShell` (client): `AuthProvider` → `ReservoirProvider` → `MotionConfig reducedMotion="user"`; em `/login` só `children`; nas demais: `SkipLink` (alvo `#conteudo`) + `Sidebar` + coluna com `Header` e `<main id="conteudo" tabIndex={-1}>`. O estado `collapsed` fica no `AppShell`, persistido em `localStorage["sadgs_sidebar_collapsed"]` com try/catch.
  - `Sidebar`: `aside aria-label="Navegação principal"`, oculto abaixo de `md`; 248 px aberto / 72 px recolhido; item ativo via `findNavItem(pathname)` com `aria-current="page"`; recolhido: rótulos de grupo ocultos, cada link com `aria-label` + `Tooltip`; botão de recolher com `aria-expanded` e `aria-controls`; itens `requiresAuth` só com `useAuth().isAuthenticated`.
  - `MobileNav`: botão `aria-label="Abrir menu de navegação"` (visível abaixo de `md`) + `Sheet` com os mesmos `NAV_GROUPS`; fecha ao mudar `pathname`.
  - `Header`: `MobileNav`, `Breadcrumb` (`nav aria-label="Você está em"` + `ol`), `<label htmlFor="hidro-top">Hidrossistema</label>` + `ReservoirSelect id="hidro-top"`, botão Entrar (`/login`) ou Sair (`logout()` + `router.push("/")`).
  - `ReservoirSelect`: o `ReservoirSelector` atual restilizado (trigger 40 px, `min-w-[220px]`, `bg-background`, `border-input`), recebendo `id` para o label.
- [ ] **Step 5: Verificar** — CV itens 1–4 em `/` e `/usos-agua`, incluindo recolher/expandir e o Sheet no mobile.
- [ ] **Step 6: Commit** — `git add -A src && git commit -m "feat: novo shell com sidebar, breadcrumb e skip link"`

### Task 5: Componentes compartilhados, formatação e `useReservoirQuery`

**Files:**
- Create: `src/lib/format.ts` + `.test.ts`, `src/lib/text.ts` + `.test.ts`, `src/hooks/useReservoirQuery.ts` + `.test.tsx`, `src/components/app/{PageHeader,SectionCard,StateBadge,KpiCard,SegmentedControl,ChartFigure,EmptyState,ExternalLink}.tsx`, `src/components/app/components.test.tsx`
- Modify: `src/components/dashboard/EmptyReservoirState.tsx` (restilizar com `EmptyState`)

**Interfaces:**
- Consumes: `normalizeDroughtState`, `droughtLabel`, `droughtClasses` (Task 1).
- Produces:
  - `formatNumber(value: number | null | undefined, decimals = 2): string` → `"—"` para null/NaN
  - `formatSigned(value: number | null | undefined, decimals = 2): string` → `"−0,49"`, `"+0,12"`, `"0,00"`, `"—"`
  - `formatDms(value: number, axis: "lat" | "long"): string`
  - `normalizeText(s: string): string` (minúsculas, sem acentos, trim)
  - `splitList(raw: string | null | undefined): string[]`
  - `useReservoirQuery<T>(fetcher: (id: number) => Promise<T>, deps?: unknown[]): { data: T | null; error: string | null; isLoading: boolean; reload: () => void; reservoir: Reservatorio | null }` — usa `selectedReservoir` do contexto; ignora resposta de requisição que não é a última.
  - `<PageHeader eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode />` (renderiza o único `h1`)
  - `<SectionCard id: string; title: string; description?: ReactNode; actions?: ReactNode; className?: string>` (`section aria-labelledby={id}`; título `h2`)
  - `<StateBadge state: string | null | undefined; size?: "sm" | "lg" />` (desconhecido → "Sem estado")
  - `<KpiCard label: ReactNode; value: number | null; unit?: string; decimals?: number; note?: ReactNode; children?: ReactNode />` (renderiza `div > dt + dd`; usado dentro de `<dl>`)
  - `<SegmentedControl<T extends string> label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void />`
  - `<ChartFigure ariaLabel: string; legend?: { label: string; swatch: ReactNode }[]; caption?: ReactNode; children />` (wrapper do gráfico com `role="img"` e `aria-label`)
  - `<EmptyState icon?: LucideIcon; title: string; description?: ReactNode; action?: ReactNode />`
  - `<ExternalLink href: string; children />` (`target="_blank" rel="noopener noreferrer"`, ícone, texto oculto "(abre em nova aba)")

- [ ] **Step 1: Testes que falham**

```ts
// format.test.ts
expect(formatNumber(23.0234)).toBe("23,02");
expect(formatNumber(1774.95, 2)).toBe("1.774,95");
expect(formatNumber(null)).toBe("—");
expect(formatNumber(Number.NaN)).toBe("—");
expect(formatSigned(-0.49)).toBe("−0,49");
expect(formatSigned(0.12)).toBe("+0,12");
expect(formatDms(-4.1858556, "lat")).toBe("4°11′09″ S");
expect(formatDms(-38.813525, "long")).toBe("38°48′49″ O");
expect(formatDms(-4.9999999, "lat")).toBe("5°00′00″ S");
// text.test.ts
expect(splitList("Poder Público (Mun., Est., Fed.), CAGECE; COGERH\nSDA"))
  .toEqual(["Poder Público (Mun., Est., Fed.)", "CAGECE", "COGERH", "SDA"]);
expect(splitList("  ")).toEqual([]);
expect(normalizeText("  Poços ")).toBe("pocos");
```

```tsx
// useReservoirQuery.test.tsx — renderHook com um ReservoirContext de teste
it("descarta resposta antiga ao trocar de reservatório", async () => {
  // fetcher(1) resolve depois de fetcher(2); ao final data === "dados-2"
});
it("sem reservatório selecionado não chama o fetcher e isLoading=false", …);
it("reload refaz a chamada", …);
// components.test.tsx
render(<StateBadge state="SECA SEVERA" />); expect(screen.getByText("Seca Severa")).toBeInTheDocument();
render(<StateBadge state="xyz" />); expect(screen.getByText("Sem estado")).toBeInTheDocument();
render(<dl><KpiCard label="Volume" value={null} unit="hm³" /></dl>); expect(screen.getByText("—")).toBeInTheDocument();
// SegmentedControl: botão ativo tem aria-pressed="true"; clique chama onChange com o value
```

Para o teste do hook, exportar `ReservoirContext` de `src/context/ReservoirContext.tsx` (hoje só `useReservoir`/`ReservoirProvider` são exportados).

- [ ] **Step 2: Rodar e ver falhar** — `npm test` → FAIL.
- [ ] **Step 3: Implementar** — `formatDms`: graus/minutos/segundos arredondando os segundos e propagando 60″→1′ e 60′→1°; hemisfério `S`/`N` e `O`/`L`. `splitList`: separar por `;`, quebra de linha e `,` fora de parênteses; trim; descartar vazios. Componentes seguem as medidas do artboard Fundamentos.
- [ ] **Step 4: Rodar e ver passar** — `npm test` → PASS.
- [ ] **Step 5: Commit** — `git add -A src && git commit -m "feat: componentes compartilhados, formatação pt-BR e useReservoirQuery"`

---

## Fase 2 — Telas

Toda tela: começa com `PageHeader`, conteúdo em `main` com `max-w-[1240px] mx-auto px-4 md:px-10 pt-9 pb-20 flex flex-col gap-6`, busca dados com `useReservoirQuery`, e é verificada pelo CV antes do commit.

### Task 6: Início `/` (artboard "Início")

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/home/{HomeHero,FeatureGrid,ReservoirPills}.tsx`

**Interfaces:**
- Consumes: `ReservoirSelect` (Task 4), `useReservoir`.
- Produces: `HOME_STATS = { anosDeDados: 107, instituicoes: 7 }` (constantes em `HomeHero.tsx`).

- [ ] **Step 1: Implementar** conforme spec §5.1. Textos exatos do artboard ("Decisões melhores antes que a seca chegue.", "Comece escolhendo um hidrossistema", aviso de cold start visível enquanto `useReservoir().isLoading`). Pills: `button` que chama `setSelectedReservoir(r)` e `router.push("/estado-de-seca")`. Card de destaque (Monitoramento) ocupa 2 colunas no grid ≥ 1024 px.
- [ ] **Step 2: Verificar** — CV completo; clicar numa pill seleciona o reservatório no header e abre o Monitoramento.
- [ ] **Step 3: Commit** — `git commit -am "feat(home): nova página inicial"`

### Task 7: Monitoramento `/estado-de-seca` (artboard "Monitoramento do Estado de Seca")

**Files:**
- Create: `src/lib/monitoring.ts` + `.test.ts`, `src/components/dashboard/{CurrentStateCard,MonitoringKpis,HistorySection}.tsx`
- Modify: `src/app/estado-de-seca/page.tsx`, `src/components/dashboard/VolumeChart.tsx`, `src/components/dashboard/HistoryTable.tsx`
- Delete: `src/components/dashboard/DroughtGauge.tsx`

**Interfaces:**
- Consumes: `api.getDashboardSummary`, `api.getVolumeChartData` (`Data` em `aaaa-mm-dd`, ordem crescente), `api.getHistory` (`Data` em `dd/mm/aaaa`, ordem crescente), `api.getGatilhosPGPS`; componentes da Task 5.
- Produces:
  - `type ChartPeriod = "1a" | "5a" | "10a" | "tudo"`
  - `filterByPeriod(points: ChartDataPoint[], period: ChartPeriod): ChartDataPoint[]` — janela relativa à data do **último ponto**, inclusiva
  - `variation7d(history: HistoryEntry[]): { deltaHm3: number; perDay: number; days: number } | null`
  - `dailyDiffs(history: HistoryEntry[]): (number | null)[]`
  - `historyToCsv(history: HistoryEntry[]): string`
  - `distanceToMetaPp(volumePct: number, metaPct: number): number`

- [ ] **Step 1: Testes que falham (`monitoring.test.ts`)**

```ts
const pts = ["2015-01-01", "2021-10-19", "2025-10-20", "2026-10-20"].map((Data) => ({ Data, volume: 1, meta1: 0, meta2: 0, meta3: 0 }));
expect(filterByPeriod(pts, "1a").map((p) => p.Data)).toEqual(["2025-10-20", "2026-10-20"]);
expect(filterByPeriod(pts, "5a").map((p) => p.Data)).toEqual(["2025-10-20", "2026-10-20"]);
expect(filterByPeriod(pts, "10a")).toHaveLength(3);
expect(filterByPeriod(pts, "tudo")).toHaveLength(4);
expect(filterByPeriod([], "1a")).toEqual([]);

const h = (Data: string, v: number) => ({ Data, "Estado de Seca": "Normal", "Volume (hm3)": v });
expect(variation7d([h("10/10/2026", 23.6), h("13/10/2026", 23.51), h("20/10/2026", 23.02)]))
  .toEqual({ deltaHm3: -0.49, perDay: -0.07, days: 7 });
expect(variation7d([h("10/10/2026", 23.6), h("20/10/2026", 23.02)]))   // lacuna
  .toEqual({ deltaHm3: -0.58, perDay: -0.06, days: 10 });
expect(variation7d([h("20/10/2026", 23.02)])).toBeNull();
expect(variation7d([])).toBeNull();

expect(dailyDiffs([h("13/10/2026", 23.51), h("14/10/2026", 23.45), h("15/10/2026", 23.36)])).toEqual([null, -0.06, -0.09]);

const csv = historyToCsv([h("13/10/2026", 23.51), h("14/10/2026", 23.45)]);
expect(csv.startsWith("﻿Data;Estado;Volume (hm³);Variação\r\n")).toBe(true);
expect(csv).toContain("13/10/2026;Normal;23,51;\r\n");
expect(csv).toContain("14/10/2026;Normal;23,45;-0,06");
expect(historyToCsv([{ ...h("14/10/2026", 1), "Estado de Seca": 'A;"B"' }])).toContain('"A;""B"""');

expect(distanceToMetaPp(78.6, 15.7)).toBe(62.9);
```

- [ ] **Step 2: Rodar e ver falhar** — `npm test` → FAIL.
- [ ] **Step 3: Implementar `monitoring.ts`** — arredondar valores a 2 casas (`perDay` a 2 casas, `distanceToMetaPp` a 1); `variation7d` usa o último registro e o registro mais recente com data ≤ última − 7 dias; sem registro anterior a essa data → usa o primeiro registro, se ele for anterior ao último.
- [ ] **Step 4: Rodar e ver passar** — `npm test` → PASS.
- [ ] **Step 5: Implementar a tela** conforme spec §5.3:
  - `CurrentStateCard`: `StateBadge size="lg"`, legenda `DROUGHT_STATES`, metas do mês corrente vindas de `gatilhos-pgps`.
  - `MonitoringKpis`: `<dl>` com 4 `KpiCard`s; barra de volume com `role="meter"`, `aria-valuenow` e `aria-valuemin`/`aria-valuemax`.
  - `VolumeChart`: recebe `period`; `SegmentedControl label="Período do gráfico"` com padrão `"10a"`; `ChartFigure` com legenda Volume (`--water`) e Meta 1/2/3; `isAnimationActive={!reducedMotion}` (via `useReducedMotion` do framer-motion); `<details>` "Entenda as metas" com o texto do artboard.
  - `HistorySection`: tabela com `caption`, colunas Data/Estado/Volume (hm³)/Variação (de `dailyDiffs`), paginação atual; botão "Baixar CSV" monta um `Blob` de `historyToCsv` e baixa `historico-<slug-do-reservatorio>.csv`.
  - Ação do `PageHeader`: link "Relógio da Seca 3D" para `/relogio-3d` com selo "Novo".
- [ ] **Step 6: Verificar** — CV completo; o CSV abre no Excel/Numbers com acentos e decimais corretos; trocar o período atualiza o gráfico.
- [ ] **Step 7: Commit** — `git add -A src && git commit -m "feat(monitoramento): KPIs, período do gráfico e exportação CSV"`

### Task 8: Visão Geral `/visao-geral` (artboard "Visão Geral")

**Files:**
- Modify: `src/app/visao-geral/page.tsx`, `src/components/dashboard/IdentificationContent.tsx`, `src/components/dashboard/InteractiveMap.tsx`, `src/lib/types.ts`
- Create: `src/components/dashboard/FichaTecnica.tsx` + `FichaTecnica.test.tsx`

**Interfaces:**
- Consumes: `api.getIdentification`, `api.getDashboardSummary`, `formatDms`, `formatNumber`, `splitList`.
- Produces: `IdentificationData` ganha os campos opcionais `capacidade_hm3?: number; codigo_funceme?: string; bacia?: string | null; area_drenagem_km2?: number | null; ano_construcao?: number | null; construtor?: string | null; rio_barrado?: string | null; municipios_atendidos?: string | null` (os mesmos nomes JSON da Task 17).

- [ ] **Step 1: Teste que falha (`FichaTecnica.test.tsx`)**

```tsx
render(<FichaTecnica data={{ ...base, capacidade_hm3: 29.6, area_drenagem_km2: 206.2, ano_construcao: 1924,
  construtor: "IFOCS (atual DNOCS)", rio_barrado: null, municipios_atendidos: "Redenção; Acarape" }} />);
expect(screen.getByText("29,60 hm³")).toBeInTheDocument();
expect(screen.getByText("206,20 km²")).toBeInTheDocument();
expect(screen.getByText("1924 · IFOCS (atual DNOCS)")).toBeInTheDocument();
expect(screen.queryByText("Rio barrado")).not.toBeInTheDocument();
expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["Redenção", "Acarape"]);
expect(screen.getByText("4°11′09″ S · 38°48′49″ O")).toBeInTheDocument();
```

- [ ] **Step 2: Rodar e ver falhar → implementar `FichaTecnica` → rodar e ver passar.**
- [ ] **Step 3: Implementar a tela** conforme spec §5.2 — link-cartão com estado e volume (summary); foto em `figure` (`alt` = "Vista do açude {nome}", `figcaption` com o ano quando houver); descrição em parágrafos (separar por `\n\n`/`\n`); botões de zoom do Leaflet com `aria-label` "Aproximar mapa"/"Afastar mapa"; `ExternalLink` para `https://www.openstreetmap.org/?mlat={lat}&mlon={long}#map=13/{lat}/{long}`.
- [ ] **Step 4: Verificar** — CV completo (antes da Task 17, a ficha mostra só Capacidade e Coordenadas).
- [ ] **Step 5: Commit** — `git add -A src && git commit -m "feat(visao-geral): ficha técnica e novo layout"`

### Task 9: Implementação `/implementacao-planos-de-seca` (artboard "Implementação dos Planos")

**Files:**
- Modify: `src/app/implementacao-planos-de-seca/page.tsx`, `src/components/dashboard/{ActionStatusTabs,PaginatedTableMedidas,PaginatedTableAcoes}.tsx`
- Create: `src/components/dashboard/MeasureList.tsx`

**Interfaces:**
- Consumes: `api.getNotStartedActions/getOngoingActions/getCompletedActions(id, estado)`, `api.updateActionStatus`, `DROUGHT_STATES`, `splitList`.

- [ ] **Step 1: Implementar** conforme spec §5.4:
  - faixa de resumo com o estado atual e três contadores;
  - Radix `Tabs` por estado, com o atual pré-selecionado e marcado "· atual";
  - `MeasureList`: `ol`, 5 primeiras ações e botão `aria-expanded` "Ver mais N ações", barra "X de N em andamento" (`role="meter"`);
  - aside com tabs Em andamento/Concluídas e `EmptyState` com os textos do artboard;
  - o mapa de cores local (`implementacao…/page.tsx:17-25`) dá lugar a `droughtClasses`;
  - a alteração de status para usuário autenticado continua como hoje.
- [ ] **Step 2: Verificar** — CV completo; logado, alterar o status de uma ação e ver os contadores mudarem.
- [ ] **Step 3: Commit** — `git commit -am "feat(implementacao): medidas por estado e situação das ações"`

### Task 10: Planos de Ação `/planos-de-acao` (artboard "Planos de Ação")

**Files:**
- Modify: `src/components/plans/ActionPlanClient.tsx`, `src/app/planos-de-acao/page.tsx`
- Create: `src/components/plans/filters.ts` + `.test.ts`, `src/components/plans/{PlanFilters,PlanCard}.tsx`

**Interfaces:**
- Consumes: `api.getActionPlans(id, filters)`, `api.getActionPlanFilters`, `normalizeText`, `splitList`.
- Produces:
  - `type PlanFilterState = { estado?: string; impacto?: string; problema?: string; acao?: string }`
  - `matchesSearch(plano: PlanoAcao, query: string): boolean` — busca em `acoes`, `descricao_acao`, `responsaveis`
  - `activeFilterChips(f: PlanFilterState): { key: keyof PlanFilterState; label: string }[]` — rótulos "Estado: X", "Impacto: X", "Problema: X", "Classe: X"

- [ ] **Step 1: Testes que falham**

```ts
expect(matchesSearch({ ...p, descricao_acao: "Poços para irrigação" }, "pocos")).toBe(true);
expect(matchesSearch({ ...p, responsaveis: "COGERH" }, "cogerh")).toBe(true);
expect(matchesSearch(p, "")).toBe(true);
expect(matchesSearch(p, "inexistente")).toBe(false);
expect(activeFilterChips({ estado: "Normal", acao: "" })).toEqual([{ key: "estado", label: "Estado: Normal" }]);
```

- [ ] **Step 2: Rodar e ver falhar → implementar → rodar e ver passar.**
- [ ] **Step 3: Implementar a tela** conforme spec §5.5:
  - os filtros continuam indo para a API; a busca é feita no cliente sobre o resultado;
  - `form role="search"` com `<label>` em cada controle; chips com botão `aria-label="Remover filtro {label}"`; "Limpar filtros" zera tudo;
  - contador `aria-live="polite"` "Mostrando N ações";
  - `PlanCard`: `article`; itens de `splitList(descricao_acao)` (5 + "Ver mais N itens"); pills de `splitList(classes_acao)` e `splitList(responsaveis)` (até 5 + "+N");
  - paginação com 10 por página, `nav aria-label="Paginação"`.
- [ ] **Step 4: Verificar** — CV completo; buscar "poços" com um filtro de estado ativo; remover o chip; Limpar.
- [ ] **Step 5: Commit** — `git add -A src && git commit -m "feat(planos): busca, chips de filtros e novos cards"`

### Task 11: Impactos `/impactos` (artboard "Impactos da Seca")

**Files:**
- Modify: `src/app/impactos/page.tsx`

- [ ] **Step 1: Implementar** conforme spec §5.6 — bloco `bg-secondary` com `ExternalLink` para `https://cepas.ufc.br/pt_br/avaliacao-de-impacto-das-secas/` ("Responder ao formulário"); 4 cards com os ícones/cores do artboard; botão "Ver infográfico" abre `Dialog` (`DialogTitle` "Infográfico dos principais impactos") com `next/image` de `/infografico/infografico.png` e `alt` descrevendo as quatro dimensões; "O contexto local" com o texto atual da página, que hoje cita o reservatório.
- [ ] **Step 2: Verificar** — CV completo; o Dialog abre e fecha por teclado e devolve o foco ao botão.
- [ ] **Step 3: Commit** — `git commit -am "feat(impactos): novo layout com infográfico em diálogo"`

### Task 12: Usos da Água `/usos-agua` (artboard "Usos da Água")

**Files:**
- Create: `src/lib/water.ts` + `water.test.ts` (parte de usos), `src/components/usos/{UsosKpis,UsoBars,UsoTable,UsoDiagram}.tsx`
- Modify: `src/app/usos-agua/page.tsx`
- Delete: `src/components/usos/UsoAguaChart{V2,Mobile,Responsive}.tsx`

**Interfaces:**
- Consumes: `api.getUsosAgua` (`UsoAgua[]`), `api.getIdentification` (`url_imagem_usos`).
- Produces:
  - `sumBy<T>(items: T[], pick: (t: T) => number): number`
  - `sortUsosByNormal(usos: UsoAgua[]): UsoAgua[]` — desc por `vazao_normal`, empate por `uso` (pt-BR)
  - `findPerdas(usos: UsoAgua[]): UsoAgua | null` — primeiro cujo `normalizeText(uso)` contém `perda` ou `irregular`
  - `reductionPct(normal: number, escassez: number): number | null` — inteiro arredondado; `normal === 0` → `null`

- [ ] **Step 1: Testes que falham**

```ts
expect(reductionPct(720, 352)).toBe(51);
expect(reductionPct(0, 0)).toBeNull();
expect(findPerdas([u("ETA Guaiúba"), u("Irregularidades, perdas em trânsito")])?.uso).toMatch(/Irregularidades/);
expect(findPerdas([u("ETA Guaiúba")])).toBeNull();
expect(sortUsosByNormal([u("B", 10), u("A", 10), u("C", 140)]).map((x) => x.uso)).toEqual(["C", "A", "B"]);
expect(sumBy([u("A", 10), u("B", 5)], (x) => x.vazao_normal)).toBe(15);
```

- [ ] **Step 2: Rodar e ver falhar → implementar → rodar e ver passar.**
- [ ] **Step 3: Implementar a tela** conforme spec §5.7:
  - `UsosKpis`: o card de perdas só aparece se `findPerdas` encontrar algo; nota "Mantidas na escassez: X% da demanda nesse cenário".
  - `UsoBars`: `ul aria-label="Vazão por uso, normalidade e escassez"`; cada barra com largura relativa ao maior `vazao_normal`; valor 0 em escassez com `vazao_normal > 0` mostra "0 — suspenso".
  - `UsoTable`: `table` com `caption`.
  - `SegmentedControl label="Formato de exibição"` (Gráfico/Tabela).
  - `UsoDiagram`: `figure` + botão "Ampliar imagem" → `Dialog`.
- [ ] **Step 4: Verificar** — CV completo.
- [ ] **Step 5: Commit** — `git add -A src && git commit -m "feat(usos): KPIs, barras pareadas e alternância gráfico/tabela"`

### Task 13: Balanço Hídrico `/balanco-hidrico` (artboard "Balanço Hídrico")

**Files:**
- Modify: `src/lib/water.ts` + `water.test.ts` (parte de balanço), `src/app/balanco-hidrico/page.tsx`, `src/components/balance/{OfertaDemandaChart,BalancoHidricoChart,ComposicaoDemandaChart}.tsx`

**Interfaces:**
- Consumes: `api.getWaterBalance` (`StaticWaterBalanceCharts`).
- Produces:
  - `garantiaStatus(o: OfertaDemanda): { label: string; oferta: number; demanda: number; saldo: number; atende: boolean }` — `label = o.cenarios.trim()`, `atende = oferta >= demanda`
  - `groupTopN(items: { label: string; value: number }[], n = 5): { label: string; value: number; pct: number; members?: string[] }[]` — ordena desc; o resto vira `{ label: "Outros N usos", members }`; `pct` com 1 casa
  - `mesesAbaixoDaDemanda(b: BalancoMensal[]): string[]`
  - `resumoAfluencia(meses: string[]): string`

- [ ] **Step 1: Testes que falham**

```ts
expect(garantiaStatus({ cenarios: " Garantia 90% ", "oferta_l/s": 848, "demanda_l/s": 748 }))
  .toEqual({ label: "Garantia 90%", oferta: 848, demanda: 748, saldo: 100, atende: true });
expect(garantiaStatus({ cenarios: "G95", "oferta_l/s": 711, "demanda_l/s": 748 }).saldo).toBe(-37);
expect(garantiaStatus({ cenarios: "G", "oferta_l/s": 748, "demanda_l/s": 748 }).atende).toBe(true);

const g = groupTopN([["a", 235], ["b", 140], ["c", 110], ["d", 100], ["e", 60], ["f", 30], ["g", 20]].map(([label, value]) => ({ label: String(label), value: Number(value) })));
expect(g).toHaveLength(6);
expect(g[5]).toEqual({ label: "Outros 2 usos", value: 50, pct: 7.2, members: ["f", "g"] });
expect(groupTopN([{ label: "a", value: 1 }])).toEqual([{ label: "a", value: 1, pct: 100 }]);

expect(resumoAfluencia([])).toBe("A afluência supera a demanda em todos os meses.");
expect(resumoAfluencia(["agosto", "setembro"]))
  .toBe("Em 2 meses (agosto e setembro) a afluência fica abaixo da demanda: o reservatório depende do volume acumulado na quadra chuvosa.");
```

- [ ] **Step 2: Rodar e ver falhar → implementar → rodar e ver passar.** `resumoAfluencia` junta a lista com `Intl.ListFormat("pt-BR", { type: "conjunction" })`; um mês só → "Em 1 mês (agosto) …".
- [ ] **Step 3: Implementar a tela** conforme spec §5.8:
  - `OfertaDemandaChart` passa a ser a lista de cards (selo Atende/Déficit com ícone e texto);
  - `BalancoHidricoChart`: `Cell` com `--water` acima da demanda e `--primary` abaixo, `ReferenceLine` da demanda, `ChartFigure` + parágrafo `resumoAfluencia`;
  - `ComposicaoDemandaChart`: barra empilhada em CSS + lista de `groupTopN` (valores de `composicaoDemanda.demandas_hm3`).
- [ ] **Step 4: Verificar** — CV completo.
- [ ] **Step 5: Commit** — `git add -A src && git commit -m "feat(balanco): cards por garantia, afluência e composição"`

### Task 14: Simulador `/simulacao` (artboard "Simulador")

**Files:**
- Create: `src/components/simulacao/useSimulacao.ts`, `src/components/simulacao/SimulationEmptyState.tsx`
- Modify: `src/app/simulacao/page.tsx`, `src/components/simulacao/ConfigForm.tsx` e os demais componentes de `components/simulacao/` (só estilo: tokens, `SectionCard`, `KpiCard`, `ChartFigure`)

**Interfaces:**
- Consumes: `useReservoir`, `api.getDashboardSummary` (volume atual), `api.getUsosAgua` + `sumBy` (Task 12) para a demanda atual.
- Produces: `useSimulacao(): UseSimulacao` — devolve todo o estado e os handlers que hoje vivem em `page.tsx` (`acudes`, `selectedAcudeId`, `volPercentual`, `filtroDataInicio`, `filtroDataFim`, `demanda`, `modoSimulacao`, `cenariosDemanda`, `visualizacaoModo`, `gatilhos`, `simulating`, `progresso`, resultados e os setters/handlers existentes) com os **mesmos nomes**; acrescenta `volumeAtualPct: number | null` e `demandaAtualM3s: number | null` (Σ `vazao_normal` / 1000).

- [ ] **Step 1: Extrair o hook sem mudar comportamento** — mover `useState`/`useEffect`/handlers de `page.tsx` para `useSimulacao.ts`; a página só compõe. Verificar: `npm run build` e uma simulação única + uma comparação dão os mesmos KPIs de antes (anotar os números antes de mexer).
- [ ] **Step 2: Commit** — `git commit -am "refactor(simulacao): extrair estado para useSimulacao"`
- [ ] **Step 3: Implementar o layout** conforme spec §5.9:
  - grid `lg:grid-cols-[400px_1fr]`, formulário com `lg:sticky lg:top-6`;
  - `fieldset`/`legend` no modo (radio-cards com `input type="radio"` real) e no período;
  - botões "Usar volume atual (x%)" e "Usar demanda atual", desabilitados quando o valor é `null`;
  - dicas `aria-describedby` ("= x hm³" calculado da capacidade; "Demanda total cadastrada: x m³/s (y L/s)");
  - região de resultados `aria-live="polite"`: antes de simular, `SimulationEmptyState` com o texto e os 3 passos do artboard; depois, os componentes atuais restilizados.
- [ ] **Step 4: Verificar** — CV completo; simular nos dois modos; resultado anunciado pelo leitor de tela (região live).
- [ ] **Step 5: Commit** — `git add -A src && git commit -m "feat(simulacao): novo layout do simulador"`

### Task 15: Responsáveis `/responsaveis` (artboard "Responsáveis")

**Files:**
- Modify: `src/app/responsaveis/page.tsx`, `src/components/responsaveis/Parceiros.tsx`

- [ ] **Step 1: Implementar** conforme spec §5.10:
  - manter o agrupamento e a ordem atuais (`grupoDisplayOrder`, `organizacaoOrder`);
  - cada grupo vira uma `SectionCard` com `id` âncora em slug (`creditos`, `comite`, `atores`, `equipe`, `financiamento`);
  - índice `nav aria-label="Nesta página"` gerado a partir dos grupos presentes;
  - pessoas em `dl` (`dt` nome, `dd` cargo); instituições em `ul`;
  - logos de financiamento com `next/image` e `alt` com o nome da instituição.
- [ ] **Step 2: Verificar** — CV completo; links do índice movem o foco para a seção.
- [ ] **Step 3: Commit** — `git commit -am "feat(responsaveis): índice e seções reorganizadas"`

### Task 16: Login, Admin e Relógio 3D

**Files:**
- Modify: `src/app/login/page.tsx`, `src/app/admin/page.tsx`, `src/app/relogio-3d/page.tsx`, `src/components/reservoir-3d/ReservoirScene.tsx`, `src/components/reservoir-3d/drought-clock.css`

**Interfaces:**
- Consumes: `DroughtStateKey`, `normalizeDroughtState` (Task 1) — `ReservoirScene` passa a usar `DroughtStateKey` no lugar do seu `DroughtStateType` local e as cores dos tokens `--estado-*-dot`.

- [ ] **Step 1: Implementar** conforme spec §5.11:
  - Login: card centralizado, logo, `Label` + `Input`, erro com `role="alert"`, botão primário 48 px.
  - Admin e Relógio: `PageHeader` + `SectionCard`, sem mudar o layout interno nem a regra `role === "admin_cogerh"`.
  - Hex soltos em `drought-clock.css` passam a usar `var(--…)`.
- [ ] **Step 2: Verificar** — CV completo nas três rotas; login e logout funcionam; o backfill do admin continua visível só para `admin_cogerh`; o Relógio 3D renderiza o estado atual.
- [ ] **Step 3: Commit** — `git commit -am "style: login, admin e relógio 3D na nova identidade"`

---

## Fase 3 — Ficha técnica (dashboard-api)

### Task 17: Campos da ficha no `/identification`

**Files (em `dashboard-api/`):**
- Modify: `model/reservatorio.go`, `usecase/reservatorio_usecase.go:145-183`, `usecase/reservatorio_usecase_test.go`, `cmd/main.go:64`, `docs/swagger.{json,yaml}` + `docs/docs.go`

**Interfaces:**
- Produces (JSON de `ReservatorioDetalhes`): `capacidade_hm3` (number), `codigo_funceme` (string), `bacia`, `area_drenagem_km2`, `ano_construcao`, `construtor`, `rio_barrado`, `municipios_atendidos` — todos com `omitempty`, ponteiros nos opcionais.
- `model.Reservatorio` ganha: `Bacia *string`, `AreaDrenagemKm2 *float64`, `AnoConstrucao *int`, `Construtor *string`, `RioBarrado *string`, `MunicipiosAtendidos *string` (tags `json` iguais às acima).

- [ ] **Step 1: Branch** — `git switch dev && git switch -c feat/repaginacao-visual` (o repositório está em `dev`, sem alterações pendentes).
- [ ] **Step 2: Teste que falha** — em `usecase/reservatorio_usecase_test.go`, `TestObterDetalhesReservatorio_FichaTecnica`: o mock `GetReservatorioByID` devolve um `Reservatorio` com `Capacidadehm3: 29.6`, `CodigoFunceme: "78"`, `AreaDrenagemKm2: ptr(206.2)`, `AnoConstrucao: ptr(1924)`, `RioBarrado: nil`; asserts: `det.CapacidadeHm3 == 29.6`, `det.CodigoFunceme == "78"`, `*det.AreaDrenagemKm2 == 206.2`, `*det.AnoConstrucao == 1924`, `det.RioBarrado == nil`; e `json.Marshal(det)` não contém `"rio_barrado"`.
- [ ] **Step 3: Rodar e ver falhar** — `go test ./usecase/ -run TestObterDetalhesReservatorio_FichaTecnica` → FAIL (campos inexistentes).
- [ ] **Step 4: Implementar** — campos nos dois structs; mapeamento em `ObterDetalhesReservatorio`; `cmd/main.go:64` passa a migrar também `&model.Reservatorio{}`.
- [ ] **Step 5: Rodar tudo** — `go test ./...` → PASS.
- [ ] **Step 6: Swagger** — `swag init -g cmd/main.go -o docs` (instalar com `go install github.com/swaggo/swag/cmd/swag@latest` se faltar); conferir que `model.ReservatorioDetalhes` mostra os campos novos.
- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: expor ficha técnica no /identification"`

### Task 18: CSV da ficha, importador e seeder

**Files (em `dashboard-api/`):**
- Create: `internal/ficha/ficha.go`, `internal/ficha/ficha_test.go`, `cmd/import-ficha/main.go`, `dados_importacao/ficha_tecnica.csv`
- Modify: `cmd/seeder/main.go` (aplicar a ficha depois de importar os reservatórios)

**Interfaces:**
- Consumes: campos de `model.Reservatorio` (Task 17).
- Produces:
  - `type Registro struct { Nome string; Bacia *string; AreaDrenagemKm2 *float64; AnoConstrucao *int; Construtor, RioBarrado, MunicipiosAtendidos *string }`
  - `func Parse(r io.Reader) ([]Registro, error)` — CSV com `;`, cabeçalho `nome;bacia;area_drenagem_km2;ano_construcao;construtor;rio_barrado;municipios_atendidos`; decimal com vírgula ou ponto; vazio → `nil`; cabeçalho errado ou número inválido → erro que cita a linha
  - `func Aplicar(db *gorm.DB, regs []Registro) (atualizados int, desconhecidos []string, err error)` — `UPDATE` por `nome` (comparação exata), em transação; `nil` grava `NULL` (o CSV é a fonte da verdade); nome sem reservatório vai para `desconhecidos`
  - `cmd/import-ficha`: `go run ./cmd/import-ficha [-arquivo dados_importacao/ficha_tecnica.csv] [-dry-run]`; usa `config`/`db.ConnectDB` como `cmd/main.go`; imprime atualizados e desconhecidos; `-dry-run` faz rollback

- [ ] **Step 1: Testes que falham (`ficha_test.go`, SQLite em memória com `AutoMigrate(&model.Reservatorio{})`)**
  - `TestParse_Valido`: linha `Acarape do Meio;Bacias Metropolitanas;206,20;1924;IFOCS (atual DNOCS);;Redenção|Acarape` (no CSV, `municipios_atendidos` separa os municípios com `|`, e o importador grava com `; `). Asserts: `r.Nome == "Acarape do Meio"`, `*r.AreaDrenagemKm2 == 206.2`, `*r.AnoConstrucao == 1924`, `r.RioBarrado == nil`, `*r.MunicipiosAtendidos == "Redenção; Acarape"`.
  - `TestParse_CabecalhoInvalido` → erro contendo `"cabeçalho"`.
  - `TestParse_NumeroInvalido` (`abc` em área) → erro contendo `"linha 2"`.
  - `TestAplicar_AtualizaPorNome`: reservatórios `A` e `B`; `Aplicar([{Nome:"A", AnoConstrucao:ptr(1924)}, {Nome:"Z"}])` → `atualizados == 1`, `desconhecidos == ["Z"]`, `A.AnoConstrucao == 1924`, `B` intacto.
  - `TestAplicar_Idempotente`: aplicar duas vezes → mesmo estado e `atualizados == 1` nas duas.
  - `TestAplicar_VazioLimpa`: `A` com `RioBarrado = "Pacoti"`; aplicar um registro com `RioBarrado: nil` → `A.RioBarrado == nil`.
- [ ] **Step 2: Rodar e ver falhar** — `go test ./internal/ficha/` → FAIL.
- [ ] **Step 3: Implementar `ficha.go`** (`encoding/csv` com `Comma = ';'`; troca `|` por `; ` em `municipios_atendidos`).
- [ ] **Step 4: Rodar e ver passar** — `go test ./...` → PASS.
- [ ] **Step 5: Implementar `cmd/import-ficha/main.go` e a chamada no seeder** (o seeder lê `dados_importacao/ficha_tecnica.csv` se existir e registra no log quantos foram atualizados e quais nomes não foram encontrados).
- [ ] **Step 6: Montar `dados_importacao/ficha_tecnica.csv`** — uma linha por reservatório, com o `nome` exatamente igual ao da coluna 3 de cada `identificacao.xlsx`. Extrair de cada descrição só o que o texto afirma: região hidrográfica, área de drenagem, ano de conclusão, construtor, rio barrado e municípios atendidos. O que não estiver explícito fica vazio. Em sistemas com dois açudes (Fogareiro-Quixeramobim), usar o reservatório principal citado. Rodar `go run ./cmd/import-ficha -dry-run` contra o banco local → `desconhecidos` vazio.
- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: importador idempotente da ficha técnica"`
- [ ] **Step 8: Gate humano** — pedir à equipe a revisão do `ficha_tecnica.csv` **antes** de rodar `go run ./cmd/import-ficha` em produção. Não rodar em produção como parte desta tarefa.

---

## Fase 4 — Fechamento

### Task 19: Varredura final

**Files:** nenhum novo; remover código morto que sobrar.

- [ ] **Step 1: Código morto** — `grep -rn "components/layout\|DroughtGauge\|UsoAguaChart\|estado-atencao\|estado-emergencia\|estado-colapso\|card-shadow" src` → vazio; `grep -rnE "#[0-9a-fA-F]{6}" src --include=*.tsx` → só valores justificados (ex.: SVG do logo).
- [ ] **Step 2: CV completo nas 13 rotas**, com a API local já tendo a ficha (Task 18, dry-run desligado no banco local).
- [ ] **Step 3: Regressão funcional** (spec §8): a seleção de reservatório persiste entre as telas; login/logout; alteração de status; simulação única e comparação; backfill do admin; Relógio 3D.
- [ ] **Step 4: Commit** de eventuais ajustes — `git commit -am "chore: limpeza final da repaginação"`
