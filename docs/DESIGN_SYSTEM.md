# Softlflow Design System

Brief de identidade visual para o **Claude Design** (e qualquer ferramenta de prototipação).

Use este documento ao criar **novas aplicações Softlflow** para manter a mesma linguagem visual dos produtos internos existentes (apps de gestão: sidebar + conteúdo em cards).

Não é um guia de implementação deste repositório — é a **fonte de verdade visual** da marca em produtos internos.

---

## Como usar (Claude Design)

1. Cole este arquivo (ou o prompt da seção final) no Claude Design.
2. Descreva a nova aplicação e as telas desejadas.
3. Peça protótipos que **obedeçam estritamente** a este design system.
4. Domínio e conteúdo mudam; **shell, densidade, cores e cards** permanecem.

---

## 1. Identidade Softlflow

| Aspecto | Direção |
|---------|---------|
| Marca | Softlflow |
| Tipo de produto | Apps internos / B2B (gestão operacional) |
| Tom | Corporativo, limpo, denso, funcional |
| Superfície | Fundo cinza-azulado claro + cards brancos |
| Acento de marca | Amarelo dourado (CTAs, login, destaques) |
| Navegação | Sidebar escura + header branco fixo |
| Idioma da UI | Português (Brasil) |

### O que a Softlflow parece

- Visual de **ferramenta de trabalho**, não de landing page.
- Densidade alta de informação, sem parecer apertado.
- Pouca cor no chrome; cor só em status, badges e CTAs de marca.
- Cantos suaves (8px), sombras quase invisíveis.
- Sem hero, sem gradientes decorativos no dashboard, sem “AI purple”, sem glassmorphism.

### Teste de identidade

Se remover o logo e a tela ainda puder ser confundida com um dashboard genérico (roxo, cards flutuantes, stats strips), **não está Softlflow**.

---

## 2. Princípios de design

1. **Uma composição por viewport** — shell estável (sidebar + header + conteúdo), sem marketing.
2. **Cards como unidade de conteúdo** — quase tudo mora em card branco com header leve.
3. **Tokens, não hex soltos** — cores semânticas nomeadas; não inventar paleta por tela.
4. **Densidade compacta** — preferir espaçamentos do sistema aos “espaços bonitos” genéricos.
5. **Estados sempre previstos** — loading (skeleton), vazio, com dados.
6. **Cor com propósito** — cinza/branco no layout; azul/verde/vermelho/amarelo só em status e marca.

---

## 3. Paleta (valores canônicos)

Valores em HSL (como no produto) e hex aproximado para uso em design.

### 3.1. Superfícies e texto (light — padrão)

| Token | HSL | Hex ≈ | Uso |
|-------|-----|-------|-----|
| `page-background` | `220 14% 96%` | `#F1F3F5` | Fundo da área de conteúdo |
| `card` / branco | `0 0% 100%` | `#FFFFFF` | Cards, header, popovers |
| `text-primary` | `215 28% 17%` | `#1E2A3A` | Títulos e texto principal |
| `text-secondary` | `215 16% 47%` | `#667788` | Subtítulos, metadados |
| `text-label` | `215 20% 35%` | `#475569` | Labels de formulário |
| `border` | `220 13% 91%` | `#E2E5EA` | Bordas de input/card |
| `border-divider` | `220 14% 96%` | `#F1F3F5` | Divisor do header do card |
| `muted` | `220 14.3% 95.9%` | `#F1F3F5` | Fundos suaves / hover leve |
| `primary` | `223 23% 15%` | `#1E2430` | Botão primário escuro |
| `destructive` | `0 84% 60%` | `#EF4444` | Erro / exclusão |
| `brand-yellow` | `48 93% 61%` | `#F5C842` | Acento Softlflow |
| `brand-yellow-hover` | `48 93% 55%` | `#F0BE2A` | Hover do acento |

### 3.2. Sidebar

| Token | HSL | Hex ≈ | Uso |
|-------|-----|-------|-----|
| `sidebar-bg` | `215 25% 20%` | `#263344` | Fundo |
| `sidebar-border` | `215 20% 30%` | `#3D4A5C` | Separadores |
| `sidebar-text` | `215 10% 80%` | `#C5CAD3` | Item / texto |
| `sidebar-text-muted` | `222 17% 63%` | `#8B93A7` | Ícones / secundário |
| `sidebar-section-label` | `228 18% 36%` | `#4A5168` | Labels de seção |

### 3.3. Status / badges (pílulas)

| Semântica | Texto HSL | Fundo HSL | Hex texto ≈ | Hex fundo ≈ |
|-----------|-----------|-----------|-------------|-------------|
| Info / abertos | `217 91% 60%` | `217 95% 93%` | `#3B82F6` | `#DBEAFE` |
| Sucesso / ok | `142 76% 36%` | `142 76% 95%` | `#16A34A` | `#DCFCE7` |
| Erro / retorno | `0 84% 60%` | `0 93% 94%` | `#EF4444` | `#FEE2E2` |
| Atenção / importância | `43 96% 56%` | `43 96% 95%` | `#F5C518` | `#FEF9C3` |

Formato: `rounded-full`, texto `xs` / semibold, padding horizontal compacto.

### 3.4. Login (tela de autenticação)

| Elemento | Valor |
|----------|-------|
| Fundo | Gradiente `216 14% 36%` → `214 18% 21%` (cinza-azulado escuro, ~126°) |
| Texto do banner | Quase branco `252 100% 99%` |
| Botão principal | Gradiente amarelo `46 88% 60%` → `42 79% 57%` |
| Texto do botão | Cinza escuro `225 5% 28%` |
| Input | Fundo branco, borda `220 14% 91%`, placeholder cinza |

Login é a única superfície com gradiente forte. No dashboard, **não** repetir esse gradiente de fundo.

### 3.5. Dark mode (resumo)

Quando existir tema escuro:

- Página: ~`215 28% 13%`
- Card: ~`215 25% 20%`
- Texto: quase branco `210 20% 98%`
- Bordas: ~`215 20% 26%`
- Manter `brand-yellow` e badges com contraste ajustado
- Login pode permanecer visualmente igual ao light

### 3.6. Regras de cor

- **Não** usar roxo/índigo como tema geral da app.
- **Não** usar creme quente + serif + terracota.
- Destructive em ações: fundo suave `destructive` ~10% de opacidade + texto vermelho.
- Seleção ativa em telas de configuração pode usar azul índigo pontual — não como cor de marca global.

---

## 4. Tipografia

Fonte do sistema / sans neutra (ex.: stack do sistema ou equivalente sans clean). Sem display serif, sem fonte “marketing”.

| Papel | Tamanho | Peso | Cor |
|-------|---------|------|-----|
| Título de página | ~24px (`2xl`) | Bold | `text-primary` |
| Subtítulo de página | ~14px (`sm`) | Regular | `text-secondary` |
| Título de card | ~14px (`sm`) | Semibold | `text-primary` |
| Label | ~14px (`sm`) | Medium/Regular | `text-label` |
| Corpo / campo | ~14px (`sm`) | Regular | `text-primary` |
| Célula de tabela / lista densa | ~12px (`xs`) | Semibold | `text-primary` |
| Auxiliar / hint | ~12–14px | Regular | `text-secondary` |

Ícone ao lado do título do card: **14×14px**, gap **8px**.

---

## 5. Radius, sombra, ícones

| Token | Valor |
|-------|-------|
| Radius base | **8px** (`0.5rem`) |
| Cards / botões / inputs | **8px** |
| Badges de status | **pill** (`9999px`) |
| Sombra de card | `0 2px 6px rgba(0,0,0,0.04)` — quase imperceptível |
| Sombra do header | `0 1px 3px rgba(0,0,0,0.05)` |
| Ícones | Lucide (ou set equivalente: outline, 1.5–2px stroke) |
| Ícone em botão | 16×16px |
| Ícone em header de card | 14×14px |

Evitar: sombra multicamada pesada, glow, cantos 16px+ em cards de conteúdo.

---

## 6. Shell da aplicação

```
┌──────────────┬────────────────────────────────────┐
│              │  Header 64px (branco, fixo)        │
│   Sidebar    ├────────────────────────────────────┤
│  256px / 64  │  Conteúdo                          │
│   (escura)   │  padding 24px · topo 80px          │
│              │  fundo page-background             │
└──────────────┴────────────────────────────────────┘
```

| Elemento | Spec |
|----------|------|
| Sidebar expandida | 256px |
| Sidebar colapsada | 64px (só ícones) |
| Header | 64px, branco, borda inferior sutil |
| Conteúdo | padding lateral 24px; topo 80px (compensa header) |
| Padding inferior | 48px; 96px se houver barra de ações fixa |
| Mobile (`<1024px`) | Sidebar em overlay; conteúdo empilhado |

Desktop (`≥1024px`): preferir scroll **dentro dos cards** em painéis densos.  
Mobile: scroll natural da página; botões full width quando fizer sentido.

---

## 7. Espaçamentos (obrigatórios)

| Contexto | Valor |
|----------|-------|
| Entre cards na mesma coluna | **8px** |
| Entre colunas (layout 2 colunas) | **24px** |
| Entre seções principais | **24px** |
| Grid de filtros | **16px** |
| Ícone ↔ título no card | **8px** |
| Entre campos no formulário (densidade atual) | **8px** |
| Coluna lateral típica | **~360px** (pode variar 292–362) |

Escala mental: 8 / 16 / 24. Evitar “meio termo” aleatório (12, 18, 20) salvo necessidade pontual.

---

## 8. Card Softlflow (padrão obrigatório)

Unidade visual principal de qualquer tela interna.

```
┌─────────────────────────────────┐
│ [ícone 14]  Título do card      │  ← header: 16px laterais/topo, 8px bottom
│─────────────────────────────────│     borda inferior divider
│                                 │
│  conteúdo (form / tabela / lista)│  ← 24px laterais/bottom, 8px top
│                                 │
└─────────────────────────────────┘
```

| Propriedade | Valor |
|-------------|-------|
| Fundo | Branco |
| Radius | 8px |
| Sombra | Sutil (`shadow-card`) |
| Header | Ícone + título `sm/semibold`; borda inferior divider |
| Content | Padding 24 / 8 (laterais-bottom / top) |
| Empilhamento | Cards na coluna com gap 8px |

### Densidade

| Uso | Header | Content | Entre campos |
|-----|--------|---------|--------------|
| **Padrão atual (preferir)** | 16px / 8px bottom | 24px / 8px top | 8px |
| Legado / painéis mais folgados | 20px / 8px bottom | 24px / 12px top | 16px |

Telas novas → densidade compacta.

---

## 9. Layouts de tela recorrentes

### 9.1. Listagem / painel

- Título + ações no topo
- Card de filtros (grid 1 → 2 → 4 colunas)
- Card(s) de tabela ou lista
- Empty state centralizado (mín. ~200px de altura)

### 9.2. Cadastro / criar

- Página rolável
- Duas colunas no desktop (gap 24px)
- Coluna principal: cards empilhados (gap 8px)
- Coluna lateral estreita (~360px): resumo, status, ações

### 9.3. Edição com abas

- Tabs no topo (abaixo do header da página)
- Conteúdo rolável
- 1 ou 2 colunas; cards empilhados com gap 8px
- Opcional: rodapé fixo de ações (Salvar / Cancelar) com reserva de espaço inferior

### 9.4. Login

- Split ou banner com gradiente escuro Softlflow
- Formulário branco limpo
- CTA amarelo (gradiente da marca)
- Sem sidebar/header do dashboard

---

## 10. Componentes — especificação visual

### Botões

| Variante | Aparência |
|----------|-----------|
| Primary | Fundo `primary` (cinza escuro), texto claro, radius 8px, altura ~36px |
| Brand / Login CTA | Amarelo Softlflow (sólido ou gradiente no login) |
| Outline | Borda `border`, fundo branco, hover muted |
| Secondary | Fundo cinza claro |
| Ghost | Sem borda; hover muted |
| Destructive | Vermelho sólido **ou** fundo vermelho 10% + texto vermelho (ações perigosas em contexto) |
| Disabled | Opacidade ~50% |

### Inputs / selects / combobox

- Altura ~36px (compacto ~32px)
- Borda cinza clara, radius 8px
- Focus: ring na cor `primary` / ring do sistema
- Placeholder em cinza médio
- Preferir botão limpar (X) quando houver valor

### Tabelas

- Fundo branco
- Separadores sutis (divider)
- Células: padding vertical ~12px, horizontal ~10px
- Tipografia densa (`xs` / semibold em células-chave)
- Sem zebra agressiva; hover leve opcional (`table-row-hover`)

### Badges

- Pílulas com par texto+fundo das cores de status (§3.3)
- Contadores compactos

### Tabs

- Sublinhado ou pill discreto; alinhadas ao texto primário
- Sem estilo “marketing tabs”

### Modais / sheets

- Superfície branca, radius 8px, sombra sutil
- Header com título; ações no rodapé (outline + primary)

### Skeleton

- Blocos cinza claro (`muted`) espelhando o layout real do card

### Empty state

- Ícone ou ilustração simples + título + descrição curta
- Centralizado no card
- Sem ilustrações 3D genéricas de stock se destoarem do tom corporativo

---

## 11. Motion

- Curto e funcional: hover, abertura de modal/sidebar (~200–300ms)
- Sem parallax, sem Lottie decorativo no dashboard
- Sidebar: transição de largura suave

---

## 12. Responsividade

| Breakpoint | Comportamento |
|------------|---------------|
| `< 640px` | 1 coluna; filtros empilhados; botões full width |
| `640–1023px` | Grids 2 colunas; sidebar overlay |
| `≥ 1024px` | Sidebar fixa; 2 colunas; scroll interno em painéis |

---

## 13. Checklist do protótipo Softlflow

- [ ] Sidebar escura + header 64px branco
- [ ] Fundo `page-background` (cinza-azulado claro)
- [ ] Cards brancos 8px, sombra leve, header com ícone 14px
- [ ] Gaps: 8px entre cards, 24px entre colunas, 16px em filtros
- [ ] Tipografia: título 2xl bold; card title sm semibold
- [ ] Amarelo Softlflow só em CTA/marca — não como fundo de página
- [ ] Badges de status em pílula (azul/verde/vermelho/amarelo)
- [ ] Skeleton + empty + com dados
- [ ] Sem hero, sem roxo genérico, sem cards com sombra forte
- [ ] Textos de UI em português

---

## 14. Anti-padrões (não fazer)

- Landing / hero / stats strip no primeiro viewport de app interno
- Tema roxo-indigo ou “AI SaaS gradient”
- Cards com `rounded-2xl`, sombra pesada ou glass
- Espaçamentos folgados tipo marketing (32–48px entre tudo)
- Cores hex inventadas por tela
- Sidebar clara com o mesmo peso visual dos cards (quebra o contraste Softlflow)
- Overuse de amarelo (marca é acento, não canvas)

---

## 15. Prompt pronto — Claude Design

Copie e cole, ajustando só o trecho `[DESCRIÇÃO DA NOVA APP / TELAS]`:

```
Você é o designer da Softlflow. Crie protótipos de alta fidelidade para uma NOVA aplicação interna, obedecendo estritamente ao Softlflow Design System abaixo.

IDENTIDADE
- Produto interno Softlflow (B2B/gestão). Visual corporativo, limpo, denso, funcional.
- NÃO é landing page. Sem hero, sem marketing, sem glassmorphism, sem tema roxo.

SHELL
- Sidebar esquerda escura (#263344), 256px expandida / 64px colapsada.
- Header fixo 64px branco, borda inferior sutil, sombra 0 1px 3px rgba(0,0,0,0.05).
- Conteúdo: fundo #F1F3F5, padding 24px, topo 80px.

CARDS (unidade principal)
- Branco, radius 8px, sombra 0 2px 6px rgba(0,0,0,0.04).
- Header: ícone 14×14 + título 14px semibold (#1E2A3A), padding 16px / bottom 8px, divider #F1F3F5.
- Content: padding 24px laterais/bottom, 8px top.
- Entre cards na coluna: 8px. Entre colunas: 24px. Coluna lateral ~360px.

TIPOGRAFIA
- Título página: 24px bold #1E2A3A
- Subtítulo: 14px #667788
- Células densas: 12px semibold

CORES DE MARCA / STATUS
- Acento Softlflow: amarelo #F5C842 (CTAs; no login botão em gradiente amarelo)
- Primary button dashboard: cinza escuro #1E2430
- Badges pílula: azul info, verde sucesso, vermelho erro, amarelo atenção (fundo pastel + texto saturado)

COMPONENTES
- Botões ~36px, radius 8px (primary / outline / ghost / destructive)
- Inputs ~36px, borda #E2E5EA, radius 8px
- Filtros em grid 1 → 2 → 4 colunas, gap 16px
- Tabelas limpas, separadores sutis
- Sempre incluir estados: skeleton, empty, com dados

RESPONSIVO
- <1024px: sidebar overlay, coluna única
- ≥1024px: side-by-side; scroll interno nos cards em painéis densos

PEDIDO
[DESCRIÇÃO DA NOVA APP / TELAS]

Entregue telas desktop (e mobile se pedido) consistentes com este sistema. Não inventar outra paleta nem outro shell.
```

---

## 16. Prompt curto (versão mínima)

> App interno Softlflow: sidebar escura 256px + header branco 64px. Fundo #F1F3F5. Cards brancos radius 8px sombra leve; header com ícone 14px + título 14px semibold; padding header 16/8, content 24/8. Gap 8px entre cards, 24px entre colunas, lateral ~360px. Tipografia densa. Acento amarelo #F5C842 só em CTA. Badges pílula azul/verde/vermelho/amarelo. Filtros grid 4 col desktop. Skeleton + empty. Visual corporativo limpo — sem hero, sem roxo, sem sombra forte.
