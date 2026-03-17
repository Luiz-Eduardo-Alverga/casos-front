# Como criar um componente Combobox (caso-form)

Este documento descreve o padrão para criar novos componentes de Combobox nos formulários de caso, seguindo os exemplos existentes (produto, setor, categoria, origem, etc.).

## Visão geral

Cada Combobox de formulário é um componente que:

1. Usa **ComboboxField** (wrapper que integra Combobox + react-hook-form + botão de limpar).
2. Consome dados de um **hook** (ex.: `useSetores`, `useProdutos`) que já segue o padrão de requisições (service + API route).
3. Respeita o contexto **CasoFormProvider** (`useCasoForm`) para estado desabilitado, lazy load e dados de edição.
4. Normaliza os dados da API para o formato **options** (`{ value: string; label: string }[]`).

## Estrutura de arquivos

- **Componente:** `components/caso-form/fields/caso-form-[recurso].tsx`
- **Export:** adicionar em `components/caso-form/fields/index.ts`
- **Hook de dados:** `hooks/use-[recurso].tsx` (já deve existir se a API foi implementada pelo padrão de requisições)
- **Service/tipo:** `services/auxiliar/[recurso].ts` (interface do item retornado pela API)

## Dependências comuns

| Dependência | Uso |
|-------------|-----|
| `ComboboxField` | `@/components/reports-form/combobox-field` |
| `useCasoForm` | `../provider` — `isDisabled`, `lazyLoadComboboxOptions`, `editCaseItem` |
| `useFormContext` | `react-hook-form` — `watch("nomeDoCampo")` |
| Hook de dados | `@/hooks/use-[recurso]` — lista da API |
| Ícone | `lucide-react` — ex.: `Building2`, `Tag`, `Activity` |

## Passo a passo para criar um novo Combobox

### 1. Garantir que a API e o hook existam

Conforme `docs/PADRAO_REQUISICOES.md`:

- Service em `services/auxiliar/[recurso].ts` com interface do item (ex.: `Setor { id, nome }`).
- API route em `app/api/auxiliar/[recurso]/route.ts`.
- Hook em `hooks/use-[recurso].tsx` (ex.: `useSetores`).

### 2. Criar o arquivo do componente

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
        emptyText={isLoading ? "Carregando..." : "Nenhum item encontrado."}
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

### 3. Ajustes por tipo de recurso

- **Campo no formulário:** o `name` do ComboboxField deve bater com o nome do campo no schema do formulário (ex.: `setor`, `categoria`, `origem`). Se o schema ainda não tiver o campo, será preciso adicioná-lo no zod e nos `defaultValues`.
- **value/label:** na lista da API, use sempre o identificador estável como `value` (geralmente `String(item.id)`) e o texto exibido como `label` (ex.: `item.nome`, `item.tipo_categoria`).
- **Fallback em edição:** se na tela de edição o `editCaseItem` trouxer o valor atual do recurso por outro caminho (ex.: `editCaseItem.projeto.setores`), inclua uma opção “fantasma” na lista quando `lazyLoadComboboxOptions` estiver ativo e o valor do formulário ainda não estiver nas opções carregadas, para evitar label vazio no Combobox.

### 4. Exportar o componente

Em `components/caso-form/fields/index.ts`:

```ts
export { CasoFormRecurso } from "./caso-form-recurso";
```

### 5. Usar no formulário

No JSX do formulário (ex.: `reports.tsx`), importar e renderizar:

```tsx
import { CasoFormSetor } from "./fields";

// Dentro do form:
<CasoFormSetor required={false} />
```

Se o campo for obrigatório, inclua no schema zod (ex.: `setor: z.string().min(1, "Setor é obrigatório")`) e em `defaultValues` (ex.: `setor: ""`).

## Exemplos de referência no projeto

| Componente | Hook | Observação |
|------------|------|------------|
| `caso-form-setor.tsx` | `useSetores` | Lista simples (id + nome), fallback com `editCaseItem.projeto.setores`. |
| `caso-form-origem.tsx` | `useOrigens` | Padrão simples, fallback em `editCaseItem.caso.caracteristicas`. |
| `caso-form-categoria.tsx` | `useCategorias` | Label vem de `tipo_categoria`. |
| `caso-form-produto.tsx` | `useProdutos` | Label composto (`nome_projeto - setor`), estado local do item selecionado e limpeza de campos dependentes no `useEffect`. |

## ComboboxField – props principais

| Prop | Tipo | Descrição |
|------|------|-----------|
| `name` | string | Nome do campo no react-hook-form. |
| `label` | string | Rótulo exibido acima do Combobox. |
| `icon` | LucideIcon | Ícone ao lado do conteúdo. |
| `options` | `{ value: string; label: string }[]` | Lista de opções. |
| `placeholder` | string | Texto quando vazio. |
| `emptyText` | string | Texto quando não há opções (ou “Carregando…”). |
| `searchDebounceMs` | number | Atraso do debounce da busca (ex.: 450). |
| `disabled` | boolean | Desabilita o campo. |
| `required` | boolean | Exibe asterisco e valida se o schema exigir. |
| `onOpenChange` | `(open: boolean) => void` | Usado para lazy load: ao abrir (`open === true`), definir `setOptionsRequested(true)`. |

## Checklist rápido

- [ ] Service + API route + hook do recurso existem.
- [ ] Componente em `caso-form/fields/caso-form-[recurso].tsx` criado.
- [ ] Uso de `useCasoForm`, `watch`, `useRecursos` com `enabled: optionsRequested`.
- [ ] Options em `useMemo` com `value`/`label` e fallback para edição quando fizer sentido.
- [ ] `ComboboxField` com `onOpenChange` para lazy load quando `lazyLoadComboboxOptions` for true.
- [ ] Export no `index.ts` dos fields.
- [ ] Campo no schema e no formulário, se o campo for usado no report.

Com isso, novos Combobox podem ser criados de forma consistente e reutilizando o mesmo padrão de dados e UX.
