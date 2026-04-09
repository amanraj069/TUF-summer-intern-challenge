import { useState, useEffect } from "react";
import {
  format,
  isSameDay,
  isWithinInterval,
  addMonths,
  subMonths,
} from "date-fns";
import { NotesMap, NoteContext, SelectionRange } from "../types";
import { DEFAULT_CALENDAR_DATE, STORAGE_KEYS } from "../lib/constants";
import {
  getStoredDate,
  getSelectionKey,
  getInitialMonthNotes,
  getStoredMap,
  parseSelectionKey,
  normalizeSelection,
  getMonthKey,
} from "../lib/utils";

export function useCalendarState() {
  const [currentDate, setCurrentDate] = useState(DEFAULT_CALENDAR_DATE);

  // Hydration-safe state initialization
  const [isMounted, setIsMounted] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [monthNotes, setMonthNotes] = useState<NotesMap>({});
  const [selectionNotes, setSelectionNotes] = useState<NotesMap>({});
  const [activeNoteContext, setActiveNoteContext] = useState<NoteContext>({
    type: "month",
  });
  const [isFlipping, setIsFlipping] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const notedRanges = Object.entries(selectionNotes)
    .filter(([, note]) => note.trim().length > 0)
    .map(([key]) => parseSelectionKey(key))
    .filter((range): range is SelectionRange => Boolean(range));

  useEffect(() => {
    setIsMounted(true);
    const storedStart = getStoredDate(STORAGE_KEYS.startDate);
    const storedEnd = getStoredDate(STORAGE_KEYS.endDate);

    if (storedStart) {
      setStartDate(storedStart);
      if (storedEnd) setEndDate(storedEnd);

      const activeKey = getSelectionKey(storedStart, storedEnd || storedStart);
      setActiveNoteContext({ type: "selection", key: activeKey });
    }

    setMonthNotes(getInitialMonthNotes());
    setSelectionNotes(getStoredMap(STORAGE_KEYS.selectionNotes));
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem(STORAGE_KEYS.monthNotes, JSON.stringify(monthNotes));
  }, [monthNotes, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem(
      STORAGE_KEYS.selectionNotes,
      JSON.stringify(selectionNotes),
    );
  }, [selectionNotes, isMounted]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;

    if (activeNoteContext.type === "selection") {
      setSelectionNotes((prev) => ({
        ...prev,
        [activeNoteContext.key]: newNotes,
      }));
      return;
    }

    const monthKey = getMonthKey(currentDate);
    setMonthNotes((prev) => ({ ...prev, [monthKey]: newNotes }));
  };

  const clearActiveNote = () => {
    if (activeNoteContext.type === "selection") {
      setSelectionNotes((prev) => {
        const next = { ...prev };
        delete next[activeNoteContext.key];
        return next;
      });
      return;
    }

    const monthKey = getMonthKey(currentDate);
    setMonthNotes((prev) => {
      const next = { ...prev };
      delete next[monthKey];
      return next;
    });
  };

  const triggerFlipAnimation = () => {
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 500);
  };

  const nextMonth = () => {
    triggerFlipAnimation();
    setCurrentDate((prev) => addMonths(prev, 1));
    if (!startDate || endDate) {
      setActiveNoteContext({ type: "month" });
    }
  };

  const prevMonth = () => {
    triggerFlipAnimation();
    setCurrentDate((prev) => subMonths(prev, 1));
    if (!startDate || endDate) {
      setActiveNoteContext({ type: "month" });
    }
  };

  const selectMonth = (idx: number) => {
    triggerFlipAnimation();
    setCurrentDate((prev) => new Date(prev.getFullYear(), idx, 1));
    if (!startDate || endDate) {
      setActiveNoteContext({ type: "month" });
    }
    setIsPickerOpen(false);
  };

  const onDateClick = (day: Date) => {
    const matchingRange = notedRanges.find((range) =>
      isWithinInterval(day, { start: range.start, end: range.end }),
    );

    if (matchingRange) {
      setStartDate(matchingRange.start);
      setEndDate(matchingRange.end);
      setActiveNoteContext({ type: "selection", key: matchingRange.key });
      localStorage.setItem(
        STORAGE_KEYS.startDate,
        matchingRange.start.toISOString(),
      );
      localStorage.setItem(
        STORAGE_KEYS.endDate,
        matchingRange.end.toISOString(),
      );
      return;
    }

    if (startDate && !endDate) {
      const [rangeStart, rangeEnd] = normalizeSelection(startDate, day);
      setStartDate(rangeStart);
      setEndDate(rangeEnd);
      const key = getSelectionKey(rangeStart, rangeEnd);
      setActiveNoteContext({ type: "selection", key });
      localStorage.setItem(STORAGE_KEYS.startDate, rangeStart.toISOString());
      localStorage.setItem(STORAGE_KEYS.endDate, rangeEnd.toISOString());
    } else {
      setStartDate(day);
      setEndDate(null);
      setActiveNoteContext({
        type: "selection",
        key: getSelectionKey(day, day),
      });
      localStorage.setItem(STORAGE_KEYS.startDate, day.toISOString());
      localStorage.removeItem(STORAGE_KEYS.endDate);
    }
  };

  const activeSelectionRange =
    activeNoteContext.type === "selection"
      ? parseSelectionKey(activeNoteContext.key)
      : null;

  const activeNotes =
    activeNoteContext.type === "selection"
      ? (selectionNotes[activeNoteContext.key] ?? "")
      : (monthNotes[getMonthKey(currentDate)] ?? "");

  const activeNotesLabel =
    activeNoteContext.type === "selection"
      ? activeSelectionRange
        ? isSameDay(activeSelectionRange.start, activeSelectionRange.end)
          ? format(activeSelectionRange.start, "dd MMM yyyy")
          : `${format(activeSelectionRange.start, "dd MMM")} - ${format(activeSelectionRange.end, "dd MMM yyyy")}`
        : "Select day(s) to attach a note"
      : format(currentDate, "MMMM yyyy");

  return {
    currentDate,
    startDate,
    endDate,
    hoverDate,
    setHoverDate,
    isFlipping,
    isPickerOpen,
    setIsPickerOpen,
    notedRanges,
    handleNotesChange,
    clearActiveNote,
    nextMonth,
    prevMonth,
    selectMonth,
    onDateClick,
    activeNotes,
    activeNotesLabel,
  };
}
