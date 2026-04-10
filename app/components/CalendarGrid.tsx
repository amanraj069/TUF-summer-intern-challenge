import React from "react";
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
} from "date-fns";
import { SelectionRange } from "../types";
import { normalizeSelection } from "../lib/utils";

interface CalendarGridProps {
  currentDate: Date;
  startDate: Date | null;
  endDate: Date | null;
  hoverDate: Date | null;
  setHoverDate: (date: Date | null) => void;
  onDateClick: (day: Date) => void;
  notedRanges: SelectionRange[];
  themeColor: string;
}

export default function CalendarGrid({
  currentDate,
  startDate,
  endDate,
  hoverDate,
  setHoverDate,
  onDateClick,
  notedRanges,
  themeColor,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDateGrid = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDateGrid = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const confirmedRange =
    startDate && endDate ? normalizeSelection(startDate, endDate) : null;

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

  // Pivot: startDate selected but no endDate yet — show it highlighted
  const isPivotMode = Boolean(startDate && !endDate);

  const totalDays = differenceInCalendarDays(endDateGrid, startDateGrid) + 1;
  const weeksCount = Math.ceil(totalDays / 7);

  const renderCells = () =>
    Array.from({ length: weeksCount }, (_, weekIndex) => (
      <div
        className="grid grid-cols-7 text-center w-full gap-y-1 mb-1"
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

          const isPivot = isPivotMode && isSameDay(cloneDay, startDate!);
          const isToday = isSameDay(cloneDay, new Date());
          const hasRangeNote = notedRanges.some((range) =>
            isWithinInterval(cloneDay, { start: range.start, end: range.end }),
          );
          const showRangeTrail = isInConfirmedRange || isInHoverRange;
          const rangeFillColor = isInConfirmedRange
            ? `${themeColor}38`
            : `${themeColor}22`;

          let cellStyles =
            "text-xs font-semibold flex items-center justify-center cursor-pointer transition-all duration-200 aspect-square rounded-full w-6 h-6 md:w-7 md:h-7 mx-auto relative z-10 ";
          let dynamicStyle: React.CSSProperties = {};

          if (isPivot && isCurrentMonth) {
            // Pivot date: prominent themed highlight
            cellStyles += "text-white shadow-md scale-110 ";
            dynamicStyle = {
              backgroundColor: `${themeColor}cc`,
              boxShadow: `0 0 0 3px ${themeColor}40, 0 2px 8px ${themeColor}50`,
            };
          } else if (isSelStart || isSelEnd) {
            cellStyles += "text-white shadow-md scale-110 ";
            dynamicStyle = {
              backgroundColor: hasConfirmedRange
                ? themeColor
                : `${themeColor}dd`,
            };
          } else if (showRangeTrail) {
            dynamicStyle = { color: themeColor };
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
              key={cloneDay.toISOString()}
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
              {(isSelStart || isSelEnd) &&
                activeRangeStart &&
                activeRangeEnd &&
                hasRangeSpan && (
                  <div
                    className={`absolute top-1/2 -mt-3.5 h-7 w-1/2 z-0 ${
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

  return (
    <div className="w-full md:w-[66%] flex flex-col md:pl-1">
      <div className="grid grid-cols-7 text-center mb-1 md:mb-2 pt-1 md:pt-0">
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
      <div className="w-full relative h-[170px] md:h-[192px] flex flex-col justify-center gap-0">
        {renderCells()}
      </div>
    </div>
  );
}
