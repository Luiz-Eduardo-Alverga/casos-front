# Padrão de Espaçamentos - Casos Front

Este documento descreve o padrão de espaçamentos de cards, formulários de edição e layout de abas. **IMPORTANTE**: Os espaçamentos do Figma podem diferir dos valores implementados. Sempre use este documento como referência ao implementar telas do Figma.

Referências principais: `components/casos/edicao/caso-edit-form.tsx`, `components/projetos/edicao/projeto-edit-form.tsx`, `components/casos/edicao/caso-edit-card-header.tsx`.

---

## Telas de edição com abas (layout shell)

Estrutura comum em **Edição de Caso** e **Edição de Projeto**:

| Camada | Classes | Descrição |
|--------|---------|-----------|
| Container de abas | `flex flex-col flex-1 min-h-0 lg:overflow-hidden` | Coluna principal da página |
| Área rolável | `mt-2 flex-1 flex flex-col min-h-0 overflow-auto` | 8px abaixo do header de abas |
| Reserva do rodapé fixo | `flex-1 pb-12` ou `pb-24` | `pb-24` quando há rodapé de ações fixo (ex.: aba Abertura do projeto); `pb-12` nos demais casos |
| Entre colunas (layout 2 colunas) | `gap-6 lg:flex-row` | 24px entre coluna principal e lateral (362px) |
| `TabsContent` | `mt-0 flex flex-1 flex-col min-h-0 data-[state=inactive]:hidden` | Remove margem do Radix; aba inativa não ocupa layout |
| Conteúdo da aba (bloco único) | `flex min-h-0 flex-1 flex-col gap-6 min-w-0` | Uma seção principal ou colunas lado a lado |
| Conteúdo da aba (vários cards empilhados) | `flex min-h-0 flex-1 flex-col gap-2 min-w-0` | Ex.: Stakes, Risco, Clientes + Classificação |

**Não usar** `mb-4` (ou margens por aba) no lugar de `pb-12` / `pb-24` no wrapper interno.

### Exemplo (edição de projeto)

```tsx
<Tabs className="flex min-h-0 flex-1 flex-col lg:overflow-hidden">
  <ProjetoEditHeader />

  <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-auto">
    <div className={cn("flex-1", exibirRodapeAcoes ? "pb-24" : "pb-12")}>
      <TabsContent
        value="stakes"
        className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-2 min-w-0">
          <AbaStakes />
        </div>
      </TabsContent>
    </div>
  </div>
</Tabs>
```

---

## Telas de cadastro (criar caso / report)

Estrutura em `caso-create/index.tsx` e `report-create/index.tsx`:

| Camada | Classes | Descrição |
|--------|---------|-----------|
| Página rolável | `flex-1 overflow-auto px-6 pb-12 pt-20` | Padding inferior alinhado ao padrão (`pb-12`) |
| Bloco do formulário | `flex flex-col gap-6` | 24px entre header de página e colunas |
| Colunas | `flex min-h-0 flex-col gap-6 lg:flex-row` | 24px entre coluna principal e lateral |
| Coluna principal (cards empilhados) | `flex min-h-0 min-w-0 flex-1 flex-col gap-2` | 8px entre cards; `mt-auto` no último card quando necessário |
| Coluna lateral | `gap-2` + `lg:w-[362px]` (caso) ou `lg:w-[292px]` (report) | Cards e ações com 8px entre si |

O `CreateFormHeader` não define margem inferior; o espaçamento vem do `gap-6` do wrapper pai.

---

## Espaçamentos de Cards (edição — padrão atual)

### Estrutura padrão

```tsx
<Card className="rounded-lg bg-card shadow-card">
  <CardHeader className="border-b border-border-divider p-4 pb-2">
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-text-primary" />
      <CardTitle className="text-sm font-semibold text-text-primary">Título</CardTitle>
    </div>
  </CardHeader>
  <CardContent className="space-y-2 p-6 pt-2">
    {/* campos */}
  </CardContent>
</Card>
```

Em edição de caso, preferir o componente `CasoEditCardHeader` (`p-4 pb-2`, `gap-2`, `border-b border-border-divider`).

### Detalhamento

| Elemento | Classes | Descrição |
|----------|---------|-----------|
| **Card Header** | `p-4 pb-2` + `border-b border-border-divider` | 16px lateral/top; 8px abaixo do título |
| **Ícone e título** | `gap-2` | 8px entre ícone e texto |
| **Card Content** | `p-6 pt-2` | 24px laterais/bottom; 8px no topo (após o header) |
| **Campos verticais no content** | `space-y-2` | 8px entre campos/blocos |
| **Card especial (sem header)** | `p-4` no `CardContent` | Ex.: card de status na coluna direita do caso |

### Valores em pixels (edição)

- `p-4` = 16px
- `p-6` = 24px
- `pb-2` / `pt-2` = 8px
- `gap-2` = 8px (entre cards na mesma coluna, ou ícone/título)
- `gap-6` = 24px (entre colunas ou bloco principal de aba)

---

## Espaçamentos entre cards e colunas

| Contexto | Classes |
|----------|---------|
| Vários cards na **mesma coluna** (empilhados) | `flex flex-col gap-2` |
| Duas colunas (ex.: abertura do projeto) | `flex flex-col gap-6 lg:flex-row` |
| Coluna lateral fixa | `lg:w-[362px]` + `gap-2` entre cards da coluna |

---

## Grids e filtros

- **Grid de filtros em cards** (ex.: Ver Casos): `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
- **Grid de campos dentro do card** (quando necessário): `gap-4` ou `gap-[20px]` em layouts legados; em edição compacta, preferir `gap-2` / `gap-4` conforme densidade da seção

---

## Padrão legado (telas antigas / painel)

Algumas telas ainda usam header `p-5 pb-2` e content `p-6 pt-3 space-y-4`. Ao **refatorar** ou criar telas novas de edição, migrar para o padrão atual (`p-4 pb-2`, `p-6 pt-2`, `space-y-2`).

---

## Diferenças com Figma

1. Verifique este documento antes de copiar valores do Figma
2. Use os tokens da aplicação, não pixels exatos do design
3. Em telas de edição com abas, priorize o **layout shell** e depois os cards

---

## Checklist — nova tela de edição

- [ ] Área rolável: `mt-2` + `overflow-auto` + `min-h-0`
- [ ] Wrapper com `pb-12` ou `pb-24` (rodapé fixo)
- [ ] `TabsContent` com `mt-0`, flex, `data-[state=inactive]:hidden`
- [ ] Wrapper da aba: `gap-6` (bloco único/colunas) ou `gap-2` (cards empilhados)
- [ ] Card header: `p-4 pb-2` + `border-b border-border-divider`
- [ ] Card content: `p-6 pt-2` + `space-y-2`
- [ ] Coluna lateral: `gap-2` entre cards; layout: `gap-6 lg:flex-row`

---

## Referências

- Edição caso: `components/casos/edicao/caso-edit-form.tsx`, `caso-edit-card-header.tsx`, `abas/aba-inicial.tsx`
- Edição projeto: `components/projetos/edicao/projeto-edit-form.tsx`, `shared/projeto-abertura-form.tsx`
- Cards painel (legado): `components/painel/produtos-priorizados.tsx`, `components/reports.tsx`
