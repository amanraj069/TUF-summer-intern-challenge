import { format, isAfter } from "date-fns";
import { NotesMap, SelectionRange } from "../types";
import { DEFAULT_CALENDAR_DATE, STORAGE_KEYS } from "./constants";

export const getMonthKey = (date: Date) => format(date, "yyyy-MM");

export const normalizeSelection = (start: Date, end?: Date | null) => {
  if (!end) return [start, start] as const;
  return isAfter(start, end)
    ? ([end, start] as const)
    : ([start, end] as const);
};

export const getSelectionKey = (start: Date, end?: Date | null) => {
  const [normalizedStart, normalizedEnd] = normalizeSelection(start, end);
  return `${format(normalizedStart, "yyyy-MM-dd")}__${format(normalizedEnd, "yyyy-MM-dd")}`;
};

export const getStoredMap = (key: string): NotesMap => {
  if (typeof window === "undefined") return {};

  const savedValue = localStorage.getItem(key);
  if (!savedValue) return {};

  try {
    const parsed = JSON.parse(savedValue) as NotesMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

export const getStoredDate = (key: string): Date | null => {
  if (typeof window === "undefined") return null;
  const savedValue = localStorage.getItem(key);
  if (!savedValue) return null;

  const parsed = new Date(savedValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const getInitialMonthNotes = (): NotesMap => {
  const persistedMonthNotes = getStoredMap(STORAGE_KEYS.monthNotes);
  if (Object.keys(persistedMonthNotes).length > 0) {
    return persistedMonthNotes;
  }

  if (typeof window !== "undefined") {
    const legacyNotes = localStorage.getItem(STORAGE_KEYS.legacyNotes);
    if (legacyNotes) {
      return { [getMonthKey(DEFAULT_CALENDAR_DATE)]: legacyNotes };
    }
  }

  return {};
};

export const parseSelectionKey = (key: string): SelectionRange | null => {
  const [startRaw, endRaw] = key.split("__");
  if (!startRaw || !endRaw) return null;

  const start = new Date(`${startRaw}T00:00:00`);
  const end = new Date(`${endRaw}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  const [normalizedStart, normalizedEnd] = normalizeSelection(start, end);
  return { key, start: normalizedStart, end: normalizedEnd };
};
