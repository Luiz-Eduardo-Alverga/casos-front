# Brief para Claude Design — Casos Front

Documento de referência visual/layout para gerar protótipos alinhados à aplicação atual.
Baseado em `PADRAO_ESPACAMENTOS.md` e `PADRAO_COMPONENTES.md`.

---

## Contexto

App interno (gestão de casos/projetos) com **sidebar**, **header fixo** e conteúdo em **cards brancos** com sombra leve. Visual limpo, denso, corporativo — sem hero, sem marketing.

---

## Layout geral

- **Sidebar** à esquerda (expandida ~256px / colapsada ~64px)
- **Header fixo** no topo: altura **64px**, fundo branco, borda inferior sutil, sombra leve (`0 1px 3px rgba(0,0,0,0.05)`)
- Conteúdo: padding **24px** (`px-6`), topo **80px** (`pt-20`) para não ficar sob o header
- Desktop: scroll **dentro dos cards**, não na página inteira
- Mobile: empilha em coluna; scroll natural da página

---

## Tipografia / hierarquia

- Título de página: **2xl / bold**, cor texto primário
- Subtítulo: **sm**, cor texto secundário
- Título de card: **sm / semibold**, ícone **14×14px** (`h-3.5`) ao lado, gap **8px**
- Texto de tabela/lista: **xs / semibold**

---

## Cards (padrão visual obrigatório)

```
┌─────────────────────────────┐
│ [ícone] Título              │  ← header: padding 16px, pb 8px, borda inferior
├─────────────────────────────┤
│                             │  ← content: padding 24px laterais/bottom, pt 8–12px
│  campos / tabela / lista    │
│                             │
└─────────────────────────────┘
```

- Fundo: **branco** (`bg-card`)
- Cantos: **rounded-lg**
- Sombra: `shadow-card` (sutil)
- Borda do header: `border-border-divider`

### Densidades (escolher conforme a tela)

| Tipo | Header | Content | Entre campos |
|------|--------|---------|--------------|
| **Edição (atual)** | `p-4 pb-2` (16/8) | `p-6 pt-2` (24/8) | `8px` |
| **Painel / listagem (legado)** | `p-5 pb-2` | `p-6 pt-3` | mais folgado |

Para telas novas de edição, preferir a densidade **mais compacta** (primeira linha).

---

## Espaçamentos-chave

| O quê | Valor |
|-------|-------|
| Entre cards na mesma coluna | **8px** |
| Entre colunas (2 colunas) | **24px** |
| Entre seções principais | **24px** |
| Grid de filtros | **16px** (`gap-4`) |
| Coluna lateral fixa | **362px** (caso) ou **292px** (report) |
| Padding inferior da página | **48px** (`pb-12`); **96px** se houver rodapé de ações fixo |

---

## Layouts de tela comuns

### 1. Listagem / painel

- Header da página (título + ações)
- 2 colunas: esquerda (~732px ou flex) + direita (flex)
- Cards com tabela ou lista; empty state centralizado (min 200px)

### 2. Cadastro (criar)

- Página rolável
- Header do form + **2 colunas** (`gap-6`)
- Coluna principal: cards empilhados com `gap-2`
- Coluna lateral estreita (~362px) com cards/ações

### 3. Edição com abas

- Tabs no topo
- Área rolável abaixo (`mt-2`)
- Conteúdo: 1 coluna ou 2 colunas (`gap-6`)
- Cards empilhados com `gap-2`
- Rodapé fixo de ações quando necessário (reserva `pb-24`)

---

## Filtros

- Card com grid: **1 col → 2 (sm) → 4 (lg)**, gap **16px**
- Comboboxes / selects em linha

---

## Tabelas

- Fundo branco, sem hover colorido
- Separadores: borda superior `border-divider`
- Células: `py-3 px-2.5`
- Larguras fixas quando fizer sentido (ex.: status 80px)

---

## Badges (pílulas)

- Abertos: azul claro / texto azul
- Corrigidos: verde
- Retornos: laranja/vermelho
- Importância: amarelo
- Formato: `rounded-full`, numéricos compactos (~36×28px)

---

## Cores (semânticas — não inventar hex soltos)

- Fundo página: cinza bem claro
- Cards: branco
- Texto primário: cinza escuro
- Texto secundário: cinza médio
- Bordas: cinza claro / divider mais sutil
- Destructive: vermelho com fundo `destructive/10`

---

## Estados a prever no protótipo

1. **Loading** — skeleton espelhando o card real
2. **Empty** — ilustração/ícone + título + descrição centralizados
3. **Com dados** — tabela ou lista de cards internos

---

## Responsividade

- `<640px`: coluna única, botões full width
- `≥1024px`: side-by-side, scroll interno nos cards

---

## O que NÃO fazer

- Não copiar espaçamentos “bonitos” do Figma se conflitarem com a tabela de espaçamentos acima
- Não usar cards com sombra forte, cantos muito arredondados ou estilo dashboard genérico
- Não colocar conteúdo marketing no primeiro viewport
- Não hardcodar cores aleatórias — manter tokens (cinza/branco + badges coloridos)

---

## Prompt curto (versão ultra-compacta)

> Protótipo de tela interna (app Casos): sidebar + header fixo 64px branco. Conteúdo com padding 24px e pt 80px. Cards brancos `rounded-lg` com sombra leve: header com ícone 14px + título sm semibold, padding 16px/8px e borda inferior; content padding 24px laterais, 8px no topo. Entre cards na coluna: 8px; entre colunas: 24px. Coluna lateral ~362px. Densidade compacta. Grid filtros 4 colunas no desktop. Badges pílula azul/verde/laranja. Empty state e skeleton. Desktop: scroll interno nos cards. Visual corporativo limpo, sem hero.

---

**Referências:** `docs/PADRAO_ESPACAMENTOS.md`, `docs/PADRAO_COMPONENTES.md`
