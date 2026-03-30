"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Formata Date para string no formato da API: YYYY-MM-DD HH:mm:ss */
export function dateToApiString(
  date: Date | undefined,
  timeHHMM?: string,
): string | undefined {
  if (!date) return undefined;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  if (timeHHMM) {
    const [h = "00", min = "00"] = timeHHMM.split(":");
    return `${y}-${m}-${d} ${h.padStart(2, "0")}:${min.padStart(2, "0")}:00`;
  }
  return `${y}-${m}-${d} 00:00:00`;
}

/** Formata Date (com hora e minuto) para string no formato da API: YYYY-MM-DD HH:mm:ss */
export function dateTimeToApiString(
  date: Date | undefined,
): string | undefined {
  if (!date) return undefined;
  return format(date, "yyyy-MM-dd HH:mm:ss");
}

/** Parse da string da API (YYYY-MM-DD HH:mm:ss ou YYYY-MM-DDTHH:mm) para Date */
export function apiStringToDate(
  value: string | null | undefined,
): Date | undefined {
  if (!value?.trim()) return undefined;
  const s = value.trim();
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
  if (!match) return undefined;
  const [, y, m, d, h, min] = match;
  return new Date(
    Number(y),
    Number(m) - 1,
    Number(d),
    Number(h),
    Number(min),
    0,
  );
}

/** Extrai HH:mm de um Date */
function dateToTimeString(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export interface DateTimePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * DatePicker (shadcn) somente data.
 * Exibe calendário no Popover e retorna um Date sem seleção de horário.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Selecione uma data",
  disabled = false,
  className,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(value);

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const displayText = value
    ? format(value, "dd/MM/yyyy", { locale: ptBR })
    : placeholder;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal h-9 text-sm",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              onChange(d);
              setOpen(false);
            }}
            defaultMonth={date}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * DatePicker (shadcn) com campo de hora para data/hora no formato da API.
 * Exibe calendário no Popover e input de hora ao lado.
 */
export function DateTimePicker({
  value,
  onChange,
  placeholder = "Selecione data e hora",
  disabled = false,
  className,
  id,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [time, setTime] = React.useState(
    value ? dateToTimeString(value) : "00:00",
  );

  React.useEffect(() => {
    setDate(value);
    setTime(value ? dateToTimeString(value) : "00:00");
  }, [value]);

  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      const [h, m] = time.split(":").map(Number);
      const combined = new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
        isNaN(h) ? 0 : h,
        isNaN(m) ? 0 : m,
        0,
      );
      onChange(combined);
    } else {
      onChange(undefined);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTime(v);
    if (date && v) {
      const [h, m] = v.split(":").map(Number);
      const combined = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        isNaN(h) ? 0 : h,
        isNaN(m) ? 0 : m,
        0,
      );
      onChange(combined);
    }
  };

  const displayText = value
    ? format(value, "dd/MM/yyyy HH:mm", { locale: ptBR })
    : placeholder;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal h-9 text-sm",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              handleSelect(d);
            }}
            defaultMonth={date}
          />
          <div className="border-t p-2">
            <label className="text-xs text-muted-foreground mb-1 block">
              Hora
            </label>
            <Input
              type="time"
              value={time}
              onChange={handleTimeChange}
              className="h-8"
              disabled={disabled}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
