# Padrão de front (componentes, estado, formulários)

> **Estado: implementado** (padrão em uso). Consolidado em 2026-11-17 a partir de
> `PADRAO_COMPONENTES`, `PADRAO_COMPONENTES_GRANDES` e `COMO_CRIAR_COMBOBOX`. Visual (tokens,
> espaçamentos, card) fica em [`design-system.md`](../design-system.md); dados em
> [`camada-de-dados/`](../camada-de-dados/README.md).

## O que é

Os padrões de código que toda tela segue: responsabilidade única por componente, skeleton e empty
state, hooks com TanStack Query fora de `components/`, react-hook-form + Zod, paginação infinita,
decomposição de componentes grandes em feature folder e criação de combobox de domínio. Nasceram
no Painel do Desenvolvedor e viraram o padrão do repositório.

## Como estender

- Tela nova: seção "8. Checklist para Novas Telas".
- Componente ficou grande: seção "Padrão — Componentes grandes (feature folder)".
- Campo de seleção de domínio (produto, setor, versão…): reaproveitar `@/components/fields`; só
  criar um novo seguindo "Como criar um componente Combobox".

---

## 1. Separação de Responsabilidades

### Princípio

Cada componente deve ter uma responsabilidade única e bem definida. Componentes complexos devem ser divididos em componentes menores e reutilizáveis.

### Exemplo: Painel do Desenvolvedor

A tela do Painel do Desenvolvedor foi dividida em componentes principais:

1. **Painel** (`components/painel.tsx`) - Componente orquestrador
   - Responsabilidade: Gerenciar estado global, coordenar componentes filhos, persistir seleções
   - Funcionalidades: 
     - Busca dados via hooks (`useAgendaDev`)
     - Gerencia seleção de produtos com `localStorage`
     - Renderiza skeleton states durante loading
     - Invalida queries para atualização de dados

2. **ProdutosPriorizados** (`components/painel/produtos-priorizados.tsx`)
   - Responsabilidade: Exibir e gerenciar a lista de produtos priorizados
   - Funcionalidades: 
     - Tabela com produtos, checkboxes para seleção
     - Badges de status (abertos, corrigidos, retornos)
     - Sincronização de seleção com estado do pai
     - EmptyState quando não há produtos

3. **CasosProduto** (`components/painel/casos-produto.tsx`)
   - Responsabilidade: Exibir os casos relacionados ao produto selecionado
   - Funcionalidades: 
     - Lista de cards com informações dos casos
     - Paginação infinita via `useProjetoMemoria`
     - EmptyState quando nenhum produto está selecionado ou não há casos
     - Skeleton durante loading

4. **Retorno** (`components/painel/retorno.tsx`)
   - Responsabilidade: Exibir a tabela de retornos
   - Funcionalidades: 
     - Tabela com informações de retornos de casos
     - Paginação infinita via `useProjetoMemoria`
     - EmptyState quando não há retornos
     - Skeleton durante loading

### Estrutura de Pastas

```
components/
  painel/
    painel.tsx                    # Componente principal
    produtos-priorizados.tsx      # Lista de produtos
    produtos-priorizados-skeleton.tsx
    casos-produto.tsx             # Casos do produto selecionado
    casos-produto-skeleton.tsx
    retorno.tsx                   # Tabela de retornos
    retorno-skeleton.tsx
    empty-state.tsx               # Componente reutilizável
```

**Regra**: Componentes relacionados a uma funcionalidade específica devem estar agrupados em uma pasta dedicada. Cada componente que tem estado de loading deve ter seu respectivo skeleton.

## 2. Cores e Variáveis Tailwind

### Princípio

**NUNCA** usar cores hardcoded (ex: `bg-[#f8f9fa]`, `text-black`, `bg-white`, `text-[#9ca3af]`).

Sempre usar **tokens semânticos** já definidos no `app/globals.css` (via `tailwind.config.ts`) — por exemplo `text-foreground`, `text-muted-foreground`, `text-destructive`, `bg-card`, `border-border`, `border-border-divider`, `bg-destructive/10`.

Se a cor/tom não existir como token, **adicionar a variável CSS** em `app/globals.css` e registrar no `tailwind.config.ts` (nunca “resolver no componente” com hex/hsl).

### Processo de Adição de Cores

1. **Adicionar variável CSS** em `app/globals.css`:

```css
:root {
  --panel-bg: 220 14% 96%;
  --panel-card-bg: 0 0% 100%;
  /* ... */
}
```

2. **Adicionar no Tailwind config** em `tailwind.config.ts`:

```typescript
colors: {
  'panel-bg': 'hsl(var(--panel-bg))',
  'panel-card-bg': 'hsl(var(--panel-card-bg))',
  /* ... */
}
```

3. **Usar no componente**:

```tsx
<div className="bg-panel-bg text-panel-text-primary">{/* conteúdo */}</div>
```

### Exemplo (perigo / destructive)

```tsx
<div className="rounded-lg border border-destructive/20 bg-destructive/10">
  <p className="text-sm font-semibold text-destructive">Zona de Perigo</p>
  <Button variant="destructive">Excluir</Button>
</div>
```

### Convenção de Nomenclatura

- Prefixo baseado no contexto: `panel-`, `sidebar-`, `form-`, etc.
- Nome descritivo: `bg`, `text-primary`, `border`, `badge-open`, etc.
- Formato: `kebab-case`

### Cores Padrão do Painel

| Variável                 | Uso                            | Cor               |
| ------------------------ | ------------------------------ | ----------------- |
| `panel-bg`               | Background principal da página | Cinza claro       |
| `panel-card-bg`          | Background dos cards           | Branco            |
| `panel-text-primary`     | Texto principal                | Cinza escuro      |
| `panel-text-secondary`   | Texto secundário               | Cinza médio       |
| `panel-border`           | Bordas gerais                  | Cinza claro       |
| `panel-border-light`     | Bordas sutis                   | Cinza muito claro |
| `panel-checkbox-checked` | Checkbox selecionado           | Azul              |
| `panel-badge-open`       | Badge de casos abertos         | Azul              |
| `panel-badge-fixed`      | Badge de casos corrigidos      | Verde             |
| `panel-badge-return`     | Badge de retornos              | Vermelho          |
| `panel-badge-importance` | Badge de importância           | Verde             |
| `panel-button-back`      | Botão de ação secundária       | Cinza escuro      |

## 3. Padrões de Componentes

### 3.1. Estrutura de Card

Todos os cards seguem o mesmo padrão visual e estrutural:

```tsx
<Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
  <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-text-primary" />
      <CardTitle className="text-sm font-semibold text-text-primary">
        Título do Card
      </CardTitle>
    </div>
  </CardHeader>
  <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
    {/* Conteúdo do card */}
  </CardContent>
</Card>
```

**Características:**
- `bg-card shadow-card`: Background e sombra padronizados
- `lg:min-h-0 lg:flex-1`: Permite que o card cresça e tenha scroll interno em desktop
- Header com `shrink-0`: Header sempre visível, não encolhe
- Content com `lg:overflow-y-auto`: Scroll interno apenas no conteúdo em desktop
- Ícone no header: sempre `h-3.5 w-3.5` com `text-text-primary`
- Título: `text-sm font-semibold text-text-primary`

### 3.2. Loading States (Skeletons)

Cada componente que faz fetch de dados deve ter um skeleton correspondente:

```tsx
// Componente principal
if (isLoading) {
  return <ComponenteSkeleton />;
}

// Skeleton deve replicar a estrutura do componente real
export function ComponenteSkeleton() {
  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        {/* Header idêntico ao componente real */}
      </CardHeader>
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        {/* Estrutura com Skeleton components */}
        <Skeleton className="h-4 w-[140px]" />
      </CardContent>
    </Card>
  );
}
```

**Regras:**
- Skeleton deve ter a mesma estrutura visual do componente final
- Usar componente `Skeleton` do shadcn/ui
- Manter mesmas classes de layout (flex, gap, etc.)
- No componente principal, renderizar skeleton quando `isLoading === true`

### 3.3. Empty States

Componente reutilizável para estados vazios:

```tsx
import { EmptyState } from "@/components/painel/empty-state";

<EmptyState
  imageSrc="/images/empty-state-produtos-priorizados.svg"
  imageAlt="Nenhum produto priorizado"
  icon={FileText}
  title="Nenhum produto priorizado"
  description="Selecione ou adicione produtos"
/>
```

**Características:**
- Aceita `imageSrc` (prioritário) ou `icon` (fallback)
- Sempre incluir `imageAlt` para acessibilidade
- `title` e `description` em português
- Centralizado vertical e horizontalmente
- Altura mínima de `200px`

### 3.4. Formulários e react-hook-form

Para telas e abas de edição (ex.: `caso-edit/aba-clientes`, campos de `caso-form`):

- Sempre usar **`react-hook-form`** para controlar os campos de formulário.
- O componente pai deve criar o formulário com `useForm` e expor o contexto com `FormProvider`.
- Campos individuais (como Comboboxes, Inputs, etc.) devem usar `useFormContext` / `Controller` (ou componentes como `ComboboxField`) em vez de manter estado local com `useState` para valores de formulário.
- Abas de edição que possuem ações de gravação (ex.: botão “Adicionar”, “Salvar”) devem ler os valores via `form.getValues()` ou receber os dados através de `handleSubmit`.

#### Reutilizar campos existentes (`CasoForm*` / UI compartilhada)

**Regra obrigatória:** antes de montar um `ComboboxField`, `Input` ou picker “do zero” em filtros/formulários, verificar se já existe um componente em `@/components/fields` (ou equivalente compartilhado) para aquele domínio.

| Campo | Componente a reutilizar |
|-------|-------------------------|
| Produto | `CasoFormProduto` |
| Setor | `CasoFormSetor` |
| Versão | `CasoFormVersao` |
| Projeto | `CasoFormProjeto` |
| Status | `CasoFormStatus` |
| Categoria | `CasoFormCategoria` |
| Data (calendário) | `DatePickerInput` (`@/components/ui/date-picker-input`) |

- Envolver com `FormProvider` + `CasoFormProvider` (`produto: watch("produto")`, `isDisabled`, etc.) — padrão já usado em Casos, Reports, Liberações e Melhorias.
- **Não** recriar combobox de produto/setor/versão com `useProdutos`/`useSetores` + `ComboboxField` ad-hoc quando o `CasoForm*` correspondente existir.
- Só criar campo novo quando não houver equivalente; nesse caso, seguir `docs/padrao-front/README.md` e colocar em `@/components/fields`.

Exemplo simplificado:

```tsx
const form = useForm<{ clienteId: string; incidente: string }>({
  defaultValues: { clienteId: "", incidente: "0" },
});

return (
  <FormProvider {...form}>
    <Input
      value={watch("clienteId")}
      onChange={(e) => form.setValue("clienteId", e.target.value)}
    />
    {/* outros campos controlados */}
  </FormProvider>
);
```

### 3.5. Hooks e Queries

Componentes que buscam dados devem usar hooks customizados:

```tsx
// Exemplo: useProjetoMemoria
const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
  useProjetoMemoria(
    {
      per_page: 15,
      usuario_dev_id: usuarioDevId,
      status_id: "4",
    },
    { enabled: Boolean(usuarioDevId) }, // Opções do React Query
  );

// Processar dados paginados
const itens = data?.pages.flatMap((p) => p.data.map(mapItemToRow)) ?? [];
```

**Padrões:**
- Usar `enabled` para controlar quando a query deve executar
- Processar dados paginados com `flatMap`
- Sempre ter fallback para array vazio (`?? []`)
- Funções de mapeamento separadas para melhor legibilidade

### 3.6. Paginação Infinita

Para listagens com muitos itens, usar paginação infinita:

```tsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useHook();

// Renderizar botão "Carregar mais"
{hasNextPage && (
  <div className="mt-4 flex justify-center">
    <Button
      variant="outline"
      size="sm"
      onClick={() => fetchNextPage()}
      disabled={isFetchingNextPage}
    >
      {isFetchingNextPage ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
          Carregando...
        </>
      ) : (
        "Carregar mais"
      )}
    </Button>
  </div>
)}
```

**Características:**
- Botão centralizado abaixo da lista
- Mostrar spinner durante carregamento
- Desabilitar botão durante `isFetchingNextPage`
- Usar `Loader2` do lucide-react com `animate-spin`

### 3.7. Gerenciamento de Estado

#### Estado Local com localStorage

Para persistir seleções entre recarregamentos:

```tsx
const [produtosState, setProdutosState] = useState(produtos);

// Restaurar do localStorage ao montar
useEffect(() => {
  if (produtos.length === 0) return;
  const storedOrdem = localStorage.getItem(PAINEL_PRODUTO_ORDEM_KEY);
  const ordemValida = storedOrdem && produtos.some((p) => p.ordem === storedOrdem)
    ? storedOrdem
    : null;
  setProdutosState(
    produtos.map((p) => ({
      ...p,
      selecionado: ordemValida ? p.ordem === ordemValida : false,
    })),
  );
}, [produtos]);

// Salvar no localStorage ao selecionar
const handleProdutoSelect = (ordem: string, selected: boolean) => {
  if (selected) {
    localStorage.setItem(PAINEL_PRODUTO_ORDEM_KEY, ordem);
  } else {
    localStorage.removeItem(PAINEL_PRODUTO_ORDEM_KEY);
  }
  // Atualizar estado local...
};
```

**Padrões:**
- Validar valor do localStorage antes de usar
- Sempre verificar se o valor ainda é válido (ex.: produto ainda existe)
- Usar constantes para keys do localStorage
- Sincronizar estado local com props quando necessário

#### Comunicação entre Componentes

Componente pai gerencia estado, filhos recebem props e callbacks:

```tsx
// Pai
const [produtosState, setProdutosState] = useState(produtos);
const handleProdutoSelect = (ordem: string, selected: boolean) => {
  // Lógica de atualização
};

<ProdutosPriorizados
  produtos={produtosState}
  onProdutoSelect={handleProdutoSelect}
/>

// Filho
interface ProdutosPriorizadosProps {
  produtos: ProdutoPriorizado[];
  onProdutoSelect: (ordem: string, selected: boolean) => void;
}
```

### 3.8. Tabelas vs Cards

#### Tabelas
Usar para dados tabulares com múltiplas colunas:

```tsx
<Table>
  <TableHeader>
    <TableRow className="bg-white border-b border-white hover:bg-white">
      <TableHead className="w-[80px] text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">
        Coluna
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {itens.map((item) => (
      <TableRow
        key={item.id}
        className="bg-white border-t border-border-divider hover:bg-white"
      >
        <TableCell className="w-[80px] py-3 px-2.5">
          {/* Conteúdo */}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Características:**
- Header: `bg-white border-b border-white hover:bg-white`
- Rows: `bg-white border-t border-border-divider hover:bg-white`
- Larguras fixas quando necessário: `w-[80px]`
- Padding: `py-3 px-2.5`
- Texto: `text-xs font-semibold text-text-primary`

#### Cards
Usar para itens com informações mais complexas ou hierárquicas:

```tsx
{casos.map((caso) => (
  <div
    key={caso.id}
    className="bg-white border border-border-divider rounded-lg p-3.5 flex flex-col gap-0"
  >
    <div className="flex gap-3 items-start pb-2 border-b border-border-divider">
      {/* Header do card */}
    </div>
    <div className="flex items-center justify-between pt-2.5">
      {/* Footer do card */}
    </div>
  </div>
))}
```

### 3.9. Badges

Badges seguem padrão visual consistente:

```tsx
// Badge numérico (status)
<Badge className="bg-blue-100 text-blue-700 border-transparent rounded-full w-9 h-7 flex items-center justify-center hover:bg-blue-100">
  {valor}
</Badge>

// Badge de texto (categoria)
<Badge variant="secondary" className="rounded-full px-4 py-1">
  {categoria}
</Badge>
```

**Cores por tipo:**
- Abertos: `bg-blue-100 text-blue-700`
- Corrigidos: `bg-green-100 text-green-700`
- Retornos: `bg-orange-100 text-orange-700`
- Importância: `bg-yellow-100 text-yellow-700`

## 4. Estrutura de Páginas

### 4.1. Telas de listagem com filtros

Para telas que exibem listagem com filtros (ex.: Ver Casos em `/casos`, Melhorias em `/melhorias`):

- Usar `FormProvider` (react-hook-form) com `useForm` para os valores dos filtros.
- Usar `CasoFormProvider` com o mesmo `form` e `produto: watch("produto")` para reutilizar os componentes `CasoForm*` (Produto, Versão, Projeto, Relator, Dev, QA, Status, Importância, Setor, Categoria).
- **Sempre preferir `CasoForm*`** aos comboboxes montados na mão (ver seção 3.4 — Reutilizar campos existentes). Referências: `components/casos/filtros`, `components/liberacoes/filtros`, `components/reports/filtros`, `components/melhorias/filtros`.
- Card de filtros: mesmo padrão de card (header `p-5 pb-2`, content `p-6 pt-3`), com grid de campos (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`).
- Combobox de **Status**: usar o componente `CasoFormStatus`, que consome o hook `useStatus()` e a API de status (`/api/auxiliar/status`). O valor enviado à API de listagem (ex.: projeto-memoria) é o `Registro` do status (string).

## 4. Headers Customizados

### Padrão de Header

Headers específicos de cada página devem:

- Estar fixos no topo (`fixed`)
- Respeitar o espaço da sidebar
- Incluir botões de navegação quando necessário
- Usar o componente `UserDropDown` para o menu do usuário

Exemplo:

```tsx
"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserDropDown } from "@/components/user-dropdown";
import { useSidebar } from "@/components/sidebar-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function CustomHeader() {
  const { toggleSidebar, isCollapsed } = useSidebar();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <header
      className="fixed bg-white border-b border-border top-0 z-30 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)]"
      style={{
        left: isMobile ? "0" : isCollapsed ? "64px" : "256px",
        right: "0",
        width: isMobile
          ? "100%"
          : `calc(100% - ${isCollapsed ? "64px" : "256px"})`,
      }}
    >
      <div className="flex items-center justify-between px-6 h-[64px]">
        {/* Conteúdo do header */}
      </div>
    </header>
  );
}
```

## 5. Tipagem TypeScript

### Interfaces de Props

Sempre definir interfaces para as props dos componentes:

```tsx
interface ComponentProps {
  data: DataType[];
  onAction: (id: string) => void;
  isLoading?: boolean;
}

export function Component({
  data,
  onAction,
  isLoading = false,
}: ComponentProps) {
  // ...
}
```

### Interfaces de Dados

Criar interfaces para estruturas de dados:

```tsx
interface Produto {
  id: string;
  nome: string;
  versao: string;
  // ...
}
```

## 6. Layout e Responsividade

### 6.1. Estrutura de Layout Principal

O layout principal do painel segue este padrão:

```tsx
<div className="px-6 pt-20 py-10 flex-1 flex flex-col lg:min-h-0 lg:overflow-hidden">
  {/* Header da página */}
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-text-primary">Título</h1>
      <p className="text-sm text-text-secondary">Descrição</p>
    </div>
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
      {/* Botões de ação */}
    </div>
  </div>

  {/* Grid de conteúdo */}
  <div className="flex flex-col sm:flex-row gap-6 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
    {/* Colunas */}
  </div>
</div>
```

**Características:**
- `px-6 pt-20 py-10`: Padding padrão (pt-20 para compensar header fixo)
- `flex-1 flex flex-col`: Container flexível que ocupa espaço disponível
- `lg:min-h-0 lg:overflow-hidden`: Em desktop, permite scroll interno nos filhos
- Header com `shrink-0`: Não encolhe, sempre visível
- Grid responsivo: `flex-col` em mobile, `flex-row` em desktop

### 6.2. Breakpoints

- Mobile: `< 640px` (sm breakpoint)
- Tablet: `640px - 1023px` (sm até lg)
- Desktop: `>= 1024px` (lg breakpoint)

### 6.3. Padrões de Responsividade

#### Grid de Conteúdo

```tsx
{/* Mobile: coluna única, Desktop: lado a lado */}
<div className="flex flex-col sm:flex-row gap-6 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
  {/* Coluna esquerda */}
  <div className="flex flex-col gap-6 w-full sm:w-[732px] lg:min-h-0 lg:flex-1 lg:overflow-hidden">
    {/* Componentes */}
  </div>
  
  {/* Coluna direita */}
  <div className="flex flex-col lg:flex-1 lg:min-h-0 lg:overflow-hidden">
    {/* Componentes */}
  </div>
</div>
```

**Padrões:**
- Mobile: `flex-col` (empilhamento vertical)
- Desktop: `flex-row` (lado a lado)
- Largura fixa em tablet: `sm:w-[732px]` quando necessário
- Desktop: `lg:flex-1` para distribuir espaço igualmente
- `lg:min-h-0 lg:overflow-hidden`: Permite scroll interno nos cards filhos

#### Botões e Ações

```tsx
<Button className="w-full sm:w-auto px-4 flex-1 sm:flex-initial">
  {/* Conteúdo */}
</Button>
```

**Padrões:**
- Mobile: `w-full flex-1` (ocupa toda largura disponível)
- Desktop: `sm:w-auto sm:flex-initial` (largura automática)
- O componente `Button` já usa altura padrão `h-[42px]`; para botões menores use `size="sm"` (h-8) ou `size="icon"` (h-9 w-9)

#### Headers de Página

```tsx
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
  {/* Título e descrição */}
  <div className="flex flex-col gap-1">
    <h1 className="text-2xl font-bold text-text-primary">Título</h1>
    <p className="text-sm text-text-secondary">Descrição</p>
  </div>
  
  {/* Ações */}
  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
    {/* Botões */}
  </div>
</div>
```

**Padrões:**
- Mobile: `flex-col` (título acima, ações abaixo)
- Desktop: `sm:flex-row` (título à esquerda, ações à direita)
- `items-start sm:items-center`: Alinhamento vertical responsivo
- `w-full sm:w-auto`: Ações ocupam largura total em mobile

### 6.4. Scroll e Overflow

**Regra geral:** Em desktop, o scroll deve ser interno aos cards, não na página inteira.

```tsx
{/* Container principal - sem scroll */}
<div className="lg:min-h-0 lg:overflow-hidden">
  {/* Card com scroll interno */}
  <Card>
    <CardContent className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
      {/* Conteúdo que pode fazer scroll */}
    </CardContent>
  </Card>
</div>
```

**Mobile:** Scroll natural do navegador (sem `overflow-hidden`).

## 7. Navegação e Rotas

### Redirecionamento Após Login

O redirecionamento após login deve apontar para a primeira tela do sistema (atualmente `/painel`).

### Botões de Navegação

Botões de navegação devem usar `useRouter` do Next.js:

```tsx
import { useRouter } from "next/navigation";

const router = useRouter();

<Button onClick={() => router.push("/rota-destino")}>Navegar</Button>;
```

## 8. Checklist para Novas Telas

Ao criar uma nova tela, verificar:

### Estrutura e Organização
- [ ] Componentes estão separados por responsabilidade?
- [ ] Componentes relacionados estão na mesma pasta?
- [ ] Cada componente com loading tem seu skeleton correspondente?
- [ ] Interfaces TypeScript estão definidas para props e dados?
- [ ] Campos de domínio (produto, setor, versão, status, data, etc.) reutilizam `CasoForm*` / componentes existentes em vez de comboboxes novos ad-hoc?

### Estilização
- [ ] Cores estão usando variáveis do Tailwind (não hardcoded)?
- [ ] Variáveis CSS foram adicionadas em `globals.css`?
- [ ] Variáveis foram registradas no `tailwind.config.ts`?
- [ ] Cards seguem o padrão (CardHeader, CardContent, classes padrão)?

### Funcionalidade
- [ ] Hooks customizados estão sendo usados para buscar dados?
- [ ] Loading states (skeletons) estão implementados?
- [ ] Empty states estão implementados quando não há dados?
- [ ] Paginação infinita está implementada (quando necessário)?
- [ ] Estado local e localStorage estão sendo usados corretamente (quando necessário)?
- [ ] Comunicação entre componentes via props e callbacks está correta?

### Layout e Responsividade
- [ ] Página segue o padrão de estrutura com sidebar?
- [ ] Layout responsivo está implementado (flex-col/flex-row)?
- [ ] Scroll interno em cards no desktop (lg:overflow-y-auto)?
- [ ] Header customizado (se necessário) segue o padrão?
- [ ] Botões são responsivos (w-full sm:w-auto)?

### Navegação e Dados
- [ ] Rotas estão configuradas corretamente?
- [ ] useRouter do Next.js está sendo usado para navegação?
- [ ] Queries estão sendo invalidadas após mutações?
- [ ] Dados paginados estão sendo processados corretamente (flatMap)?

## 9. Exemplos de Uso

### 9.1. Criando um Componente Completo com Card, Tabela e Empty State

```tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/painel/empty-state";
import { FileText } from "lucide-react";
import { useCustomHook } from "@/hooks/use-custom-hook";

interface Item {
  id: string;
  nome: string;
  status: number;
}

export function MinhaTabela() {
  const { data, isLoading } = useCustomHook();
  const itens: Item[] = data ?? [];

  if (isLoading) {
    return <MinhaTabelaSkeleton />;
  }

  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Minha Tabela
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
        {itens.length === 0 ? (
          <EmptyState
            imageSrc="/images/empty-state-exemplo.svg"
            imageAlt="Nenhum item encontrado"
            icon={FileText}
            title="Nenhum item encontrado"
            description="Não há itens para exibir no momento."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-white border-b border-white hover:bg-white">
                <TableHead className="w-[180px] font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                  Nome
                </TableHead>
                <TableHead className="w-[80px] text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.map((item) => (
                <TableRow
                  key={item.id}
                  className="bg-white border-t border-border-divider hover:bg-white"
                >
                  <TableCell className="w-[180px] py-3 px-2.5">
                    <span className="text-xs font-semibold text-text-primary">
                      {item.nome}
                    </span>
                  </TableCell>
                  <TableCell className="w-[80px] text-center py-3 px-2.5">
                    <Badge className="bg-blue-100 text-blue-700 border-transparent rounded-full w-9 h-7 flex items-center justify-center hover:bg-blue-100">
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
```

### 9.2. Criando um Componente com Paginação Infinita

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useProjetoMemoria } from "@/hooks/casos/use-projeto-memoria";

export function ListaComPaginacao() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProjetoMemoria(
      { per_page: 15, status_id: "1" },
      { enabled: true }
    );

  const itens = data?.pages.flatMap((p) => p.data) ?? [];

  if (isLoading) {
    return <ListaComPaginacaoSkeleton />;
  }

  return (
    <Card>
      <CardContent>
        {itens.length === 0 ? (
          <EmptyState title="Nenhum item" description="..." />
        ) : (
          <>
            {/* Lista de itens */}
            {itens.map((item) => (
              <div key={item.id}>{/* Item */}</div>
            ))}
            
            {/* Botão de carregar mais */}
            {hasNextPage && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                      Carregando...
                    </>
                  ) : (
                    "Carregar mais"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

### 9.3. Componente Pai Gerenciando Estado e localStorage

```tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useCustomHook } from "@/hooks/use-custom-hook";

const STORAGE_KEY = "minha-selecao-key";

export function ComponentePai() {
  const { data, isLoading } = useCustomHook();
  
  // Processar dados da API
  const itens = useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      id: item.id,
      nome: item.nome,
      selecionado: false,
    }));
  }, [data]);

  const [itensState, setItensState] = useState(itens);

  // Restaurar seleção do localStorage
  useEffect(() => {
    if (itens.length === 0) return;
    const storedId = localStorage.getItem(STORAGE_KEY);
    const idValido = storedId && itens.some((i) => i.id === storedId)
      ? storedId
      : null;
    setItensState(
      itens.map((i) => ({
        ...i,
        selecionado: idValido ? i.id === idValido : false,
      }))
    );
  }, [itens]);

  const handleSelect = (id: string, selected: boolean) => {
    if (selected) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setItensState((prev) =>
      prev.map((i) => ({
        ...i,
        selecionado: i.id === id ? selected : selected ? false : i.selecionado,
      }))
    );
  };

  const selectedItem = itensState.find((i) => i.selecionado);

  if (isLoading) {
    return <ComponentePaiSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <ComponenteFilho
        itens={itensState}
        onSelect={handleSelect}
      />
      {selectedItem && (
        <ComponenteDetalhes itemId={selectedItem.id} />
      )}
    </div>
  );
}
```

### 9.4. Criando um Skeleton

```tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { FileText } from "lucide-react";

const ROWS = 5;

export function MinhaTabelaSkeleton() {
  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Minha Tabela
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-white border-b border-white hover:bg-white">
              <TableHead className="w-[180px] font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                Nome
              </TableHead>
              <TableHead className="w-[80px] text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: ROWS }).map((_, i) => (
              <TableRow
                key={i}
                className="bg-white border-t border-border-divider hover:bg-white"
              >
                <TableCell className="w-[180px] py-3 px-2.5">
                  <Skeleton className="h-4 w-[140px]" />
                </TableCell>
                <TableCell className="w-[80px] py-3 px-2.5">
                  <div className="flex justify-center">
                    <Skeleton className="h-7 w-9 rounded-full" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

## 10. Padrões de Invalidação de Queries

Após mutações (criação, edição, exclusão), sempre invalidar as queries relacionadas:

```tsx
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

// Após uma mutação bem-sucedida
const handleAtualizar = () => {
  queryClient.invalidateQueries({ queryKey: ["agenda-dev"] });
  queryClient.invalidateQueries({ queryKey: ["projeto-memoria"] });
};

<Button onClick={handleAtualizar}>
  <RefreshCcw className="h-3.5 w-3.5" />
  Atualizar
</Button>
```

**Padrões:**
- Invalidar todas as queries que podem ter sido afetadas pela mutação
- Usar `queryKey` específicos para evitar invalidações desnecessárias
- Botões de atualização devem invalidar queries relevantes

## 11. Manutenção e Evolução

- Sempre revisar este documento ao adicionar novos padrões
- Documentar decisões de design importantes
- Manter consistência visual entre telas
- Atualizar exemplos quando necessário
- Quando criar novos componentes, verificar se seguem os padrões documentados

---

## Padrão — Componentes grandes (feature folder)

Quando um componente começa a ficar grande (muitas responsabilidades, muitos handlers, muito JSX), o padrão do projeto é **separar em subcomponentes** dentro de uma pasta de feature, parecido com o que já acontece em partes do `painel-kanban`.

### Quando aplicar

- Arquivo com **muito JSX** (difícil de escanear).
- Mistura de **UI + regras de negócio + hooks + utilitários** no mesmo arquivo.
- Muitos estados (`useState`) e callbacks (`useCallback`) no mesmo lugar.
- Reuso parcial desejável (ex.: `Row`, `List`, `Skeleton`, `Form`).

### Estrutura recomendada

Crie uma pasta em torno da feature e mantenha um **entrypoint** (geralmente `index.tsx`) que coordena hooks, estado e handlers.

Exemplo:

```
components/<area>/<feature>/
  index.tsx                 # entrypoint: hooks + estado + handlers + composição
  types.ts                  # tipos do feature (props, estados)
  utils.ts                  # helpers puros (sem React)
  <feature>-skeleton.tsx    # skeleton do layout
  <feature>-list.tsx        # lista/área rolável
  <feature>-row.tsx         # item/linha
  <feature>-form.tsx        # formulário/entrada de dados
  README.md                 # (opcional) nota rápida do feature
```

### Regras práticas

- **EntryPoint (`index.tsx`)**:
  - centraliza `useQuery`/`useMutation`, `useForm`, estado e side-effects
  - passa callbacks e dados para os subcomponentes
  - evita JSX profundo demais: priorize composição por subcomponentes

- **Subcomponentes**:
  - recebem props simples
  - não conhecem detalhes de cache/queryKey (deixe isso no entrypoint)
  - devem ser fáceis de testar/ler isoladamente

- **`utils.ts`**:
  - apenas funções puras (sem hooks/sem `window`)
  - bom lugar para parse/normalização (ex.: `parseVersaoFieldValue`)

- **Compatibilidade de imports**:
  - quando já existe um import espalhado no app, crie um “arquivo ponte” que re-exporta o componente (para evitar quebrar import paths).  
    Ex.: `components/.../painel-kanban-produtos-modal.tsx` pode virar somente:
    - `export { PainelKanbanProdutosModal } from "./produtos-modal";`

### Skeleton

Sempre que o componente fizer fetch inicial, prefira um skeleton que **imita a estrutura** (título, área de filtros, lista, rodapé), para reduzir layout shift e manter a UI consistente.

### DnD / Listas grandes

Em listas, garanta:

- container com altura fixa (ex.: `h-[360px]`) para permitir rolagem
- `ScrollArea` com `overflow-hidden` e conteúdo interno com padding para não “cortar” itens


---

## Como criar um componente Combobox (caso-form)

Este documento descreve o padrão para criar novos componentes de Combobox nos formulários de caso, seguindo os exemplos existentes (produto, setor, categoria, origem, etc.).

> **Antes de criar:** confira se já existe um `CasoForm*` em `@/components/fields` (produto, setor, versão, status, categoria, etc.). Em filtros e formulários, **reutilize o componente existente** — não monte um `ComboboxField` ad-hoc para o mesmo domínio. Ver também `docs/padrao-front/README.md` (seção 3.4).

### Visão geral

Cada Combobox de formulário é um componente que:

1. Usa **ComboboxField** (wrapper que integra Combobox + react-hook-form + botão de limpar).
2. Consome dados de um **hook** (ex.: `useSetores`, `useProdutos`) que já segue o padrão de requisições (service + API route).
3. Respeita o contexto **CasoFormProvider** (`useCasoForm`) para estado desabilitado, lazy load e dados de edição.
4. Normaliza os dados da API para o formato **options** (`{ value: string; label: string }[]`).

### Estrutura de arquivos

- **Componente:** `components/caso-form/fields/caso-form-[recurso].tsx`
- **Export:** adicionar em `components/caso-form/fields/index.ts`
- **Hook de dados:** `hooks/use-[recurso].tsx` (já deve existir se a API foi implementada pelo padrão de requisições)
- **Service/tipo:** `services/auxiliar/[recurso].ts` (interface do item retornado pela API)

### Dependências comuns

| Dependência | Uso |
|-------------|-----|
| `ComboboxField` | `@/components/reports-form/combobox-field` |
| `useCasoForm` | `../provider` — `isDisabled`, `lazyLoadComboboxOptions`, `editCaseItem` |
| `useFormContext` | `react-hook-form` — `watch("nomeDoCampo")` |
| Hook de dados | `@/hooks/use-[recurso]` — lista da API |
| Ícone | `lucide-react` — ex.: `Building2`, `Tag`, `Activity` |

### Passo a passo para criar um novo Combobox

#### 1. Garantir que a API e o hook existam

Conforme `docs/camada-de-dados/README.md`:

- Service em `services/auxiliar/[recurso].ts` com interface do item (ex.: `Setor { id, nome }`).
- API route em `app/api/auxiliar/[recurso]/route.ts`.
- Hook em `hooks/use-[recurso].tsx` (ex.: `useSetores`).

#### 2. Criar o arquivo do componente

Arquivo: `components/caso-form/fields/caso-form-[recurso].tsx`.

**Estrutura mínima:**

```tsx
"use client";

import { useState, useMemo } from "react";
import { IconName } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { useCasoForm } from "../provider";
import { useFormContext } from "react-hook-form";
import { useRecursos } from "@/hooks/use-recursos";

interface CasoFormRecursoProps {
  required?: boolean;
}

export function CasoFormRecurso({ required = false }: CasoFormRecursoProps) {
  const { isDisabled, lazyLoadComboboxOptions, editCaseItem } = useCasoForm();
  const { watch } = useFormContext();
  const valorCampo = watch("nomeDoCampoNoForm");
  const [optionsRequested, setOptionsRequested] = useState(!lazyLoadComboboxOptions);

  const { data: recursos, isLoading } = useRecursos({
    enabled: optionsRequested,
  });

  const options = useMemo(() => {
    const list = (recursos ?? []).map((item) => ({
      value: String(item.id),
      label: item.nome,
    }));
    // Opcional: fallback para edição (valor vindo da API de edição que pode não estar na lista)
    if (
      lazyLoadComboboxOptions &&
      editCaseItem?.caminho?.para?.recurso &&
      valorCampo &&
      !list.some((o) => o.value === valorCampo)
    ) {
      const r = editCaseItem.caminho.para.recurso;
      list.unshift({ value: valorCampo, label: r.label_ou_nome ?? valorCampo });
    }
    return list;
  }, [recursos, lazyLoadComboboxOptions, editCaseItem, valorCampo]);

  return (
    <div className="space-y-2">
      <ComboboxField
        name="nomeDoCampoNoForm"
        label="Label do campo"
        icon={IconName}
        options={options}
        placeholder="Selecione..."
        emptyText="Nenhum item encontrado."
        isLoading={optionsRequested && isLoading}
        searchDebounceMs={450}
        disabled={isDisabled}
        required={required}
        onOpenChange={
          lazyLoadComboboxOptions ? (open) => open && setOptionsRequested(true) : undefined
        }
      />
    </div>
  );
}
```

#### 3. Ajustes por tipo de recurso

- **Campo no formulário:** o `name` do ComboboxField deve bater com o nome do campo no schema do formulário (ex.: `setor`, `categoria`, `origem`). Se o schema ainda não tiver o campo, será preciso adicioná-lo no zod e nos `defaultValues`.
- **value/label:** na lista da API, use sempre o identificador estável como `value` (geralmente `String(item.id)`) e o texto exibido como `label` (ex.: `item.nome`, `item.tipo_categoria`).
- **Fallback em edição:** se na tela de edição o `editCaseItem` trouxer o valor atual do recurso por outro caminho (ex.: `editCaseItem.projeto.setores`), inclua uma opção “fantasma” na lista quando `lazyLoadComboboxOptions` estiver ativo e o valor do formulário ainda não estiver nas opções carregadas, para evitar label vazio no Combobox.

#### 4. Exportar o componente

Em `components/caso-form/fields/index.ts`:

```ts
export { CasoFormRecurso } from "./caso-form-recurso";
```

#### 5. Usar no formulário

No JSX do formulário (ex.: `reports.tsx`), importar e renderizar:

```tsx
import { CasoFormSetor } from "./fields";

// Dentro do form:
<CasoFormSetor required={false} />
```

Se o campo for obrigatório, inclua no schema zod (ex.: `setor: z.string().min(1, "Setor é obrigatório")`) e em `defaultValues` (ex.: `setor: ""`).

### Exemplos de referência no projeto

| Componente | Hook | Observação |
|------------|------|------------|
| `caso-form-setor.tsx` | `useSetores` | Lista simples (id + nome), fallback com `editCaseItem.projeto.setores`. |
| `caso-form-origem.tsx` | `useOrigens` | Padrão simples, fallback em `editCaseItem.caso.caracteristicas`. |
| `caso-form-categoria.tsx` | `useCategorias` | Label vem de `tipo_categoria`. |
| `caso-form-produto.tsx` | `useProdutos` | Label composto (`nome_projeto - setor`), estado local do item selecionado e limpeza de campos dependentes no `useEffect`. |

### ComboboxField – props principais

| Prop | Tipo | Descrição |
|------|------|-----------|
| `name` | string | Nome do campo no react-hook-form. |
| `label` | string | Rótulo exibido acima do Combobox. |
| `icon` | LucideIcon | Ícone ao lado do conteúdo. |
| `options` | `{ value: string; label: string }[]` | Lista de opções. |
| `placeholder` | string | Texto quando vazio. |
| `emptyText` | string | Texto quando não há opções. |
| `isLoading` | boolean | Exibe skeleton no popover durante o carregamento inicial (lazy load). |
| `loadingSkeletonRows` | number | Quantidade de linhas do skeleton (padrão: 5). |
| `searchDebounceMs` | number | Atraso do debounce da busca (ex.: 450). |
| `searchDebounceText` | string | Mensagem exibida enquanto o debounce da busca está pendente (padrão automático quando há `onSearchChange`). |
| `minSearchLengthForDebounceFeedback` | number | Comprimento mínimo do termo digitado para exibir a mensagem de debounce (padrão: 1). |
| `disabled` | boolean | Desabilita o campo. |
| `required` | boolean | Exibe asterisco e valida se o schema exigir. |
| `onOpenChange` | `(open: boolean) => void` | Usado para lazy load: ao abrir (`open === true`), definir `setOptionsRequested(true)`. |

### Checklist rápido

- [ ] Service + API route + hook do recurso existem.
- [ ] Componente em `caso-form/fields/caso-form-[recurso].tsx` criado.
- [ ] Uso de `useCasoForm`, `watch`, `useRecursos` com `enabled: optionsRequested`.
- [ ] Options em `useMemo` com `value`/`label` e fallback para edição quando fizer sentido.
- [ ] `ComboboxField` com `onOpenChange` para lazy load quando `lazyLoadComboboxOptions` for true.
- [ ] Export no `index.ts` dos fields.
- [ ] Campo no schema e no formulário, se o campo for usado no report.

Com isso, novos Combobox podem ser criados de forma consistente e reutilizando o mesmo padrão de dados e UX.
