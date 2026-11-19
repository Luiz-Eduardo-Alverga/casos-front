"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// `block` e a altura de linha do `text-sm` (20px): o rótulo tem sempre a mesma altura, seja solto
// acima do campo ou embrulhado (ComboboxField, CasoForm*, DatePickerInput). Como `inline`, ele
// ficava dentro de uma linha de 24px e o campo ao lado desalinhava 4px; com `leading-none`, 14px.
const labelVariants = cva(
  "block text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
