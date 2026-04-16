"use client";

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCaseSearchValue(value: string): string {
  return onlyDigits(value).slice(0, 5);
}

export function isCaseSearchReady(value: string): boolean {
  return formatCaseSearchValue(value).length === 5;
}

export function mapStatusAvancar(statusId: number): number | null {
  switch (statusId) {
    case 1:
    case 2:
    case 4:
      return 3;
    case 3:
      return 9;
    default:
      return null;
  }
}

