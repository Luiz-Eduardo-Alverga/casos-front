"use client";

export const CASE_ID_MIN_LENGTH = 5;
export const CASE_ID_MAX_LENGTH = 6;
export const CASE_SEARCH_DEBOUNCE_MS = 800;

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCaseSearchValue(value: string): string {
  return onlyDigits(value).slice(0, CASE_ID_MAX_LENGTH);
}

export function isCaseSearchReady(value: string): boolean {
  return formatCaseSearchValue(value).length >= CASE_ID_MIN_LENGTH;
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
