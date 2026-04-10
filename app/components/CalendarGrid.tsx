import React, { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  differenceInCalendarDays,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { SelectionRange, Holiday } from "../types";
import { normalizeSelection } from "../lib/utils";

interface DayCellProps {
  cloneDay: Date;
  isCurrentMonth: boolean;
  isPivotMode: boolean;
  startDate: Date | null;
  activeRangeStart: Date | null;
  activeRangeEnd: Date | null;
  confirmedRange: readonly [Date, Date] | null;
  hasConfirmedRange: boolean;
  hasPreviewRange: boolean;
  previewRange: readonly [Date, Date] | null;
  hasRangeNote: boolean;
  today: Date;
  themeColor: string;
  hasRangeSpan: boolean;
  holidays: Holiday[];
  dayIndex: number;
  onDateClick: (day: Date) => void;
  setHoverDate: (date: Date | null) => void;
}

const DayCell = React.memo(({
  cloneDay,
  isCurrentMonth,
  isPivotMode,
  startDate,
  activeRangeStart,
  activeRangeEnd,
  confirmedRange,
  hasConfirmedRange,
  hasPreviewRange,
  previewRange,
  hasRangeNote,
  today,
  themeColor,
  hasRangeSpan,
  holidays,
  dayIndex,
  onDateClick,
  setHoverDate,
}: DayCellProps) => {
  const formattedDate = format(cloneDay, "d");
  const isHoliday = holidays.length > 0;
  const isSelStart = Boolean(activeRangeStart && isSameDay(cloneDay, activeRangeStart));
  const isSelEnd = Boolean(activeRangeEnd && isSameDay(cloneDay, activeRangeEnd));
  
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

  const isPivot = isPivotMode && isSameDay(cloneDay, startDate!);
  const isToday = isSameDay(cloneDay, today);
  const showRangeTrail = isInConfirmedRange || isInHoverRange;
  const rangeFillColor = isInConfirmedRange ? `${themeColor}38` : `${themeColor}22`;

  let cellStyles =
    "text-[11px] md:text-xs font-semibold flex items-center justify-center cursor-pointer transition-all duration-200 aspect-square rounded-full w-[22px] h-[22px] md:w-7 md:h-7 mx-auto relative z-10 ";
  let dynamicStyle: React.CSSProperties = {};

  if (isPivot && isCurrentMonth) {
    cellStyles += "text-white shadow-md scale-110 ";
    dynamicStyle = {
      backgroundColor: `${themeColor}cc`,
      boxShadow: `0 0 0 3px ${themeColor}40, 0 2px 8px ${themeColor}50`,
    };
  } else if (isSelStart || isSelEnd) {
    cellStyles += "text-white shadow-md scale-110 ";
    dynamicStyle = {
      backgroundColor: hasConfirmedRange ? themeColor : `${themeColor}dd`,
    };
  } else if (showRangeTrail) {
    dynamicStyle = { color: themeColor };
  } else if (hasRangeNote) {
    cellStyles += "text-amber-700 font-bold hover:bg-amber-100 ";
  } else if (isHoliday) {
    cellStyles += "hover:bg-gray-100 ";
    dynamicStyle = { color: "#ef4444" }; // Red-500 for holidays
  } else if (cloneDay.getDay() === 0 || cloneDay.getDay() === 6) {
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

  if (isToday && isCurrentMonth && !(isSelStart || isSelEnd || isPivot)) {
    cellStyles += "text-white font-extrabold shadow-lg ";
    dynamicStyle = {
      ...dynamicStyle,
      background: "linear-gradient(135deg, #a3e635 0%, #facc15 100%)",
      color: "#1a2e05",
      boxShadow: "0 2px 8px rgba(163, 230, 53, 0.45), 0 0 0 2px rgba(250, 204, 21, 0.35)",
    };
  }

  return (
    <div
      className={`flex items-center justify-center w-full relative group cursor-pointer ${
        !isCurrentMonth ? "opacity-60" : ""
      }`}
      onClick={() => onDateClick(cloneDay)}
      onMouseEnter={() => setHoverDate(cloneDay)}
      onMouseLeave={() => setHoverDate(null)}
    >
      {showRangeTrail && !isSelStart && !isSelEnd && (
        <div
          className="absolute top-1/2 -mt-3.5 h-7 w-full z-0"
          style={{ backgroundColor: rangeFillColor }}
        />
      )}
      {(isSelStart || isSelEnd) && activeRangeStart && activeRangeEnd && hasRangeSpan && (
        <div
          className={`absolute top-1/2 -mt-3.5 h-7 w-1/2 z-0 ${
            isSelStart
              ? cloneDay.getDay() === 0 ? "hidden" : "right-0"
              : cloneDay.getDay() === 1 ? "hidden" : "left-0"
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
      {isHoliday && isCurrentMonth && (
        <div className={`absolute opacity-0 group-hover:opacity-100 transition-all duration-200 bottom-full mb-3 z-50 pointer-events-none scale-90 group-hover:scale-100 ${
          dayIndex >= 5 ? "right-0" : dayIndex <= 1 ? "left-0" : "left-1/2 -translate-x-1/2"
        }`}>
          <div className="bg-zinc-900/95 text-[10px] md:text-[11px] font-medium text-white px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-2xl backdrop-blur-md border border-white/10 flex flex-col items-center gap-0.5">
            <span className="text-red-400 text-[8px] font-bold tracking-widest uppercase">Holiday</span>
            {holidays.map((h, i) => (
              <span key={i}>{h.name}</span>
            ))}
            <div className={`absolute top-full border-x-[5px] border-x-transparent border-t-[5px] border-t-zinc-900/95 ${
              dayIndex >= 5 ? "right-3" : dayIndex <= 1 ? "left-3" : "left-1/2 -translate-x-1/2"
            }`} />
          </div>
        </div>
      )}
    </div>
  );
});

interface CalendarGridProps {
  currentDate: Date;
  startDate: Date | null;
  endDate: Date | null;
  hoverDate: Date | null;
  setHoverDate: (date: Date | null) => void;
  onDateClick: (day: Date) => void;
  notedRanges: SelectionRange[];
  themeColor: string;
  holidays: Holiday[];
}

export default React.memo(function CalendarGrid({
  currentDate,
  startDate,
  endDate,
  hoverDate,
  setHoverDate,
  onDateClick,
  notedRanges,
  themeColor,
  holidays,
}: CalendarGridProps) {
  const { startDateGrid, weeksCount, monthStart, today } = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(start);
    const gridStart = startOfWeek(start, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(end, { weekStartsOn: 1 });
    const days = differenceInCalendarDays(gridEnd, gridStart) + 1;
    return {
      monthStart: start,
      startDateGrid: gridStart,
      weeksCount: Math.ceil(days / 7),
      today: new Date(),
    };
  }, [currentDate]);

  const { confirmedRange, previewRange, hasConfirmedRange, hasPreviewRange, activeRangeStart, activeRangeEnd, hasRangeSpan, isPivotMode } = useMemo(() => {
    const confirmed = startDate && endDate ? normalizeSelection(startDate, endDate) : null;
    const preview = startDate && !endDate && hoverDate ? normalizeSelection(startDate, hoverDate) : null;
    const active = confirmed ?? preview;
    
    const activeStart = active ? active[0] : null;
    const activeEnd = active ? active[1] : null;
    
    return {
      confirmedRange: confirmed,
      previewRange: preview,
      hasConfirmedRange: Boolean(confirmed),
      hasPreviewRange: Boolean(preview) && !(confirmed) && !isSameDay(preview![0], preview![1]),
      activeRangeStart: activeStart,
      activeRangeEnd: activeEnd,
      hasRangeSpan: Boolean(activeStart && activeEnd) && !isSameDay(activeStart!, activeEnd!),
      isPivotMode: Boolean(startDate && !endDate),
    };
  }, [startDate, endDate, hoverDate]);

  const renderCells = () =>
    Array.from({ length: weeksCount }, (_, weekIndex) => (
      <div
        className="grid grid-cols-7 text-center w-full gap-y-[2px] md:gap-y-1 mb-1"
        key={`week-${weekIndex}`}
      >
        {Array.from({ length: 7 }, (_, dayIndex) => {
          const cloneDay = addDays(startDateGrid, weekIndex * 7 + dayIndex);
          const isCurrentMonth = isSameMonth(cloneDay, monthStart);
          const hasRangeNote = notedRanges.some((range) =>
            isWithinInterval(cloneDay, { start: range.start, end: range.end }),
          );
          const dayHolidays = holidays.filter((h) => isSameDay(parseISO(h.date), cloneDay));

          return (
            <DayCell
              key={cloneDay.toISOString()}
              cloneDay={cloneDay}
              isCurrentMonth={isCurrentMonth}
              isPivotMode={isPivotMode}
              startDate={startDate}
              activeRangeStart={activeRangeStart}
              activeRangeEnd={activeRangeEnd}
              confirmedRange={confirmedRange}
              hasConfirmedRange={hasConfirmedRange}
              hasPreviewRange={hasPreviewRange}
              previewRange={previewRange}
              hasRangeNote={hasRangeNote}
              holidays={dayHolidays}
              dayIndex={dayIndex}
              today={today}
              themeColor={themeColor}
              hasRangeSpan={hasRangeSpan}
              onDateClick={onDateClick}
              setHoverDate={setHoverDate}
            />
          );
        })}
      </div>
    ));

  return (
    <div className="w-[85%] mx-auto md:w-[66%] md:mx-0 flex flex-col md:pl-1">
      <div className="grid grid-cols-7 text-center mb-0 md:mb-2 pt-1 md:pt-0">
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, i) => (
          <div
            key={day}
            className={`text-[10px] md:text-[9px] font-bold tracking-wider ${
              i >= 5 ? "" : "text-gray-500"
            }`}
            style={i >= 5 ? { color: themeColor } : {}}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="w-full relative h-[140px] md:h-[192px] flex flex-col justify-center gap-0">
        {renderCells()}
      </div>
    </div>
  );
});
