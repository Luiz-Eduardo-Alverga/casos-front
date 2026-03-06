# Padrão de Espaçamentos - Casos Front

Este documento descreve o padrão de espaçamentos internos dos cards e componentes utilizados na aplicação. **IMPORTANTE**: Os espaçamentos do Figma podem diferir dos espaçamentos implementados na aplicação. Sempre use este documento como referência ao implementar telas do Figma.

## Espaçamentos de Cards

### Estrutura Padrão de Card

Todos os cards na aplicação seguem a seguinte estrutura de espaçamento:

```tsx
<div className="bg-card rounded-lg shadow-card p-6 flex flex-col">
  {/* Header do Card */}
  <div className="flex items-center gap-2 p-5 pb-2 border-b border-border-divider">
    {/* Ícone e Título */}
  </div>
  
  {/* Conteúdo do Card */}
  <div className="p-6 pt-3">
    {/* Conteúdo interno */}
  </div>
</div>
```

### Detalhamento dos Espaçamentos

| Elemento | Padding | Descrição |
|----------|---------|-----------|
| **Card Container** | `p-6` | Padding geral de 24px (1.5rem) em todos os lados do card |
| **Card Header** | `p-5 pb-2` | Padding de 20px (1.25rem) em todos os lados, exceto bottom que é 8px (0.5rem) |
| **Card Content** | `p-6 pt-3` | Padding de 24px (1.5rem) em todos os lados, exceto top que é 12px (0.75rem) |
| **Gap entre elementos** | `gap-2` | Espaçamento de 8px (0.5rem) entre ícone e título no header |
| **Border** | `border-b border-border-divider` | Borda inferior de 1px separando header do conteúdo |

### Valores em Pixels

- `p-6` = 24px (1.5rem)
- `p-5` = 20px (1.25rem)
- `pb-2` = 8px (0.5rem)
- `pt-3` = 12px (0.75rem)
- `gap-2` = 8px (0.5rem)

## Exemplo de Implementação

### Card Simples

```tsx
<div className="bg-card rounded-lg shadow-card p-6 flex flex-col">
  {/* Header */}
  <div className="flex items-center gap-2 p-5 pb-2 border-b border-border-divider">
    <FileText className="h-3.5 w-3.5 text-text-primary" />
    <h2 className="text-sm font-semibold text-text-primary">Título do Card</h2>
  </div>
  
  {/* Content */}
  <div className="p-6 pt-3 space-y-4">
    {/* Conteúdo aqui */}
  </div>
</div>
```

### Card com Grid

```tsx
<div className="bg-card rounded-lg shadow-card p-6 flex flex-col">
  {/* Header */}
  <div className="flex items-center gap-2 p-5 pb-2 border-b border-border-divider">
    <Bug className="h-3.5 w-3.5 text-text-primary" />
    <h2 className="text-sm font-semibold text-text-primary">Título</h2>
  </div>
  
  {/* Content com Grid */}
  <div className="p-6 pt-3">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px]">
      {/* Campos do grid */}
    </div>
  </div>
</div>
```

## Espaçamentos entre Cards

Quando há múltiplos cards na mesma página:

- **Gap entre cards**: `gap-6` = 24px (1.5rem)
- **Gap entre colunas**: `gap-6` = 24px (1.5rem)

## Espaçamentos Internos de Formulários

Para campos dentro de cards:

- **Space entre campos verticais**: `space-y-4` = 16px (1rem)
- **Gap em grids**: `gap-[20px]` = 20px (valor customizado)

## Notas Importantes

### ⚠️ Diferenças com Figma

1. **Sempre verifique este documento** antes de implementar espaçamentos do Figma
2. Os espaçamentos do Figma podem estar em valores diferentes (ex: 16px, 32px)
3. **Use os valores padrão da aplicação** documentados aqui, não os valores exatos do Figma
4. O padrão foi estabelecido para manter consistência visual em toda a aplicação

### ✅ Boas Práticas

1. **Sempre use as classes Tailwind** documentadas aqui
2. **Não use valores customizados** a menos que seja absolutamente necessário
3. **Mantenha consistência** - se um card usa `p-6`, todos devem usar
4. **Teste visualmente** - ajuste apenas se houver necessidade real de diferenciação

## Checklist ao Implementar Nova Tela do Figma

- [ ] Card container usa `p-6`
- [ ] Card header usa `p-5 pb-2`
- [ ] Card content usa `p-6 pt-3`
- [ ] Gap entre ícone e título é `gap-2`
- [ ] Border divisória usa `border-border-divider`
- [ ] Espaçamento entre cards é `gap-6`
- [ ] Campos em formulário usam `space-y-4` ou `gap-[20px]` para grids

## Referências

- Componente base: `components/reports.tsx`
- Cards do painel: `components/painel/produtos-priorizados.tsx`, `components/painel/retorno.tsx`, `components/painel/casos-produto.tsx`
