# Padrão de Componentes - Painel do Desenvolvedor

Este documento descreve os padrões e boas práticas utilizados na implementação do Painel do Desenvolvedor e que devem ser seguidos nas próximas telas.

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

**NUNCA** usar cores hardcoded (ex: `bg-[#f8f9fa]`). Sempre criar variáveis CSS customizadas e referenciá-las no Tailwind.

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

### 3.4. Hooks e Queries

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

### 3.5. Paginação Infinita

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

### 3.6. Gerenciamento de Estado

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

### 3.7. Tabelas vs Cards

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

### 3.8. Badges

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

Para telas que exibem listagem com filtros (ex.: Ver Casos em `/casos`):

- Usar `FormProvider` (react-hook-form) com `useForm` para os valores dos filtros.
- Usar `CasoFormProvider` com o mesmo `form` e `produto: watch("produto")` para permitir reutilizar os componentes `CasoForm*` (Produto, Versão, Projeto, Relator, Dev, QA, Status, Importância).
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
<Button className="w-full sm:w-auto h-[42px] px-4 flex-1 sm:flex-initial">
  {/* Conteúdo */}
</Button>
```

**Padrões:**
- Mobile: `w-full flex-1` (ocupa toda largura disponível)
- Desktop: `sm:w-auto sm:flex-initial` (largura automática)
- Altura fixa: `h-[42px]` para consistência visual

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
import { useProjetoMemoria } from "@/hooks/use-projeto-memoria";

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

**Última atualização**: Janeiro 2025
**Versão**: 2.0
