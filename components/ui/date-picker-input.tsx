"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock3 } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerInputProps {
  id?: string;
  label?: string;
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  hideLabel?: boolean;
  className?: string;
  controlHeightClassName?: string;
  showTime?: boolean;
}

function formatDate(date: Date | undefined) {
  return date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "";
}

function maskDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function formatTime(date: Date | undefined) {
  if (!date) return "00:00";

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function maskTimeInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function parseDateInput(value: string) {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return undefined;
  }

  const [, day, month, year] = match;
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    parsedDate.getFullYear() !== Number(year) ||
    parsedDate.getMonth() !== Number(month) - 1 ||
    parsedDate.getDate() !== Number(day)
  ) {
    return undefined;
  }

  return parsedDate;
}

function parseTimeInput(value: string) {
  const match = value.trim().match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return undefined;
  }

  const [, hours, minutes] = match;
  const parsedHours = Number(hours);
  const parsedMinutes = Number(minutes);

  if (
    parsedHours < 0 ||
    parsedHours > 23 ||
    parsedMinutes < 0 ||
    parsedMinutes > 59
  ) {
    return undefined;
  }

  return { hours: parsedHours, minutes: parsedMinutes };
}

function combineDateAndTime(date: Date, timeValue: string) {
  const time = parseTimeInput(timeValue) ?? { hours: 0, minutes: 0 };

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.hours,
    time.minutes,
    0,
  );
}

export function DatePickerInput(props: DatePickerInputProps) {
  const {
    id,
    label = "Data",
    value,
    defaultValue,
    onChange,
    placeholder = "dd/mm/aaaa",
    disabled = false,
    required = false,
    hideLabel = false,
    className,
    controlHeightClassName = "h-9",
    showTime = false,
  } = props;

  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    defaultValue,
  );
  const [inputValue, setInputValue] = React.useState(() =>
    formatDate(defaultValue),
  );
  const [timeValue, setTimeValue] = React.useState(() =>
    formatTime(defaultValue),
  );

  const isControlled = Object.prototype.hasOwnProperty.call(props, "value");
  const selectedDate = isControlled ? value : internalDate;
  const [month, setMonth] = React.useState<Date | undefined>(
    selectedDate ?? defaultValue,
  );
  const reactId = React.useId();
  const fieldId = id ?? `date-picker-${reactId}`;

  React.useEffect(() => {
    if (selectedDate) {
      setMonth(selectedDate);
    }
    setInputValue(formatDate(selectedDate));
    setTimeValue(formatTime(selectedDate));
  }, [selectedDate]);

  const handleChange = (nextDate: Date | undefined) => {
    if (!isControlled) {
      setInternalDate(nextDate);
    }

    onChange?.(nextDate);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = maskDateInput(event.target.value);

    setInputValue(nextValue);

    if (!nextValue.trim()) {
      handleChange(undefined);
      return;
    }

    const parsedDate = parseDateInput(nextValue);
    if (parsedDate) {
      const nextDate = showTime
        ? combineDateAndTime(parsedDate, timeValue)
        : parsedDate;

      handleChange(nextDate);
      setMonth(parsedDate);
    }
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = maskTimeInput(event.target.value);

    setTimeValue(nextValue);

    const time = parseTimeInput(nextValue);
    if (selectedDate && time) {
      handleChange(
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          time.hours,
          time.minutes,
          0,
        ),
      );
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!disabled) {
      setOpen(nextOpen);
    }
  };

  return (
    <div className={cn(hideLabel ? "space-y-0" : "space-y-2", className)}>
      {!hideLabel && (
        <div className="flex justify-between">
          <Label
            htmlFor={fieldId}
            className="text-sm font-medium text-text-label"
          >
            {label} {required && <span className="text-text-error">*</span>}
          </Label>
        </div>
      )}

      <Popover
        open={disabled ? false : open}
        onOpenChange={disabled ? undefined : handleOpenChange}
      >
        <PopoverAnchor asChild>
          <div className="flex w-full min-w-0 items-center gap-2">
            <InputGroup
              data-disabled={disabled ? true : undefined}
              className={cn(
                "border-border-input bg-background shadow-sm dark:border-input",
                controlHeightClassName,
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              {/* <InputGroupAddon align="inline-start">
                <CalendarIcon
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </InputGroupAddon> */}
              <input
                data-slot="input-group-control"
                id={fieldId}
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={inputValue}
                placeholder={placeholder}
                disabled={disabled}
                onChange={handleInputChange}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setOpen(true);
                  }
                }}
                className="flex-1 rounded-none border-0 bg-transparent px-2 py-1 text-sm shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-transparent dark:bg-transparent dark:disabled:bg-transparent"
              />
              <InputGroupAddon align="inline-start">
                <PopoverTrigger asChild>
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-expanded={open}
                    aria-haspopup="dialog"
                    disabled={disabled}
                    aria-label="Abrir calendário"
                  >
                    <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
                  </InputGroupButton>
                </PopoverTrigger>
              </InputGroupAddon>
            </InputGroup>

            {showTime && (
              <InputGroup
                data-disabled={disabled ? true : undefined}
                className={cn(
                  "w-[92px] shrink-0 border-border-input bg-background shadow-sm dark:border-input",
                  controlHeightClassName,
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <InputGroupAddon align="inline-start">
                  <Clock3
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                </InputGroupAddon>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={timeValue}
                  placeholder="HH:mm"
                  disabled={disabled}
                  onChange={handleTimeChange}
                  className="min-w-0 flex-1 rounded-none border-0 bg-transparent px-1 py-1 text-sm shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-transparent dark:bg-transparent dark:disabled:bg-transparent"
                  aria-label="Hora"
                />
              </InputGroup>
            )}
          </div>
        </PopoverAnchor>

        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="start"
          sideOffset={4}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            month={month}
            onMonthChange={setMonth}
            onSelect={(nextDate) => {
              setInputValue(formatDate(nextDate));
              handleChange(
                nextDate && showTime
                  ? combineDateAndTime(nextDate, timeValue)
                  : nextDate,
              );
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
