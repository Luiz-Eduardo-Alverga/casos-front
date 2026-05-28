"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import IMask from "imask";
import { CalendarIcon, Clock3 } from "lucide-react";
import { useIMask } from "react-imask";

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

function formatTime(date: Date | undefined) {
  if (!date) return "00:00";

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
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

function getDateTimestamp(date: Date | undefined) {
  return date?.getTime() ?? null;
}

const DATE_MASK_OPTIONS = {
  mask: "00/00/0000",
  lazy: false,
  overwrite: false,
} satisfies Record<string, unknown>;

const TIME_MASK_OPTIONS = {
  mask: "HH:MM",
  lazy: false,
  overwrite: false,
  blocks: {
    HH: {
      mask: IMask.MaskedRange,
      from: 0,
      to: 23,
      maxLength: 2,
    },
    MM: {
      mask: IMask.MaskedRange,
      from: 0,
      to: 59,
      maxLength: 2,
    },
  },
} satisfies Record<string, unknown>;

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

  const isControlled = Object.prototype.hasOwnProperty.call(props, "value");
  const selectedDate = isControlled ? value : internalDate;
  const selectedTimestamp = getDateTimestamp(selectedDate);
  const initialSelectedDate = selectedDate ?? defaultValue;
  const [month, setMonth] = React.useState<Date | undefined>(
    initialSelectedDate,
  );
  const reactId = React.useId();
  const fieldId = id ?? `date-picker-${reactId}`;

  const showTimeRef = React.useRef(showTime);
  showTimeRef.current = showTime;

  const selectedDateRef = React.useRef(selectedDate);
  selectedDateRef.current = selectedDate;

  const lastSyncedTimestampRef = React.useRef<number | null>(
    getDateTimestamp(initialSelectedDate),
  );
  const skipDateAcceptRef = React.useRef(false);
  const skipTimeAcceptRef = React.useRef(false);

  const handleChange = React.useCallback(
    (nextDate: Date | undefined) => {
      if (!isControlled) {
        setInternalDate(nextDate);
      }

      onChange?.(nextDate);
    },
    [isControlled, onChange],
  );

  const handleChangeRef = React.useRef(handleChange);
  handleChangeRef.current = handleChange;

  const {
    ref: timeInputRef,
    setValue: setTimeMaskValue,
    maskRef: timeMaskRef,
  } = useIMask(
    TIME_MASK_OPTIONS as NonNullable<Parameters<typeof useIMask>[0]>,
    {
      defaultValue: formatTime(initialSelectedDate),
      onComplete: (value) => {
        if (skipTimeAcceptRef.current) {
          skipTimeAcceptRef.current = false;
          return;
        }

        const currentDate = selectedDateRef.current;
        const time = parseTimeInput(value);

        if (currentDate && time) {
          handleChangeRef.current(
            new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate(),
              time.hours,
              time.minutes,
              0,
            ),
          );
        }
      },
    },
  );

  const {
    ref: dateInputRef,
    setValue: setDateMaskValue,
    maskRef: dateMaskRef,
  } = useIMask(
    DATE_MASK_OPTIONS as NonNullable<Parameters<typeof useIMask>[0]>,
    {
      defaultValue: formatDate(initialSelectedDate),
      onAccept: (_value, maskRef) => {
        if (skipDateAcceptRef.current) {
          skipDateAcceptRef.current = false;
          return;
        }

        if (!maskRef.unmaskedValue) {
          lastSyncedTimestampRef.current = null;
          handleChangeRef.current(undefined);
        }
      },
      onComplete: (value) => {
        if (skipDateAcceptRef.current) {
          skipDateAcceptRef.current = false;
          return;
        }

        const parsedDate = parseDateInput(value);

        if (!parsedDate) {
          return;
        }

        const timeValue =
          timeMaskRef.current?.value ?? formatTime(selectedDateRef.current);
        const nextDate = showTimeRef.current
          ? combineDateAndTime(parsedDate, timeValue)
          : parsedDate;

        lastSyncedTimestampRef.current = parsedDate.getTime();
        handleChangeRef.current(nextDate);
        setMonth(parsedDate);
      },
    },
  );

  React.useEffect(() => {
    if (selectedTimestamp === lastSyncedTimestampRef.current) {
      return;
    }

    lastSyncedTimestampRef.current = selectedTimestamp;

    if (selectedDate) {
      setMonth(selectedDate);
    }

    const nextDateValue = formatDate(selectedDate);

    if (dateMaskRef.current?.value !== nextDateValue) {
      skipDateAcceptRef.current = true;
      setDateMaskValue(nextDateValue);
    }

    const nextTimeValue = formatTime(selectedDate);

    if (timeMaskRef.current?.value !== nextTimeValue) {
      skipTimeAcceptRef.current = true;
      setTimeMaskValue(nextTimeValue);
    }
  }, [
    selectedDate,
    selectedTimestamp,
    setDateMaskValue,
    setTimeMaskValue,
    dateMaskRef,
    timeMaskRef,
  ]);

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
              <input
                ref={dateInputRef as React.RefObject<HTMLInputElement>}
                data-slot="input-group-control"
                id={fieldId}
                type="text"
                inputMode="numeric"
                placeholder={placeholder}
                disabled={disabled}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setOpen(true);
                  }
                }}
                className="flex-1 font-semibold rounded-none border-0 bg-transparent px-2 py-1 text-sm shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-transparent dark:bg-transparent dark:disabled:bg-transparent"
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
                  ref={timeInputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  inputMode="numeric"
                  placeholder="HH:mm"
                  disabled={disabled}
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
              const formattedDate = formatDate(nextDate);
              lastSyncedTimestampRef.current = getDateTimestamp(nextDate);

              skipDateAcceptRef.current = true;
              setDateMaskValue(formattedDate);

              handleChange(
                nextDate && showTime
                  ? combineDateAndTime(
                      nextDate,
                      timeMaskRef.current?.value ??
                        formatTime(selectedDateRef.current),
                    )
                  : nextDate,
              );

              if (nextDate) {
                setMonth(nextDate);
              }

              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
