"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  differenceInCalendarDays,
  isAfter,
  isWithinInterval,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Thematic images for different months/seasons
const MONTH_IMAGES = [
  "https://images.unsplash.com/photo-1478265409131-1f65c88f965c?q=80&w=1000&auto=format&fit=crop", // Jan - Snow
  "https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?q=80&w=1000&auto=format&fit=crop", // Feb - Lake
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?q=80&w=1000&auto=format&fit=crop", // Mar - Spring Blossom
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=1000&auto=format&fit=crop", // Apr - Hills
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop", // May - Beach
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1000&auto=format&fit=crop", // Jun - Peak Summer
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1000&auto=format&fit=crop", // Jul - Ocean
  "https://images.unsplash.com/photo-1508964942454-1a56651d54ac?q=80&w=1000&auto=format&fit=crop", // Aug - Forest
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop", // Sep - Fall Leaves
  "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1000&auto=format&fit=crop", // Oct - Autumn Path
  "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?q=80&w=1000&auto=format&fit=crop", // Nov - Cozy
  "https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?q=80&w=1000&auto=format&fit=crop", // Dec - Winter Cabin
];

type NotesMap = Record<string, string>;
type NoteContext = { type: "month" } | { type: "selection"; key: string };
type SelectionRange = { key: string; start: Date; end: Date };

const DEFAULT_CALENDAR_DATE = new Date(2022, 0, 1);

const STORAGE_KEYS = {
  startDate: "calendar-start",
  endDate: "calendar-end",
  monthNotes: "calendar-month-notes",
  selectionNotes: "calendar-selection-notes",
  legacyNotes: "calendar-notes",
} as const;

const getMonthKey = (date: Date) => format(date, "yyyy-MM");

const normalizeSelection = (start: Date, end?: Date | null) => {
  if (!end) return [start, start] as const;
  return isAfter(start, end)
    ? ([end, start] as const)
    : ([start, end] as const);
};

const getSelectionKey = (start: Date, end?: Date | null) => {
  const [normalizedStart, normalizedEnd] = normalizeSelection(start, end);
  return `${format(normalizedStart, "yyyy-MM-dd")}__${format(normalizedEnd, "yyyy-MM-dd")}`;
};

const getStoredMap = (key: string): NotesMap => {
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

const getStoredDate = (key: string): Date | null => {
  if (typeof window === "undefined") return null;
  const savedValue = localStorage.getItem(key);
  if (!savedValue) return null;

  const parsed = new Date(savedValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getInitialMonthNotes = (): NotesMap => {
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

const parseSelectionKey = (key: string): SelectionRange | null => {
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

export default function Home() {
  const [themeColor, setThemeColor] = useState<string>("#38bdf8");
  const [currentDate, setCurrentDate] = useState(DEFAULT_CALENDAR_DATE);

  // Hydration-safe state initialization (always null empty on first pass)
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

  // Load from localStorage ONLY after mounting (fixes hydration error)
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

  // Extract theme color when image changes
  useEffect(() => {
    const monthIndex = currentDate.getMonth();
    const activeImage = MONTH_IMAGES[monthIndex];

    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = activeImage;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let r = 0,
          g = 0,
          b = 0;
        let count = 0;
        // Sample every 400th pixel to be fast
        for (let i = 0; i < data.length; i += 1600) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        let rAvg = Math.floor(r / count);
        let gAvg = Math.floor(g / count);
        let bAvg = Math.floor(b / count);

        // Prevent the theme color from being too bright (ensures white text is visible)
        const luminance = 0.299 * rAvg + 0.587 * gAvg + 0.114 * bAvg;
        if (luminance > 160) {
          const factor = 160 / luminance;
          rAvg = Math.floor(rAvg * factor);
          gAvg = Math.floor(gAvg * factor);
          bAvg = Math.floor(bAvg * factor);
        }

        const toHex = (c: number) => c.toString(16).padStart(2, "0");
        setThemeColor(`#${toHex(rAvg)}${toHex(gAvg)}${toHex(bAvg)}`);
      } catch (e) {
        console.error("Canvas taint error, fallback to default", e);
        setThemeColor("#38bdf8"); // fallback
      }
    };
  }, [currentDate]);

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

  const nextMonth = () => {
    triggerFlipAnimation();
    setCurrentDate(addMonths(currentDate, 1));
    if (!startDate || endDate) {
      setActiveNoteContext({ type: "month" });
    }
  };

  const prevMonth = () => {
    triggerFlipAnimation();
    setCurrentDate(subMonths(currentDate, 1));
    if (!startDate || endDate) {
      setActiveNoteContext({ type: "month" });
    }
  };

  const selectMonth = (idx: number) => {
    triggerFlipAnimation();
    const newDate = new Date(currentDate.getFullYear(), idx, 1);
    setCurrentDate(newDate);
    if (!startDate || endDate) {
      setActiveNoteContext({ type: "month" });
    }
    setIsPickerOpen(false);
  };

  const triggerFlipAnimation = () => {
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 500);
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

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDateGrid = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDateGrid = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const confirmedRange =
      startDate && endDate ? normalizeSelection(startDate, endDate) : null;

    // We only preview if we have clicked a startDate (so we are building a range),
    // and we've held it / are moving to the end date.
    // The user requested: "This hover effect should only come when we click and select one perticular date, not just by hover"
    const previewRange =
      startDate && !endDate && hoverDate
        ? normalizeSelection(startDate, hoverDate)
        : null;

    const hasConfirmedRange = Boolean(confirmedRange);
    const hasPreviewRange =
      Boolean(previewRange) &&
      !hasConfirmedRange &&
      !isSameDay(previewRange![0], previewRange![1]);

    const activeRange = confirmedRange ?? previewRange;
    const activeRangeStart = activeRange ? activeRange[0] : null;
    const activeRangeEnd = activeRange ? activeRange[1] : null;
    const hasRangeSpan =
      Boolean(activeRangeStart && activeRangeEnd) &&
      !isSameDay(activeRangeStart!, activeRangeEnd!);

    const totalDays = differenceInCalendarDays(endDateGrid, startDateGrid) + 1;
    const weeksCount = Math.ceil(totalDays / 7);

    return Array.from({ length: weeksCount }, (_, weekIndex) => (
      <div
        className="grid grid-cols-7 text-center w-full gap-y-2 md:gap-y-1 mb-2 md:mb-1"
        key={`week-${weekIndex}`}
      >
        {Array.from({ length: 7 }, (_, dayIndex) => {
          const cloneDay = addDays(startDateGrid, weekIndex * 7 + dayIndex);
          const formattedDate = format(cloneDay, "d");

          const isCurrentMonth = isSameMonth(cloneDay, monthStart);
          const isSelStart = Boolean(
            activeRangeStart && isSameDay(cloneDay, activeRangeStart),
          );
          const isSelEnd = Boolean(
            activeRangeEnd && isSameDay(cloneDay, activeRangeEnd),
          );
          const isInConfirmedRange = Boolean(
            confirmedRange &&
            isWithinInterval(cloneDay, {
              start: confirmedRange[0],
              end: confirmedRange[1],
            }),
          );
          const isInHoverRange = Boolean(
            hasPreviewRange &&
            previewRange &&
            isWithinInterval(cloneDay, {
              start: previewRange[0],
              end: previewRange[1],
            }),
          );

          const isToday = isSameDay(cloneDay, new Date());
          const hasRangeNote = notedRanges.some((range) =>
            isWithinInterval(cloneDay, { start: range.start, end: range.end }),
          );
          const showRangeTrail = isInConfirmedRange || isInHoverRange;
          const rangeFillColor = isInConfirmedRange
            ? `${themeColor}38`
            : `${themeColor}22`;

          let cellStyles =
            "text-xs font-semibold flex items-center justify-center cursor-pointer transition-all duration-200 aspect-square rounded-full w-7 h-7 mx-auto relative z-10 ";
          let dynamicStyle: React.CSSProperties = {};

          if (isSelStart || isSelEnd) {
            cellStyles += "text-white shadow-md scale-110 ";
            dynamicStyle = {
              backgroundColor: hasConfirmedRange
                ? themeColor
                : `${themeColor}dd`,
            };
          } else if (showRangeTrail) {
            dynamicStyle = {
              color: themeColor,
            };
          } else if (hasRangeNote) {
            cellStyles += "text-amber-700 font-bold hover:bg-amber-100 ";
          } else if (dayIndex >= 5) {
            cellStyles += "hover:bg-gray-100 ";
            dynamicStyle = { color: themeColor };
          } else {
            cellStyles += "text-gray-800 hover:bg-gray-100 ";
          }

          if (!isCurrentMonth) {
            if (!(isSelStart || isSelEnd || showRangeTrail)) {
              cellStyles = cellStyles.replace("text-gray-800", "text-zinc-300");
              dynamicStyle = { color: "#d4d4d8" };
            }
          }

          if (isToday && isCurrentMonth && !(isSelStart || isSelEnd)) {
            cellStyles += "ring-1 ring-sky-500 ring-offset-1 ";
          }

          return (
            <div
              className={`flex items-center justify-center w-full relative group cursor-pointer ${!isCurrentMonth ? "opacity-60" : ""}`}
              key={cloneDay.toISOString()}
              onClick={() => onDateClick(cloneDay)}
              onMouseEnter={() => setHoverDate(cloneDay)}
              onMouseLeave={() => setHoverDate(null)}
            >
              {showRangeTrail && !isSelStart && !isSelEnd && (
                <div
                  className="absolute top-1/2 -mt-4 md:-mt-3.5 h-8 md:h-7 w-full z-0"
                  style={{ backgroundColor: rangeFillColor }}
                />
              )}
              {(isSelStart || isSelEnd) &&
                activeRangeStart &&
                activeRangeEnd &&
                hasRangeSpan && (
                  <div
                    className={`absolute top-1/2 -mt-4 md:-mt-3.5 h-8 md:h-7 w-1/2 z-0 ${
                      isSelStart
                        ? cloneDay.getDay() === 0
                          ? "hidden"
                          : "right-0"
                        : cloneDay.getDay() === 1
                          ? "hidden"
                          : "left-0"
                    }`}
                    style={{ backgroundColor: rangeFillColor }}
                  />
                )}
              <div className={cellStyles} style={dynamicStyle}>
                {formattedDate}
              </div>
              {hasRangeNote && isCurrentMonth && !(isSelStart || isSelEnd) && (
                <div className="absolute bottom-0 md:bottom-[2px] w-1.5 h-1.5 md:w-1 md:h-1 rounded-full bg-amber-500 z-20 shadow-sm md:shadow-none" />
              )}
            </div>
          );
        })}
      </div>
    ));
  };

  const monthIndex = currentDate.getMonth();
  const activeImage = MONTH_IMAGES[monthIndex];
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

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center bg-zinc-200 overflow-y-auto overflow-x-hidden font-sans py-12 md:py-16 px-4 sm:px-6"
      style={{ perspective: "1200px" }}
    >
      <div
        className="relative w-full max-w-[480px] md:h-[610px] bg-white flex flex-col rounded-xl sm:rounded-2xl transition-transform duration-500 ease-out mt-8 md:mt-0 mb-8 md:mb-0"
        style={{
          transformOrigin: "center -30px", // approximately where the nail is
          transform: isFlipping
            ? "rotateX(8deg) scale(0.98)"
            : "rotateX(0deg) scale(1)",
          boxShadow: isFlipping
            ? "0 30px 60px -15px rgba(0,0,0,0.3)"
            : "0 20px 40px -10px rgba(0,0,0,0.15)",
        }}
      >
        {/* Wire-O Binding — Twin-Loop with Rounder Extreme Curvature */}
        <div className="absolute top-0 left-0 w-full z-30 pointer-events-none select-none -translate-y-[70%]">
          <svg
            width="100%"
            viewBox="0 0 480 66"
            preserveAspectRatio="xMidYMid meet"
            className="overflow-visible"
          >
            <defs>
              <filter
                id="wire-shadow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow
                  dx="0.3"
                  dy="0.8"
                  stdDeviation="0.5"
                  floodOpacity="0.25"
                />
              </filter>
            </defs>

            {/* === HORIZONTAL ROD with Central Hook === */}
            <g transform="translate(0, 6)">
              {/* Rod shadow */}
              <path
                d="M 10 28 L 225 28 Q 240 0, 255 28 L 470 28"
                fill="none"
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Main Rod */}
              <path
                d="M 10 28 L 225 28 Q 240 0, 255 28 L 470 28"
                fill="none"
                stroke="#2a2a2a"
                strokeWidth="4.2"
                strokeLinecap="round"
              />

              {/* Central Hook Stem */}
              <line
                x1="240"
                y1="14.5"
                x2="240"
                y2="-16"
                stroke="#2a2a2a"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {/* Nail head */}
              <circle
                cx="240"
                cy="-19"
                r="6.8"
                fill="#777"
                stroke="#555"
                strokeWidth="1.2"
              />
              {/* <line
                x1="240"
                y1="-22.5"
                x2="240"
                y2="-29"
                stroke="#999"
                strokeWidth="1.5"
                strokeLinecap="round"
              /> */}
              {/* <circle cx="240" cy="-29.5" r="1.3" fill="#bbb" /> */}
            </g>

            {/* === LEFT GROUP: 10 twin-loop pairs === */}
            {[...Array(10).keys()].map((i) => {
              const x = 20 + i * 20.8;
              const distFromCenter = 9 - i;
              const tilt = 1 + distFromCenter * 0.4;
              const loopHeight = 28 + distFromCenter * 0.2;
              const spread = 2;
              const backTilt = 1;
              const paperTop = 46.2; // Exactly 70% of 66, where the paper edge is

              return (
                <g key={`left-${i}`} filter="url(#wire-shadow)">
                  {/* Punched hole */}
                  <rect
                    x={x}
                    y="58"
                    width="12"
                    height="7"
                    rx="1.5"
                    fill="#141414"
                  />
                  <rect
                    x={x}
                    y="58"
                    width="12"
                    height="1.5"
                    rx="0.5"
                    fill="rgba(0,0,0,0.3)"
                  />

                  {/* Back Loop 1 (stops at paper edge to appear "behind") */}
                  <path
                    d={`M ${x + 3 + backTilt * 1.5} ${paperTop} C ${x + 3 + backTilt} 38, ${x + 3 + backTilt * 0.5} 32, ${x + 3 - tilt * 0.1} ${28}`}
                    fill="none"
                    stroke="#111"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  {/* Back Loop 2 */}
                  <path
                    d={`M ${x + 9 + backTilt * 1.5} ${paperTop} C ${x + 9 + backTilt} 38, ${x + 9 + backTilt * 0.5} 32, ${x + 9 - tilt * 0.1} ${28}`}
                    fill="none"
                    stroke="#111"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    opacity="0.85"
                  />

                  {/* Twin Loop 1 (left wire) — Front */}
                  <path
                    d={`M ${x + 3} 61 C ${x + 3 - tilt - spread} 61, ${x + 3 - tilt - spread} ${61 - loopHeight}, ${x + 3 - tilt * 0.3} ${28}`}
                    fill="none"
                    stroke="#333"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  {/* Twin Loop 2 (right wire) — Front */}
                  <path
                    d={`M ${x + 9} 61 C ${x + 9 - tilt - spread} 61, ${x + 9 - tilt - spread} ${61 - loopHeight}, ${x + 9 - tilt * 0.3} ${28}`}
                    fill="none"
                    stroke="#333"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}

            {/* === RIGHT GROUP: 10 twin-loop pairs === */}
            {[...Array(10).keys()].map((i) => {
              const x = 261 + i * 20.8;
              const distFromCenter = i;
              const tilt = 1 + distFromCenter * 0.4;
              const loopHeight = 28 + distFromCenter * 0.2;
              const spread = 2;
              const backTilt = 1;
              const paperTop = 46.2;

              return (
                <g key={`right-${i}`} filter="url(#wire-shadow)">
                  {/* Punched hole */}
                  <rect
                    x={x}
                    y="58"
                    width="12"
                    height="7"
                    rx="1.5"
                    fill="#141414"
                  />
                  <rect
                    x={x}
                    y="58"
                    width="12"
                    height="1.5"
                    rx="0.5"
                    fill="rgba(0,0,0,0.3)"
                  />

                  {/* Back Loop 1 (stops at paper edge to appear "behind") */}
                  <path
                    d={`M ${x + 3 - backTilt * 1.5} ${paperTop} C ${x + 3 - backTilt} 38, ${x + 3 - backTilt * 0.5} 32, ${x + 3 + tilt * 0.1} ${28}`}
                    fill="none"
                    stroke="#111"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  {/* Back Loop 2 */}
                  <path
                    d={`M ${x + 9 - backTilt * 1.5} ${paperTop} C ${x + 9 - backTilt} 38, ${x + 9 - backTilt * 0.5} 32, ${x + 9 + tilt * 0.1} ${28}`}
                    fill="none"
                    stroke="#111"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    opacity="0.85"
                  />

                  {/* Twin Loop 1 (left wire) — Front */}
                  <path
                    d={`M ${x + 3} 61 C ${x + 3 + tilt + spread} 61, ${x + 3 + tilt + spread} ${61 - loopHeight}, ${x + 3 + tilt * 0.3} ${28}`}
                    fill="none"
                    stroke="#333"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  {/* Twin Loop 2 (right wire) — Front */}
                  <path
                    d={`M ${x + 9} 61 C ${x + 9 + tilt + spread} 61, ${x + 9 + tilt + spread} ${61 - loopHeight}, ${x + 9 + tilt * 0.3} ${28}`}
                    fill="none"
                    stroke="#333"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Image Section */}
        <div className="relative h-[220px] md:h-[340px] overflow-hidden rounded-t-xl sm:rounded-t-2xl shrink-0 [transform:translateZ(0)]">
          <Image
            src={activeImage}
            alt="Calendar Hero"
            fill
            sizes="480px"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-between px-4 z-20 opacity-100 pb-12 md:pb-0">
            <button
              onClick={prevMonth}
              className="bg-white/30 backdrop-blur-md p-2 rounded-full hover:bg-white/60 transition shadow-lg text-white"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={nextMonth}
              className="bg-white/30 backdrop-blur-md p-2 rounded-full hover:bg-white/60 transition shadow-lg text-white"
            >
              <ChevronRight size={22} />
            </button>
          </div>
          <svg
            className="absolute bottom-0 left-0 w-full h-[60px] md:h-[150px]"
            style={{ color: themeColor }}
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <polygon points="0,40 45,98 100,20 100,100 0,100" />
          </svg>
          <svg
            className="absolute bottom-0 left-0 w-full h-[60px] md:h-[150px] text-white"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <polygon points="0,55 45,95 65,70 100,110 0,110" />
            <polygon points="0,100 100,100 100,110 0,110" />
          </svg>
          <div className="absolute bottom-3 md:bottom-6 right-4 md:right-6 text-right z-30 drop-shadow-lg">
            <div className="text-white text-lg md:text-2xl font-semibold leading-none opacity-90 tracking-widest">
              {format(currentDate, "yyyy")}
            </div>
            <button
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="group relative flex flex-col items-end outline-none focus:outline-none"
            >
              <div className="text-white text-4xl md:text-5xl font-black leading-none tracking-tighter uppercase mt-1 transition-transform group-hover:scale-105 active:scale-95 drop-shadow-md">
                {format(currentDate, "MMM")}
              </div>
              <div className="h-0.5 w-0 bg-white transition-all group-hover:w-full mt-0.5 md:mt-1 opacity-50" />
            </button>

            {/* Month Picker Overlay */}
            {isPickerOpen && (
              <div className="absolute bottom-full right-0 mb-4 w-[260px] md:w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-4 grid grid-cols-3 gap-2 border border-white/20 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {Array.from({ length: 12 }).map((_, i) => {
                  const date = new Date(2022, i, 1);
                  const isSelected = i === currentDate.getMonth();
                  return (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectMonth(i);
                      }}
                      className={`
                        px-2 py-3 rounded-xl text-xs md:text-[10px] font-bold uppercase transition-all
                        ${
                          isSelected
                            ? "bg-zinc-800 text-white scale-105 shadow-md"
                            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 hover:scale-105"
                        }
                      `}
                    >
                      {format(date, "MMM")}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Content: Notes + Calendar Grid */}
        <div className="flex flex-col-reverse md:flex-row flex-1 p-4 md:p-5 gap-3 md:gap-3 rounded-b-xl sm:rounded-b-2xl bg-white relative z-10 w-full">
          {/* Notes Section - Left */}
          <div className="w-full md:w-[34%] flex flex-col md:pr-4 md:border-r border-zinc-100 min-h-[120px] md:min-h-0 pt-3 md:pt-0 border-t md:border-t-0 md:border-b-0 pb-2 md:pb-0">
            <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start mb-2 md:mb-3">
              <h3 className="text-xs md:text-[12px] font-extrabold text-zinc-800 tracking-tight">
                Notes
              </h3>
              <p className="text-[10px] md:text-[8.5px] font-bold uppercase tracking-wider text-zinc-400 md:mt-0.5">
                {activeNotesLabel}
              </p>
            </div>
            <div className="relative flex-1 flex flex-col">
              <textarea
                className="w-full flex-1 resize-none bg-transparent outline-none text-xs md:text-[11px] font-medium text-zinc-700 leading-[24px] pt-[0px] custom-scrollbar break-words"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(transparent, transparent 23px, #e2e8f0 23px, #e2e8f0 24px)",
                  backgroundAttachment: "local",
                  backgroundPosition: "0 2px",
                }}
                value={activeNotes}
                onChange={handleNotesChange}
                placeholder="Write your notes..."
                spellCheck="false"
              />
            </div>
            <div className="mt-2 flex items-center justify-end">
              <button
                onClick={clearActiveNote}
                className={`text-[8.5px] font-bold uppercase tracking-wider transition-all duration-200 ${
                  activeNotes.length > 0
                    ? "opacity-80 hover:opacity-100 drop-shadow-sm"
                    : "opacity-0 pointer-events-none"
                }`}
                style={{
                  color: activeNotes.length > 0 ? themeColor : undefined,
                }}
                disabled={activeNotes.length === 0}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Calendar Grid - Right */}
          <div className="w-full md:w-[66%] flex flex-col md:pl-1">
            <div className="grid grid-cols-7 text-center mb-1 md:mb-2 pt-1 md:pt-0">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                (day, i) => (
                  <div
                    key={day}
                    className={`text-[10px] md:text-[9px] font-bold tracking-wider ${i >= 5 ? "" : "text-gray-500"}`}
                    style={i >= 5 ? { color: themeColor } : {}}
                  >
                    {day}
                  </div>
                ),
              )}
            </div>
            <div className="w-full relative h-[210px] md:h-[192px] flex flex-col justify-center gap-0.5 md:gap-0">
              {renderCells()}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
