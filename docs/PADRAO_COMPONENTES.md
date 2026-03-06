# Padrão de Componentes - Painel do Desenvolvedor

Este documento descreve os padrões e boas práticas utilizados na implementação do Painel do Desenvolvedor e que devem ser seguidos nas próximas telas.

## 1. Separação de Responsabilidades

### Princípio
Cada componente deve ter uma responsabilidade única e bem definida. Componentes complexos devem ser divididos em componentes menores e reutilizáveis.

### Exemplo: Painel do Desenvolvedor

A tela do Painel do Desenvolvedor foi dividida em 3 componentes principais:

1. **ProdutosPriorizados** (`components/painel/produtos-priorizados.tsx`)
   - Responsabilidade: Exibir e gerenciar a lista de produtos priorizados
   - Funcionalidades: Tabela com produtos, checkboxes para seleção, badges de status

2. **CasosProduto** (`components/painel/casos-produto.tsx`)
   - Responsabilidade: Exibir os casos relacionados ao produto selecionado
   - Funcionalidades: Lista de cards com informações dos casos

3. **Retorno** (`components/painel/retorno.tsx`)
   - Responsabilidade: Exibir a tabela de retornos
   - Funcionalidades: Tabela com informações de retornos de casos

### Estrutura de Pastas

```
components/
  painel/
    produtos-priorizados.tsx
    casos-produto.tsx
    retorno.tsx
    painel-header.tsx
```

**Regra**: Componentes relacionados a uma funcionalidade específica devem estar agrupados em uma pasta dedicada.

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
<div className="bg-panel-bg text-panel-text-primary">
  {/* conteúdo */}
</div>
```

### Convenção de Nomenclatura

- Prefixo baseado no contexto: `panel-`, `sidebar-`, `form-`, etc.
- Nome descritivo: `bg`, `text-primary`, `border`, `badge-open`, etc.
- Formato: `kebab-case`

### Cores Padrão do Painel

| Variável | Uso | Cor |
|----------|-----|-----|
| `panel-bg` | Background principal da página | Cinza claro |
| `panel-card-bg` | Background dos cards | Branco |
| `panel-text-primary` | Texto principal | Cinza escuro |
| `panel-text-secondary` | Texto secundário | Cinza médio |
| `panel-border` | Bordas gerais | Cinza claro |
| `panel-border-light` | Bordas sutis | Cinza muito claro |
| `panel-checkbox-checked` | Checkbox selecionado | Azul |
| `panel-badge-open` | Badge de casos abertos | Azul |
| `panel-badge-fixed` | Badge de casos corrigidos | Verde |
| `panel-badge-return` | Badge de retornos | Vermelho |
| `panel-badge-importance` | Badge de importância | Verde |
| `panel-button-back` | Botão de ação secundária | Cinza escuro |

## 3. Estrutura de Páginas

### Padrão de Página com Sidebar

Todas as páginas que utilizam sidebar seguem este padrão:

```tsx
"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { SidebarProvider } from "@/components/sidebar-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { useSidebar } from "@/components/sidebar-provider";
import { useEffect, useState } from "react";

function PageContent() {
  const { isCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleOverlayClick = () => {
    if (isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen relative">
      <AppSidebar 
        isCollapsed={isCollapsed} 
        isMobileOpen={isMobileOpen} 
        isMobile={isMobile} 
      />

      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={handleOverlayClick}
        />
      )}

      <div
        className="flex-1 transition-all duration-300 w-full overflow-hidden"
        style={{
          marginLeft: isMobile ? "0" : (isCollapsed ? "64px" : "256px"),
        }}
      >
        {/* Conteúdo da página */}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <PageContent />
      </SidebarProvider>
    </ProtectedRoute>
  );
}
```

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
        left: isMobile ? "0" : (isCollapsed ? "64px" : "256px"),
        right: "0",
        width: isMobile ? "100%" : `calc(100% - ${isCollapsed ? "64px" : "256px"})`,
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

export function Component({ data, onAction, isLoading = false }: ComponentProps) {
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

## 6. Responsividade

### Breakpoints

- Mobile: `< 1024px` (lg breakpoint do Tailwind)
- Desktop: `>= 1024px`

### Padrões de Responsividade

- Usar `flex-col` em mobile e `flex-row` em desktop
- Ajustar padding e espaçamentos para mobile
- Sidebar sempre colapsável em mobile
- Headers fixos devem considerar sidebar em ambos os casos

## 7. Navegação e Rotas

### Redirecionamento Após Login

O redirecionamento após login deve apontar para a primeira tela do sistema (atualmente `/painel`).

### Botões de Navegação

Botões de navegação devem usar `useRouter` do Next.js:

```tsx
import { useRouter } from "next/navigation";

const router = useRouter();

<Button onClick={() => router.push("/rota-destino")}>
  Navegar
</Button>
```

## 8. Checklist para Novas Telas

Ao criar uma nova tela, verificar:

- [ ] Componentes estão separados por responsabilidade?
- [ ] Cores estão usando variáveis do Tailwind (não hardcoded)?
- [ ] Variáveis CSS foram adicionadas em `globals.css`?
- [ ] Variáveis foram registradas no `tailwind.config.ts`?
- [ ] Página segue o padrão de estrutura com sidebar?
- [ ] Header customizado (se necessário) segue o padrão?
- [ ] Interfaces TypeScript estão definidas?
- [ ] Responsividade está implementada?
- [ ] Rotas estão configuradas corretamente?

## 9. Exemplos de Uso

### Criando um Novo Componente de Tabela

```tsx
"use client";

interface TabelaProps {
  dados: Dado[];
  onRowClick?: (id: string) => void;
}

export function Tabela({ dados, onRowClick }: TabelaProps) {
  return (
    <div className="bg-panel-card-bg rounded-lg shadow-[0px_2px_6px_0px_rgba(0,0,0,0.04)] p-6">
      <div className="overflow-x-auto">
        {/* Estrutura da tabela */}
      </div>
    </div>
  );
}
```

### Criando um Novo Badge

```tsx
interface BadgeProps {
  valor: number;
  tipo: "open" | "fixed" | "return";
}

export function Badge({ valor, tipo }: BadgeProps) {
  const classes = {
    open: "bg-panel-badge-open-bg text-panel-badge-open",
    fixed: "bg-panel-badge-fixed-bg text-panel-badge-fixed",
    return: "bg-panel-badge-return-bg text-panel-badge-return",
  };

  return (
    <div className={`rounded-full px-2.5 py-1.5 ${classes[tipo]}`}>
      <span className="text-xs font-semibold">{valor}</span>
    </div>
  );
}
```

## 10. Manutenção e Evolução

- Sempre revisar este documento ao adicionar novos padrões
- Documentar decisões de design importantes
- Manter consistência visual entre telas
- Atualizar exemplos quando necessário

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0
