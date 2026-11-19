# Softflow — Design System

Fonte única do visual do Softflow: identidade, tokens, espaçamentos e padrões de componente já
implementados. Serve para implementar telas (Claude Code) e para prototipar (Claude Design).

**Fonte de verdade dos valores:** `app/globals.css` (variáveis CSS) e `tailwind.config.ts`
(registro das cores). Este documento resume e explica; se divergir do código, o código vence e
este arquivo deve ser corrigido.

> Consolidado em 2026-11-17 a partir dos antigos `DESIGN_SYSTEM`, `BRIEF_CLAUDE_DESIGN` e
> `PADRAO_ESPACAMENTOS`. Padrões de código de componente (skeleton, hooks, formulários) ficam
> em [`padrao-front/`](padrao-front/README.md).

---

## 1. Identidade

| Aspecto | Direção |
|---------|---------|
| Produto | Softflow — ferramenta interna da Softcom (gestão operacional) |
| Tom | Corporativo, limpo, denso, funcional |
| Superfície | Fundo cinza-azulado claro + cards brancos |
| Acento de marca | Amarelo dourado (login, destaques pontuais) |
| Navegação | Sidebar escura + header branco fixo |
| Idioma da UI | Português (Brasil) |

- Visual de **ferramenta de trabalho**, não de landing page. Densidade alta sem parecer apertado.
- Pouca cor no chrome; cor só em status, badges e CTAs de marca.
- Cantos suaves (8px), sombras quase invisíveis.
- **Teste de identidade:** se remover o logo e a tela puder ser confundida com um dashboard
  genérico (roxo, cards flutuantes, stats strips), não está Softflow.

### Princípios

1. Uma composição por viewport: shell estável (sidebar + header + conteúdo), sem marketing.
2. Cards como unidade de conteúdo.
3. Tokens, não hex soltos.
4. Densidade compacta.
5. Estados sempre previstos: skeleton, vazio, erro, com dados.
6. Cor com propósito: cinza/branco no layout; azul/verde/vermelho/amarelo só em status e marca.

---

## 2. Tokens de cor (implementados)

Todos em HSL em `app/globals.css` (`:root` e `.dark`), registrados em `tailwind.config.ts`.
Uso no código sempre pela classe (`bg-card`, `text-text-primary`), nunca pelo valor.

### 2.1. Base (shadcn)

`background`, `foreground`, `card`, `popover`, `primary` (`223 23% 15%`, botão primário
**escuro**), `secondary`, `muted`, `accent`, `destructive` (`0 84% 60%`), `border`, `input`,
`ring`, `chart-1..5`. Radius base `--radius: 0.5rem`.

### 2.2. Superfícies e texto do app

| Token | HSL | Hex ≈ | Uso |
|-------|-----|-------|-----|
| `page-background` | `220 14% 96%` | `#F1F3F5` | Fundo da área de conteúdo |
| `card` | `0 0% 100%` | `#FFFFFF` | Cards, header, popovers |
| `text-primary` | `215 28% 17%` | `#1E2A3A` | Títulos e texto principal |
| `text-secondary` | `215 16% 47%` | `#667788` | Subtítulos, metadados |
| `text-label` | `215 20% 35%` | `#475569` | Labels de formulário |
| `text-error` | `0 84% 60%` | `#EF4444` | Mensagem de erro de campo |
| `border-input` | `220 13% 91%` | `#E2E5EA` | Borda de input |
| `border-divider` | `220 14% 96%` | `#F1F3F5` | Divisor do header do card |
| `border-strong` | `0 0% 88%` | | Borda de maior contraste |
| `table-row-bg` / `table-row-hover` | | | Linhas de tabela |
| `surface-elevated` | `0 0% 100%` | | Superfície elevada |
| `brand-yellow` / `brand-yellow-hover` | `48 93% 61%` / `48 93% 55%` | `#F5C842` | Acento Softflow |

### 2.3. Sidebar

`sidebar-bg` (`215 25% 20%`, `#263344`), `sidebar-border`, `sidebar-text`,
`sidebar-text-secondary`, `sidebar-text-muted`, `sidebar-section-label`.

### 2.4. Status e badges

| Semântica | Tokens | Cor |
|-----------|--------|-----|
| Abertos / info | `panel-badge-open`, `panel-badge-open-bg` | Azul |
| Corrigidos / ok | `panel-badge-fixed`, `panel-badge-fixed-bg` | Verde |
| Retornos / erro | `panel-badge-return`, `panel-badge-return-bg` | Vermelho |
| Importância; também linha recém-criada e selo "Novo" (clonar projeto, `text-primary` no selo) e faixa/bolinha de linha alterada não salva (lista de Stakes) | `panel-badge-importance-yellow`, `panel-badge-importance-yellow-bg` | Amarelo |
| Genéricos; `status-info` também é a faixa de linha nova não salva (lista de Stakes) | `status-success`, `status-warning`, `status-info` | Verde / laranja / azul |

Formato: `rounded-full`, texto `xs` semibold, padding horizontal compacto.

### 2.5. Famílias por área

| Prefixo | Área |
|---------|------|
| `panel-*` | Painel do desenvolvedor (Kanban, cards do painel) |
| `login-*` | Tela de login (gradiente escuro, botão amarelo em gradiente) |
| `papeis-*` | Perfis de acesso (Configurações → RBAC) |
| `public-*` | Telas públicas (ex.: documentação pública de adquirentes) |
| `audit-*` | Auditoria de horas (conforme, alerta leve, alerta crítico, inconsistência) |
| `cases-ink` | Texto de alto contraste em casos |

Sombras: `shadow-card` (`0 2px 6px rgba(0,0,0,0.04)`) e `shadow-kanban-card`.

### 2.6. Regras de cor

- Proibido hex/rgb/hsl literal em `className` ou `style` (`bg-[#fff]`, `bg-white`, `text-black`).
- Token faltando: adicionar a variável em `app/globals.css` (light e `.dark`) **e** registrar em
  `tailwind.config.ts`. Nunca resolver no componente. Se a tela pedir uma cor que não existe aqui,
  **parar e confirmar com o usuário** antes de criar.
- Não usar roxo/índigo como tema geral (índigo só pontual, ex.: seleção em Perfis de acesso).
- Destructive em ações: fundo `destructive/10` + texto vermelho.
- Login é a única superfície com gradiente forte; não repetir no dashboard.
- Dark mode existe em `.dark`; todo token novo precisa do par.

---

## 3. Tipografia, radius, ícones

| Papel | Tamanho | Peso | Cor |
|-------|---------|------|-----|
| Título de página | `2xl` | Bold | `text-primary` |
| Subtítulo de página | `sm` | Regular | `text-secondary` |
| Título de card | `sm` | Semibold | `text-primary` |
| Label | `sm` | Medium | `text-label` |
| Corpo / campo | `sm` | Regular | `text-primary` |
| Célula de tabela densa | `xs` | Semibold | `text-primary` |

- Fonte sans do sistema; sem serif display.
- Radius 8px em cards, botões e inputs; badges em pílula.
- Ícones Lucide. Header de card: 14px (`h-3.5 w-3.5`), gap 8px. Em botão: 16px.

---

## 4. Shell da aplicação

```
┌──────────────┬────────────────────────────────────┐
│              │  Header 64px (branco, fixo)        │
│   Sidebar    ├────────────────────────────────────┤
│  256px / 64  │  Conteúdo                          │
│   (escura)   │  px-6 · pt-20 · page-background    │
└──────────────┴────────────────────────────────────┘
```

- O shell **já existe** (`components/sidebar/app-sidebar.tsx` e o layout de `app/(dashboard)`).
  Nunca criar outro AppShell, Sidebar ou Header; telas novas são só o conteúdo.
- Conteúdo: `px-6`, `pt-20` (compensa o header), `pb-12`; `pb-24` com rodapé de ações fixo.
- Desktop (`≥1024px`): scroll **dentro dos cards**. Mobile: coluna única, scroll da página,
  sidebar em overlay.

---

## 5. Espaçamentos

Escala 8 / 16 / 24. Evitar 12, 18, 20 sem necessidade. Os valores do Figma podem diferir do
implementado: **este documento vence o Figma**.

| Contexto | Classes |
|----------|---------|
| Cards na mesma coluna | `flex flex-col gap-2` (8px) |
| Entre colunas / seções | `gap-6` (24px), `lg:flex-row` |
| Coluna lateral | `lg:w-[362px]` (caso), `lg:w-[292px]` (report) |
| Grid de filtros | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` |
| Campos dentro do card | `space-y-2` |

### 5.1. Card (padrão atual)

```tsx
<Card className="rounded-lg bg-card shadow-card">
  <CardHeader className="border-b border-border-divider p-4 pb-2">
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-text-primary" />
      <CardTitle className="text-sm font-semibold text-text-primary">Título</CardTitle>
    </div>
  </CardHeader>
  <CardContent className="space-y-2 p-6 pt-2">{/* campos */}</CardContent>
</Card>
```

- Em edição de caso, usar `CasoEditCardHeader` (`components/casos/edicao/caso-edit-card-header.tsx`).
- Card sem header (ex.: status na coluna do caso): `p-4` no `CardContent`.
- **Legado:** telas antigas do painel usam header `p-5 pb-2` e content `p-6 pt-3 space-y-4`. Ao
  refatorar ou criar telas, migrar para o padrão atual.

### 5.2. Edição com abas (layout shell)

| Camada | Classes |
|--------|---------|
| Container de abas | `flex flex-col flex-1 min-h-0 lg:overflow-hidden` |
| Área rolável | `mt-2 flex-1 flex flex-col min-h-0 overflow-auto` |
| Reserva do rodapé | `flex-1 pb-12` ou `pb-24` (com rodapé de ações fixo) |
| `TabsContent` | `mt-0 flex flex-1 flex-col min-h-0 data-[state=inactive]:hidden` |
| Conteúdo da aba (bloco único/colunas) | `flex min-h-0 flex-1 flex-col gap-6 min-w-0` |
| Conteúdo da aba (cards empilhados) | `flex min-h-0 flex-1 flex-col gap-2 min-w-0` |

Não usar `mb-4` por aba no lugar de `pb-12`/`pb-24`. Referências:
`components/casos/edicao/caso-edit-form.tsx`, `components/projetos/edicao/projeto-edit-form.tsx`.

### 5.3. Cadastro (criar caso / report)

| Camada | Classes |
|--------|---------|
| Página rolável | `flex-1 overflow-auto px-6 pb-12 pt-20` |
| Bloco do formulário | `flex flex-col gap-6` |
| Colunas | `flex min-h-0 flex-col gap-6 lg:flex-row` |
| Coluna principal | `flex min-h-0 min-w-0 flex-1 flex-col gap-2` |
| Coluna lateral | `gap-2` + largura fixa (362/292px) |

`CreateFormHeader` não tem margem inferior; o espaço vem do `gap-6` do pai.

### 5.4. Checklist de nova tela de edição

- [ ] Área rolável `mt-2 overflow-auto min-h-0`; wrapper `pb-12` ou `pb-24`
- [ ] `TabsContent` com `mt-0`, flex e `data-[state=inactive]:hidden`
- [ ] Wrapper da aba `gap-6` ou `gap-2`
- [ ] Card header `p-4 pb-2 border-b border-border-divider`; content `p-6 pt-2 space-y-2`

---

## 6. Layouts recorrentes

1. **Listagem / painel:** título + subtítulo + ações; card de filtros (grid até 4 colunas);
   card de tabela/lista com infinite scroll; empty state centralizado (mín. ~200px).
2. **Cadastro:** página rolável, 2 colunas (principal + lateral), ações no rodapé.
3. **Edição com abas:** tabs no topo, cards empilhados, coluna lateral em caso/report, rodapé
   fixo de salvar quando necessário.
4. **Login:** banner com gradiente escuro, formulário branco, CTA amarelo; sem shell.

---

## 7. Componentes (visual)

- **Botões** ~36px, radius 8px: primary (escuro), outline, secondary, ghost, destructive
  (sólido ou `destructive/10` + texto vermelho). Amarelo só no CTA de login/marca.
- **Inputs / combobox** ~36px (compacto ~32px), borda `border-input`, botão limpar (X) quando há
  valor. Combobox de domínio: reaproveitar `@/components/fields` (ver
  [`padrao-front/`](padrao-front/README.md)).
- **Select, combobox, multi-select e seletor de mês têm um gatilho só** (unificado em 2026-11-19,
  com o `SelectTrigger` como referência): radius 8px, borda `border-input`, `shadow-sm`, fundo
  transparente (sem `bg-background`, que no escuro vira uma caixa mais escura), **sem fundo no
  hover**, texto `sm` regular em `foreground` (placeholder `muted-foreground`), anel de foco de 1px
  (`ring-1 ring-ring`) e ícone **`ChevronDown`** com `opacity-50` (não usar `ChevronsUpDown`).
  Valem `components/ui/select.tsx`, `components/ui/combobox.tsx`, `components/ui/v2/combobox2.tsx`
  (input e chips) e `components/fields/mes-picker.tsx`. Não sobrescrever com `font-medium`/
  `font-semibold` no gatilho de campo de formulário.
- **Inputs, textarea e campo de data** seguem o mesmo padrão de caixa: `components/ui/input.tsx`,
  `components/ui/textarea.tsx` e `components/ui/input-group.tsx` (usado pelo `DatePickerInput`)
  têm radius 8px (`rounded-lg`) na base, fundo transparente e `shadow-sm`; o texto da data é
  regular. Ajustado em 2026-11-19 (antes: `rounded-md` 6px, e o grupo da data com `bg-background`,
  `dark:bg-input/30` e `shadow-xs`, classe que não existe no Tailwind do projeto).
- **Tabelas:** fundo branco, separador `border-divider`, células `py-3 px-2.5`, sem zebra.
- **Badges:** pílulas da seção 2.4; contadores compactos (~36×28px).
- **Tabs:** sublinhado ou pill discreto.
- **Modais / sheets:** branco, radius 8px, ações no rodapé (outline + primary).
  `DialogContent` aceita `showCloseButton={false}` (some o X) e `overlayClassName`. Janela
  bloqueante: sem X, `preventDefault` em `onEscapeKeyDown` / `onPointerDownOutside` /
  `onInteractOutside` e `role="alertdialog"`; acima de outros modais e do mini-player do caso use
  `z-[80]` no conteúdo e no overlay. Referência: aviso automático
  (`components/avisos/aviso-automatico/`).
- **Skeleton:** blocos `muted` espelhando o layout real.
- **Empty state:** `EmptyState` (`@/components/painel/empty-state`), ícone/ilustração + título +
  descrição curta. Ilustrações do painel em `public/images/empty-state-*.svg` (exportadas do
  [Figma SoftFlow](https://www.figma.com/design/kqpFqgT0lp8SgCTejjlUiP/SoftFlow?node-id=116-2314);
  ao trocar, manter os nomes dos arquivos).
- **Motion:** curto e funcional (~200–300ms); sem parallax nem Lottie decorativo.

### Responsividade

| Breakpoint | Comportamento |
|------------|---------------|
| `< 640px` | 1 coluna; filtros empilhados; botões full width |
| `640–1023px` | Grids 2 colunas; sidebar overlay |
| `≥ 1024px` | Sidebar fixa; 2 colunas; scroll interno nos cards |

---

## 8. Anti-padrões

- Hero, stats strip ou conteúdo de marketing no primeiro viewport.
- Tema roxo-índigo, "AI gradient", glassmorphism.
- Cards `rounded-2xl`, sombra pesada.
- Espaçamentos folgados de marketing (32–48px entre tudo).
- Cores hex inventadas por tela; amarelo como canvas.
- Sidebar clara com o mesmo peso visual dos cards.

---

## 9. Prototipação (Claude Design)

Protótipos devem parecer **tela nativa do Softflow**: criatividade no fluxo, fidelidade no
visual. Usar junto com [`contexto-projeto-softflow.md`](contexto-projeto-softflow.md)
(vocabulário e módulos). O protótipo de uma funcionalidade vai em `docs/<slug>/prototipo/` e é
referência de estrutura e hierarquia: na implementação, traduzir para os componentes e tokens
acima; nunca copiar hex nem estilo inline do protótipo.

Checklist do protótipo:

- [ ] Sidebar escura + header 64px branco; fundo `page-background`
- [ ] Cards brancos 8px, sombra leve, header com ícone 14px
- [ ] Gaps: 8px entre cards, 24px entre colunas, 16px em filtros
- [ ] Amarelo só em CTA/marca; badges de status em pílula
- [ ] Skeleton + vazio + erro + com dados; textos em pt-BR

### Prompt pronto

```
Você é o designer do Softflow (ferramenta interna da Softcom). Crie protótipos de alta
fidelidade obedecendo estritamente a este design system.

IDENTIDADE: corporativo, limpo, denso, funcional. Sem hero, sem marketing, sem glassmorphism,
sem tema roxo. UI em pt-BR.

SHELL: sidebar esquerda escura (#263344), 256px / 64px colapsada. Header fixo 64px branco,
borda inferior sutil. Conteúdo: fundo #F1F3F5, padding 24px, topo 80px.

CARDS: branco, radius 8px, sombra 0 2px 6px rgba(0,0,0,0.04). Header: ícone 14px + título 14px
semibold (#1E2A3A), padding 16px / bottom 8px, divisor #F1F3F5. Content: 24px laterais/bottom,
8px topo. Entre cards: 8px. Entre colunas: 24px. Coluna lateral ~360px.

TIPOGRAFIA: título 24px bold; subtítulo 14px #667788; células densas 12px semibold.

CORES: botão primário cinza escuro #1E2430; acento amarelo #F5C842 só em CTA/login.
Badges pílula: azul (abertos), verde (corrigidos), vermelho (retornos), amarelo (importância).

COMPONENTES: botões e inputs ~36px radius 8px; filtros em grid 1→2→4 colunas gap 16px;
tabelas limpas; sempre skeleton, vazio e com dados.

RESPONSIVO: <1024px sidebar overlay e coluna única; ≥1024px scroll interno nos cards.

PEDIDO
[DESCRIÇÃO DAS TELAS]
```
