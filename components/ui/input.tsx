import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (ref == null) continue;
      if (typeof ref === "function") ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

const TYPES_WITH_CLEAR_BY_DEFAULT = new Set([
  "text",
  "search",
  "email",
  "tel",
  "url",
]);

export type InputProps = React.ComponentProps<"input"> & {
  /** `true`/`false` força o botão. Omitido: ativa só em tipos de texto comuns (não inclui `password`, `file`, etc.). */
  clearable?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      clearable,
      disabled,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref,
  ) => {
    const innerRef = React.useRef<HTMLInputElement>(null);
    const [uncontrolledValue, setUncontrolledValue] = React.useState(
      () => defaultValue?.toString() ?? "",
    );

    const isControlled = value !== undefined;
    const stringValue = isControlled
      ? value == null
        ? ""
        : String(value)
      : uncontrolledValue;

    const effectiveClearable =
      clearable !== undefined
        ? clearable
        : TYPES_WITH_CLEAR_BY_DEFAULT.has(type ?? "text");

    const isReadOnly = Boolean(props.readOnly);

    const showClear =
      effectiveClearable &&
      !disabled &&
      !isReadOnly &&
      stringValue.length > 0 &&
      type !== "password" &&
      type !== "file" &&
      type !== "hidden";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setUncontrolledValue(e.target.value);
      onChange?.(e);
    };

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const el = innerRef.current;
      if (!el || disabled) return;

      if (!isControlled) {
        el.value = "";
        setUncontrolledValue("");
      }

      onChange?.({
        target: {
          value: "",
          name: el.name,
          id: el.id,
        } as HTMLInputElement,
        currentTarget: el,
      } as React.ChangeEvent<HTMLInputElement>);

      queueMicrotask(() => el.focus());
    };

    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-input dark:border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className,
            showClear && "pr-9",
          )}
          ref={mergeRefs(ref, innerRef)}
          disabled={disabled}
          {...props}
          {...(isControlled
            ? { value: value ?? "" }
            : defaultValue !== undefined
              ? { defaultValue }
              : {})}
          onChange={handleChange}
        />
        {showClear ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Limpar"
            disabled={disabled}
            onClick={handleClear}
            className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none"
          >
            <X className="h-4 w-4 shrink-0" aria-hidden />
          </button>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
