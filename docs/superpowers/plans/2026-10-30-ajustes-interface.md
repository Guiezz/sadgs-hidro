# Ajustes de interface (sprint pós-repaginação) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir cinco pontos da interface repaginada: alinhamento dos cards da home, texto corrido justificado, Planos de Ação e Implementação em tabela, botão de recolher a sidebar no topo e botão "voltar ao topo" no mobile.

**Architecture:** Mudanças locais em componentes existentes do `dashboard-front`. Um utilitário CSS novo (`texto-corrido`) em `globals.css`; um componente compartilhado `ExpandableList` (lista com "Ver mais") usado pelas duas tabelas; `PlanCard` é substituído por `PlanTable`; `MeasureList` mantém a mesma interface e passa a renderizar uma tabela; `BackToTop` novo montado no `AppShell`.

**Tech Stack:** Next.js 15.5 (App Router), React 19.1, TypeScript strict, Tailwind CSS 4, shadcn/ui (`src/components/ui/table.tsx`), lucide-react, Vitest + Testing Library (jsdom).

**Spec:** design curto aprovado no chat em 2026-10-30 (caminho *bounded*, sem arquivo de spec). Resumo fiel:

1. **Cards da home** — número no topo e rótulo embaixo, números alinhados entre os três cards mesmo quando um rótulo quebra.
2. **Justificado** — só texto corrido (parágrafos, listas de ações, descrições longas, inclusive células de descrição das tabelas), com hifenização pt-BR. Títulos, botões, rótulos, cards de números e cabeçalhos não mudam. Textos centralizados continuam centralizados.
3. **Tabelas clássicas** — Planos de Ação com colunas **Impacto** (com selo do estado) · **Ações** (lista, "Ver mais" acima de 5) · **Classe** · **Responsáveis**; Implementação com **Nº** · **Ações** · **Situação** (selo; barra de progresso sai). Componente `Table` existente, cabeçalho, linhas zebradas, alinhamento no topo. Mobile: rolagem horizontal. O painel lateral de ações em andamento/concluídas fica como está. Paginação de 10 dos Planos de Ação continua.
4. **Recolher sidebar** — botão sai do rodapé e vai para o topo, ao lado da logo (recolhida: logo abaixo do ícone). "Sair" continua no rodapé.
5. **Voltar ao topo** — botão flutuante redondo, canto inferior direito, 44 px, só abaixo de `md`, aparece depois de rolar mais de uma altura de tela; rolagem suave (instantânea com movimento reduzido); foco volta ao `#conteudo`.

## Global Constraints

- Branch: `feat/repaginacao-visual` do `dashboard-front` (não integrada; não fazer push).
- Todo texto de UI em pt-BR; `<html lang="pt-BR">` já existe em `src/app/layout.tsx:26` (a hifenização depende dele).
- Cores só por tokens já existentes (`bg-secondary`, `bg-muted`, `text-label`, `bg-accent`, `text-link-hover`…); nenhum hex novo em componentes.
- Alvos de toque ≥ 44 px (`size-11`, `min-h-11`).
- Estados de seca sempre com texto (`StateBadge`), nunca só cor.
- Comando de testes: `npm test` (Vitest, `vitest run`). Linha de base: 13 arquivos, 103 testes passando.
- Commits terminam com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Plano sem ações** (`acoes` vazio) — a célula Ações mostra "Sem itens cadastrados." e nenhum botão "Ver mais". Teste na Task 5.
2. **Exatamente 5 ações** — sem "Ver mais" (limite). Teste na Task 5.
3. **Classe ou responsáveis vazios** — a célula mostra "—", não fica em branco. Teste na Task 5.
4. **Medida sem situação** (`situacao` vazia) — selo "Não iniciada". Teste na Task 6.
5. **Voltar a rolar para cima** — o `BackToTop` some de novo quando `scrollY` volta a ficar ≤ altura da tela (não fica preso visível). Teste na Task 4.

---

### Task 1: Utilitário `texto-corrido` e aplicação no texto corrido

**Files:**
- Modify: `src/app/globals.css` (bloco `@layer utilities`, ao lado de `.eyebrow`)
- Modify: os elementos listados no Step 4
- Test: `src/components/app/components.test.tsx`

**Interfaces:**
- Produces: classe CSS `texto-corrido` (`text-align: justify; hyphens: auto; -webkit-hyphens: auto;`). As Tasks 5 e 6 a usam via `ExpandableList`.

- [ ] **Step 1: Escrever o teste que falha** (em `components.test.tsx`, importar `PageHeader`)

```tsx
it("PageHeader justifica a descrição", () => {
  render(<PageHeader title="T" description="Texto longo" />);
  expect(screen.getByText("Texto longo")).toHaveClass("texto-corrido");
});
```

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run src/components/app/components.test.tsx` → FAIL (classe ausente).

- [ ] **Step 3: Criar `.texto-corrido` em `globals.css`** dentro de `@layer utilities`, com as três propriedades acima.

- [ ] **Step 4: Aplicar `texto-corrido`** nos elementos abaixo. Onde houver `text-pretty`, removê-lo (conflita com justify). Não tocar em elementos com `text-center`.
  - `src/components/app/PageHeader.tsx:19` (descrição)
  - `src/components/app/SectionCard.tsx:24` (descrição)
  - `src/components/home/HomeHero.tsx:38` (parágrafo do hero; remover `text-pretty`)
  - `src/components/home/FeatureGrid.tsx:94` e `:131` (descrições dos cards)
  - `src/app/visao-geral/page.tsx:125` (parágrafos da descrição; remover `text-pretty`)
  - `src/app/impactos/page.tsx:71`, `:147`, `:153`
  - `src/components/usos/UsoDiagram.tsx:24`
  - `src/components/dashboard/VolumeChart.tsx:152`
  - `src/components/balance/BalancoHidricoChart.tsx:87`
  - `src/components/simulacao/SimulationSummary.tsx:115`
  - `src/components/reservoir-3d/Reservoir3DViewer.tsx:338`, `:347`, `:356`, `:365`, `:666`
  - `src/components/dashboard/ActionStatusTabs.tsx:27` (span com o texto da ação)

- [ ] **Step 5: Rodar os testes** — `npm test` → PASS (104 testes).

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/app src/components
git commit -m "style: texto corrido justificado com hifenização pt-BR"
```

### Task 2: Cards de estatísticas da home alinhados

**Files:**
- Modify: `src/components/home/HomeHero.tsx:93-99` (o `div` de cada card do `<dl>`)

**Interfaces:** nenhuma.

O card usa `flex-col-reverse` (DOM `dt` → `dd`, visual `dd` em cima). Em coluna reversa o início do eixo é embaixo, por isso o conteúdo cola no rodapé e o número sobe quando o rótulo quebra. Manter a ordem do DOM (`dt` antes de `dd` é o correto em `<dl>`) e adicionar `justify-end`, que em coluna reversa empacota no topo: todos os números ficam na mesma linha e o rótulo de duas linhas cresce para baixo. Adicionar também `leading-tight` no `dt`.

Sem teste unitário: jsdom não calcula layout; a verificação é visual.

- [ ] **Step 1: Aplicar `justify-end` no card e `leading-tight` no `dt`.**

- [ ] **Step 2: Verificar no navegador** — `preview_start` do dev server, home em 1280 px e em 375 px. Esperado: o topo de "17", "107" e "7" na mesma altura; rótulos logo abaixo, alinhados à esquerda.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HomeHero.tsx
git commit -m "fix(home): números dos cards de estatística alinhados"
```

### Task 3: Botão de recolher a sidebar no topo

**Files:**
- Modify: `src/components/app/Sidebar.tsx`
- Test: `src/components/app/Sidebar.test.tsx` (novo)

**Interfaces:**
- Consumes: `Sidebar({ collapsed, onToggle })` sem mudança de props.

- [ ] **Step 1: Escrever os testes que falham.** Mockar `next/navigation` (`useRouter: () => ({ push: vi.fn() })`, `usePathname: () => "/"`) e `@/context/AuthContext` (`useAuth: () => ({ isAuthenticated: false, logout: vi.fn() })`).

```tsx
it("botão de recolher vem antes da navegação", () => {
  render(<Sidebar collapsed={false} onToggle={() => {}} />);
  const botao = screen.getByRole("button", { name: "Recolher menu" });
  const link = screen.getByRole("link", { name: /Visão Geral/ });
  expect(botao.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it("recolhida, o botão vira Expandir menu", async () => {
  const onToggle = vi.fn();
  render(<Sidebar collapsed onToggle={onToggle} />);
  const botao = screen.getByRole("button", { name: "Expandir menu" });
  expect(botao).toHaveAttribute("aria-expanded", "false");
  await userEvent.click(botao);
  expect(onToggle).toHaveBeenCalledOnce();
});
```

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run src/components/app/Sidebar.test.tsx` → o primeiro teste FAIL (botão está depois da navegação).

- [ ] **Step 3: Mover o botão para o topo.** Envolver `BrandMark` e o botão num cabeçalho: expandida `flex items-center justify-between gap-2`; recolhida `flex flex-col items-center gap-3`. O botão vira só ícone (`size-11`, `rounded-lg`, mesmas cores de hover), com `aria-label` ("Recolher menu"/"Expandir menu"), `title` igual ao `aria-label`, `aria-expanded` e `aria-controls="sidebar"` mantidos. O rodapé `mt-auto` fica só com "Sair" e só é renderizado quando `isAuthenticated`.

- [ ] **Step 4: Rodar os testes** — `npm test` → PASS.

- [ ] **Step 5: Verificar no navegador** — desktop, janela de 700 px de altura: o botão aparece sem rolar a sidebar, expandida e recolhida.

- [ ] **Step 6: Commit**

```bash
git add src/components/app/Sidebar.tsx src/components/app/Sidebar.test.tsx
git commit -m "feat(sidebar): botão de recolher no topo, ao lado da logo"
```

### Task 4: Botão "voltar ao topo" no mobile

**Files:**
- Create: `src/components/app/BackToTop.tsx`
- Modify: `src/components/app/AppShell.tsx` (renderizar `<BackToTop />` logo depois do `div` que contém `<main>`, só no ramo que não é `/login`)
- Test: `src/components/app/BackToTop.test.tsx` (novo)

**Interfaces:**
- Produces: `export function BackToTop(): JSX.Element | null`.

Comportamento: ouvinte `scroll` passivo na `window`, com uma medição também na montagem (página recarregada no meio); visível quando `window.scrollY > window.innerHeight`; quando invisível retorna `null` (fora da ordem de Tab). Botão `fixed bottom-5 right-4 z-40 size-11 rounded-full bg-secondary text-white shadow-lg md:hidden`, ícone `ArrowUp` com `aria-hidden`, `aria-label="Voltar ao topo"`. Clique: `window.scrollTo({ top: 0, behavior })` com `behavior` `"auto"` se `window.matchMedia?.("(prefers-reduced-motion: reduce)").matches`, senão `"smooth"`; depois `document.getElementById("conteudo")?.focus({ preventScroll: true })`. `z-40` fica abaixo do `Sheet` do menu mobile (`z-50`); o mapa Leaflet já está isolado (`relative z-0` em `InteractiveMap.tsx:34`).

- [ ] **Step 1: Escrever os testes que falham.** Helper que define `window.scrollY`/`window.innerHeight` com `Object.defineProperty(..., { configurable: true, value })` e dispara `fireEvent.scroll(window)`; `window.scrollTo = vi.fn()`.

```tsx
it("escondido no topo da página", () => {
  rolar(0, 800);
  render(<BackToTop />);
  expect(screen.queryByRole("button", { name: "Voltar ao topo" })).toBeNull();
});

it("aparece depois de uma tela e some ao voltar", () => {
  render(<BackToTop />);
  act(() => rolar(900, 800));
  expect(screen.getByRole("button", { name: "Voltar ao topo" })).toBeInTheDocument();
  act(() => rolar(300, 800));
  expect(screen.queryByRole("button", { name: "Voltar ao topo" })).toBeNull();
});

it("clique sobe e devolve o foco ao conteúdo", async () => {
  render(<><main id="conteudo" tabIndex={-1} /><BackToTop /></>);
  act(() => rolar(900, 800));
  await userEvent.click(screen.getByRole("button", { name: "Voltar ao topo" }));
  expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  expect(document.activeElement).toBe(document.getElementById("conteudo"));
});
```

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run src/components/app/BackToTop.test.tsx` → FAIL (módulo não existe).

- [ ] **Step 3: Implementar `BackToTop` e montá-lo no `AppShell`.**

- [ ] **Step 4: Rodar os testes** — `npm test` → PASS.

- [ ] **Step 5: Verificar no navegador** — `resize_window` preset `mobile`, rolar Planos de Ação: o botão aparece depois de uma tela, sobe ao topo; em `desktop` não aparece; com o menu mobile aberto fica por baixo do overlay.

- [ ] **Step 6: Commit**

```bash
git add src/components/app/BackToTop.tsx src/components/app/BackToTop.test.tsx src/components/app/AppShell.tsx
git commit -m "feat(mobile): botão voltar ao topo em páginas longas"
```

### Task 5: `ExpandableList` e Planos de Ação em tabela

**Files:**
- Create: `src/components/app/ExpandableList.tsx`
- Create: `src/components/plans/PlanTable.tsx`
- Modify: `src/components/plans/ActionPlanClient.tsx` (trocar o `div` de `PlanCard`s por `<PlanTable planos={current} />`, mantendo `opacity-60` durante recarga)
- Delete: `src/components/plans/PlanCard.tsx`
- Test: `src/components/plans/PlanTable.test.tsx` (novo)

**Interfaces:**
- Consumes: `texto-corrido` (Task 1); `splitActions`, `splitList` de `@/lib/text`; `StateBadge`; `Table*` de `@/components/ui/table`.
- Produces:
  - `ExpandableList({ id, items, visible = 5, noun }: { id: string; items: string[]; visible?: number; noun: [singular: string, plural: string] })` — `ul` com marcadores (`pl-[18px]`, `text-sm leading-normal`, `li` com `texto-corrido`) e, quando `items.length > visible`, botão "Ver mais N {noun}" / "Ver menos" com `aria-expanded` e `aria-controls={id}` (mesmo estilo do botão atual do `PlanCard`). Com `items` vazio, renderiza `<p class="m-0 text-sm text-muted-foreground">Sem itens cadastrados.</p>`.
  - `PlanTable({ planos }: { planos: PlanoAcao[] })`.

`PlanTable`: tabela `aria-label="Planos de ação"`, `min-w-[760px] table-fixed`, dentro de um contêiner `rounded-2xl border border-border bg-card overflow-hidden`. Cabeçalho `bg-muted` com rótulos em `text-xs font-semibold uppercase tracking-[0.05em] text-label`. Colunas e larguras: Impacto 20% (título em sentence case — mover `sentenceCase` do `PlanCard` — "Ação do plano" se vazio, e `StateBadge` abaixo), Ações 45% (`ExpandableList` com `noun ["item","itens"]`, `id` `plano-${id}-itens`), Classe 15% (classes únicas de `splitActions(classes_acao)` unidas por ", "), Responsáveis 20% (únicos de `splitList(responsaveis)` unidos por ", "). Células `align-top whitespace-normal py-4`; linhas `even:bg-muted/40`. Célula vazia mostra "—".

- [ ] **Step 1: Escrever os testes que falham.** Fábrica `plano(over: Partial<PlanoAcao>): PlanoAcao` com todos os campos em `""` e `id: 1`.

```tsx
it("cabeçalhos da tabela", () => {
  render(<PlanTable planos={[plano({})]} />);
  for (const h of ["Impacto", "Ações", "Classe", "Responsáveis"])
    expect(screen.getByRole("columnheader", { name: h })).toBeInTheDocument();
});

it("uma linha por plano, título em sentence case", () => {
  render(<PlanTable planos={[plano({ id: 1, tipos_impactos: "IMPACTOS ECONÔMICOS" }), plano({ id: 2 })]} />);
  expect(screen.getAllByRole("row")).toHaveLength(3);
  expect(screen.getByText("Impactos econômicos")).toBeInTheDocument();
});

it("mais de 5 ações abre com Ver mais", async () => {
  render(<PlanTable planos={[plano({ acoes: "a\nb\nc\nd\ne\nf\ng" })]} />);
  expect(screen.getAllByRole("listitem")).toHaveLength(5);
  await userEvent.click(screen.getByRole("button", { name: "Ver mais 2 itens" }));
  expect(screen.getAllByRole("listitem")).toHaveLength(7);
});

it("exatamente 5 ações não tem Ver mais", () => {
  render(<PlanTable planos={[plano({ acoes: "a\nb\nc\nd\ne" })]} />);
  expect(screen.queryByRole("button", { name: /Ver mais/ })).toBeNull();
});

it("sem ações mostra aviso", () => {
  render(<PlanTable planos={[plano({ acoes: "" })]} />);
  expect(screen.getByText("Sem itens cadastrados.")).toBeInTheDocument();
});

it("classe e responsáveis deduplicados; vazios viram travessão", () => {
  render(
    <PlanTable
      planos={[
        plano({ id: 1, classes_acao: "Educação\nEducação", responsaveis: "COGERH; SRH; COGERH" }),
        plano({ id: 2 }),
      ]}
    />,
  );
  expect(screen.getByText("Educação")).toBeInTheDocument();
  expect(screen.getByText("COGERH, SRH")).toBeInTheDocument();
  expect(screen.getAllByText("—")).toHaveLength(2);
});
```

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run src/components/plans/PlanTable.test.tsx` → FAIL (módulo não existe).

- [ ] **Step 3: Implementar `ExpandableList` e `PlanTable`; trocar no `ActionPlanClient`; apagar `PlanCard.tsx`.**

- [ ] **Step 4: Rodar os testes e o tipo** — `npm test` → PASS; `npx tsc --noEmit` → sem erros (nenhuma importação restante de `PlanCard`).

- [ ] **Step 5: Verificar no navegador** — `/planos-de-acao` com um hidrossistema escolhido, em desktop e mobile (rolagem horizontal dentro do contêiner, sem rolagem horizontal da página).

- [ ] **Step 6: Commit**

```bash
git add -A src/components/app/ExpandableList.tsx src/components/plans
git commit -m "feat(planos): planos de ação em tabela"
```

### Task 6: Medidas da Implementação em tabela

**Files:**
- Modify: `src/components/dashboard/MeasureList.tsx`
- Test: `src/components/dashboard/MeasureList.test.tsx` (novo)

**Interfaces:**
- Consumes: `ExpandableList` (Task 5); `Table*`.
- Produces: `MeasureList({ planos }: { planos: PlanoAcao[] })` — mesma assinatura; `src/app/implementacao-planos-de-seca/page.tsx` não muda.

Tabela `aria-label="Medidas recomendadas"`, mesmo contêiner, cabeçalho e zebrado da `PlanTable`. Colunas: Nº (`w-14`, número `index + 1` em `font-bold`), Ações (`ExpandableList`, `noun ["ação","ações"]`, `id` `medida-${id}-acoes`), Situação (`w-40`, selo `rounded-full px-2 py-0.5 text-xs font-semibold` com `situacaoTone(...).cls`). `situacaoTone` perde o campo `pct`; a barra de progresso e o cabeçalho "Medida N · X ações" saem. Sem `min-w` fixa grande: `min-w-[520px]`.

- [ ] **Step 1: Escrever os testes que falham** (fábrica `plano` como na Task 5).

```tsx
it("cabeçalhos e numeração", () => {
  render(<MeasureList planos={[plano({ id: 1 }), plano({ id: 2 })]} />);
  for (const h of ["Nº", "Ações", "Situação"])
    expect(screen.getByRole("columnheader", { name: h })).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: "2" })).toBeInTheDocument();
});

it("situação normalizada", () => {
  render(
    <MeasureList
      planos={[
        plano({ id: 1, situacao: "Em andamento" }),
        plano({ id: 2, situacao: "Concluído" }),
        plano({ id: 3, situacao: "" }),
      ]}
    />,
  );
  expect(screen.getByText("Em andamento")).toBeInTheDocument();
  expect(screen.getByText("Concluída")).toBeInTheDocument();
  expect(screen.getByText("Não iniciada")).toBeInTheDocument();
});

it("mais de 5 ações abre com Ver mais", () => {
  render(<MeasureList planos={[plano({ acoes: "a\nb\nc\nd\ne\nf" })]} />);
  expect(screen.getByRole("button", { name: "Ver mais 1 ação" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run src/components/dashboard/MeasureList.test.tsx` → FAIL (sem `columnheader`).

- [ ] **Step 3: Reescrever `MeasureList` como tabela.**

- [ ] **Step 4: Rodar os testes** — `npm test` → PASS.

- [ ] **Step 5: Verificar no navegador** — `/implementacao-planos-de-seca`, trocar abas de estado, desktop e mobile; painel lateral de andamento/concluídas inalterado.

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/MeasureList.tsx src/components/dashboard/MeasureList.test.tsx
git commit -m "feat(implementacao): medidas recomendadas em tabela"
```

### Task 7: Verificação final

- [ ] **Step 1:** `npm test` → todos passam; `npx tsc --noEmit` → sem erros; `npm run lint` → sem erros novos.
- [ ] **Step 2:** `npm run build` → sucesso.
- [ ] **Step 3:** No navegador, em desktop (1280 px) e mobile (375 px), passar por Início, Visão Geral, Planos de Ação, Implementação, Impactos e Simulador: texto corrido justificado sem buracos grandes; títulos, botões e textos centralizados intactos; nenhuma rolagem horizontal da página. Tirar prints da home, Planos de Ação, Implementação e do botão voltar ao topo para mostrar ao usuário.
