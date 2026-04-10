import { useState, useEffect, useCallback, useMemo } from "react";
import {
  format,
  isSameDay,
  isWithinInterval,
  addMonths,
  subMonths,
} from "date-fns";
import { NotesMap, NoteContext, SelectionRange, Holiday } from "../types";
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

import { getSupplementaryHolidays } from "../lib/holidays";

const GCAL_API_KEY = "AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs";
const GCAL_CALENDAR_ID = "en.indian%23holiday%40group.v.calendar.google.com";

export function useCalendarState() {
  const [currentDate, setCurrentDate] = useState(DEFAULT_CALENDAR_DATE);

  // Hydration-safe state initialization
  const [isMounted, setIsMounted] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [monthNotes, setMonthNotes] = useState<NotesMap>({});
  const [selectionNotes, setSelectionNotes] = useState<NotesMap>({});
  const [holidaysByYear, setHolidaysByYear] = useState<Record<number, Holiday[]>>({});
  const [activeNoteContext, setActiveNoteContext] = useState<NoteContext>({
    type: "month",
  });
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(
    null,
  );
  const [previousDate, setPreviousDate] = useState<Date | null>(null);
  const [targetDate, setTargetDate] = useState<Date | null>(null);

  const notedRanges = useMemo(() => 
    Object.entries(selectionNotes)
      .filter(([, note]) => note.trim().length > 0)
      .map(([key]) => parseSelectionKey(key))
      .filter((range): range is SelectionRange => Boolean(range))
  , [selectionNotes]);

  const holidays = useMemo(() => 
    holidaysByYear[currentDate.getFullYear()] || []
  , [holidaysByYear, currentDate]);

  // Fetch Indian holidays from Google Calendar API when the year changes
  useEffect(() => {
    const year = currentDate.getFullYear();
    if (holidaysByYear[year]) return;

    const controller = new AbortController();

    const fetchHolidays = async () => {
      try {
        const url = `https://www.googleapis.com/calendar/v3/calendars/${GCAL_CALENDAR_ID}/events?key=${GCAL_API_KEY}&timeMin=${year}-01-01T00:00:00Z&timeMax=${year}-12-31T23:59:59Z&singleEvents=true&orderBy=startTime&maxResults=200`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) return;

        const json = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiItems: Holiday[] = (json.items || []).map((event: any) => ({
          date: event.start?.date || "",
          name: event.summary || "",
          localName: event.summary || "",
          countryCode: "IN",
          fixed: false,
          global: event.description === "Public holiday",
          types: event.description === "Public holiday" ? ["Public"] : ["Observance"],
        }));

        // Merge supplementary holidays, de-duplicating by date
        const apiDates = new Set(apiItems.map((h) => h.date));
        const supplementary = getSupplementaryHolidays(year).filter(
          (h) => !apiDates.has(h.date),
        );
        const merged = [...apiItems, ...supplementary].sort((a, b) =>
          a.date.localeCompare(b.date),
        );

        setHolidaysByYear((prev) => ({ ...prev, [year]: merged }));
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Failed to fetch holidays:", error);
        }
      }
    };

    fetchHolidays();
    return () => controller.abort();
  }, [currentDate, holidaysByYear]);


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

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
  }, [activeNoteContext, currentDate]);

  const clearActiveNote = useCallback(() => {
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
  }, [activeNoteContext, currentDate]);

  const triggerFlipAnimation = useCallback((
    direction: "next" | "prev",
    newDateFn: (prev: Date) => Date,
  ) => {
    if (isFlipping) return;
    setPreviousDate(currentDate);
    setFlipDirection(direction);
    setIsFlipping(true);

    if (direction === "next") {
      setCurrentDate(newDateFn);
    } else {
      setTargetDate(newDateFn(currentDate));
    }

    setTimeout(() => {
      if (direction === "prev") {
        setCurrentDate(newDateFn);
      }
      setIsFlipping(false);
      setFlipDirection(null);
      setPreviousDate(null);
      setTargetDate(null);
    }, 1000);
  }, [currentDate, isFlipping]);

  const nextMonth = useCallback(() => {
    triggerFlipAnimation("next", (prev) => addMonths(prev, 1));
    if (!startDate || endDate) {
      setActiveNoteContext({ type: "month" });
    }
  }, [triggerFlipAnimation, startDate, endDate]);

  const prevMonth = useCallback(() => {
    triggerFlipAnimation("prev", (prev) => subMonths(prev, 1));
    if (!startDate || endDate) {
      setActiveNoteContext({ type: "month" });
    }
  }, [triggerFlipAnimation, startDate, endDate]);

  const clearSelection = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setHoverDate(null);
    setActiveNoteContext({ type: "month" });
    localStorage.removeItem(STORAGE_KEYS.startDate);
    localStorage.removeItem(STORAGE_KEYS.endDate);
  }, []);

  const onDateClick = useCallback((day: Date) => {
    // If clicking the pivot date again (startDate set, no endDate), deselect it
    if (startDate && !endDate && isSameDay(day, startDate)) {
      clearSelection();
      return;
    }

    // If clicking a date within an already-confirmed range, re-select that range
    const matchingRange = notedRanges.find((range) =>
      isWithinInterval(day, { start: range.start, end: range.end }),
    );

    if (matchingRange) {
      // If this range is already selected, deselect it
      if (
        startDate &&
        endDate &&
        isSameDay(startDate, matchingRange.start) &&
        isSameDay(endDate, matchingRange.end)
      ) {
        clearSelection();
        return;
      }

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
  }, [startDate, endDate, notedRanges, clearSelection]);

  const activeSelectionRange = useMemo(() => 
    activeNoteContext.type === "selection"
      ? parseSelectionKey(activeNoteContext.key)
      : null
  , [activeNoteContext]);

  const activeNotes = useMemo(() => 
    activeNoteContext.type === "selection"
      ? (selectionNotes[activeNoteContext.key] ?? "")
      : (monthNotes[getMonthKey(currentDate)] ?? "")
  , [activeNoteContext, selectionNotes, monthNotes, currentDate]);

  const activeNotesLabel = useMemo(() => 
    activeNoteContext.type === "selection"
      ? activeSelectionRange
        ? isSameDay(activeSelectionRange.start, activeSelectionRange.end)
          ? format(activeSelectionRange.start, "dd MMM yyyy")
          : `${format(activeSelectionRange.start, "dd MMM")} - ${format(activeSelectionRange.end, "dd MMM yyyy")}`
        : "Select day(s) to attach a note"
      : format(currentDate, "MMMM yyyy")
  , [activeNoteContext, activeSelectionRange, currentDate]);

  return {
    currentDate,
    previousDate,
    targetDate,
    startDate,
    endDate,
    hoverDate,
    setHoverDate,
    isFlipping,
    flipDirection,
    notedRanges,
    handleNotesChange,
    clearActiveNote,
    nextMonth,
    prevMonth,
    onDateClick,
    activeNotes,
    activeNotesLabel,
    holidays,
  };
}
