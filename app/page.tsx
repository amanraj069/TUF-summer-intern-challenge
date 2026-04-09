"use client";

import { useState, useEffect, useRef } from "react";
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
  isAfter,
  isBefore,
  isWithinInterval,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Thematic images for different months/seasons
const MONTH_IMAGES = [
  "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=1000&auto=format&fit=crop", // Jan
  "https://images.unsplash.com/photo-1478719059408-592965723cbc?q=80&w=1000&auto=format&fit=crop", // Feb
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?q=80&w=1000&auto=format&fit=crop", // Mar
  "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=1000&auto=format&fit=crop", // Apr
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=1000&auto=format&fit=crop", // May
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop", // Jun
  "https://images.unsplash.com/photo-1473496169904-658ba37448eb?q=80&w=1000&auto=format&fit=crop", // Jul
  "https://images.unsplash.com/photo-1433602484045-8fbc9f72c3d5?q=80&w=1000&auto=format&fit=crop", // Aug
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop", // Sep
  "https://images.unsplash.com/photo-1508964942454-1a56651d54ac?q=80&w=1000&auto=format&fit=crop", // Oct
  "https://images.unsplash.com/photo-1444458514120-cf17fa42d17c?q=80&w=1000&auto=format&fit=crop", // Nov
  "https://images.unsplash.com/photo-1517260715366-5121b67f1395?q=80&w=1000&auto=format&fit=crop", // Dec
];

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date()); // default to current
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  // Load state from local storage on mount
  useEffect(() => {
    setIsClient(true);
    setCurrentDate(new Date(2022, 0, 1)); // Enforce Jan 2022 locally to match design

    const savedNotes = localStorage.getItem("calendar-notes");
    if (savedNotes) setNotes(savedNotes);

    const savedStart = localStorage.getItem("calendar-start");
    const savedEnd = localStorage.getItem("calendar-end");
    if (savedStart) setStartDate(new Date(savedStart));
    if (savedEnd) setEndDate(new Date(savedEnd));
  }, []);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    localStorage.setItem("calendar-notes", newNotes);
  };

  const nextMonth = () => {
    triggerFlipAnimation();
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    triggerFlipAnimation();
    setCurrentDate(subMonths(currentDate, 1));
  };

  const triggerFlipAnimation = () => {
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 300);
  };

  const onDateClick = (day: Date) => {
    if (startDate && endDate) {
      setStartDate(day);
      setEndDate(null);
      localStorage.setItem("calendar-start", day.toISOString());
      localStorage.removeItem("calendar-end");
    } else if (startDate && !endDate) {
      if (isAfter(day, startDate) || isSameDay(day, startDate)) {
        setEndDate(day);
        localStorage.setItem("calendar-end", day.toISOString());
      } else {
        setStartDate(day);
        localStorage.setItem("calendar-start", day.toISOString());
      }
    } else {
      setStartDate(day);
      localStorage.setItem("calendar-start", day.toISOString());
    }
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDateGrid = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDateGrid = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDateGrid;
    let formattedDate = "";

    while (day <= endDateGrid) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;

        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelStart = startDate && isSameDay(day, startDate);
        const isSelEnd = endDate && isSameDay(day, endDate);
        const isInSelRange =
          startDate &&
          endDate &&
          isWithinInterval(day, { start: startDate, end: endDate });

        const isHoverInRange =
          startDate && !endDate && hoverDate && isAfter(hoverDate, startDate)
            ? isWithinInterval(day, { start: startDate, end: hoverDate })
            : false;

        let cellStyles =
          "text-xs font-semibold flex items-center justify-center cursor-pointer transition-all duration-200 aspect-square rounded-full w-7 h-7 mx-auto ";

        if (!isCurrentMonth) {
          cellStyles += "text-gray-300 pointer-events-none ";
        } else if (isSelStart || isSelEnd) {
          cellStyles += "bg-[#0f8cca] text-white shadow-md scale-110 z-10 ";
        } else if (isInSelRange || isHoverInRange) {
          cellStyles += "bg-[#0f8cca]/20 text-[#0f8cca] ";
        } else if (i >= 5) {
          cellStyles += "text-[#0f8cca] hover:bg-gray-100 ";
        } else {
          cellStyles += "text-gray-800 hover:bg-gray-100 ";
        }

        days.push(
          <div
            className="flex items-center justify-center w-full relative group"
            key={day.toString()}
            onClick={() => onDateClick(cloneDay)}
            onMouseEnter={() => setHoverDate(cloneDay)}
            onMouseLeave={() => setHoverDate(null)}
          >
            {(isInSelRange || isHoverInRange) && !isSelStart && !isSelEnd && (
              <div className="absolute top-1/2 -mt-3.5 h-7 w-full bg-[#0f8cca]/20 -z-10" />
            )}
            {(isSelStart || isSelEnd) &&
              startDate &&
              (endDate || hoverDate) && (
                <div
                  className={`absolute top-1/2 -mt-3.5 h-7 w-1/2 bg-[#0f8cca]/20 -z-10 ${
                    isSelStart
                      ? cloneDay.getDay() === 0
                        ? "hidden"
                        : "right-0"
                      : cloneDay.getDay() === 1
                        ? "hidden"
                        : "left-0"
                  }`}
                />
              )}
            <div className={cellStyles}>{formattedDate}</div>
          </div>,
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div
          className="grid grid-cols-7 text-center w-full gap-y-1 mb-1"
          key={day.toString()}
        >
          {days}
        </div>,
      );
      days = [];
    }
    return rows;
  };

  if (!isClient) return null;

  const monthIndex = currentDate.getMonth();
  const activeImage = MONTH_IMAGES[monthIndex];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-200 p-4 md:p-8 font-sans">
      <div
        className={`relative w-full max-w-[480px] bg-white shadow-2xl flex flex-col rounded-lg transition-all duration-300 ${isFlipping ? "scale-[0.98] opacity-90" : "scale-100 opacity-100"}`}
      >

        {/* Wire-O Binding — Integrated Hanger & Symmetric Twin-Wires */}
        <div className="absolute -top-[36px] left-0 w-full h-[54px] z-30 pointer-events-none px-6 select-none">
          <svg width="100%" height="54" viewBox="0 0 480 54" preserveAspectRatio="none" className="overflow-visible">
            <defs>
              <filter id="wire-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.4"/>
              </filter>
            </defs>

            {/* The Integrated Hanger Spine (Connects all loops and forms the hook) */}
            <g>
              {/* Horizontal segments and central hook */}
              <path
                d="M 15 36 L 185 36 Q 240 -10, 295 36 L 465 36"
                fill="none"
                stroke="#2a2a2a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Central Hanging Hook Ring */}
              <circle cx="240" cy="-14" r="3.5" stroke="#2a2a2a" strokeWidth="2.2" fill="none" />
              <rect x="238.8" y="-11" width="2.4" height="4" fill="#2a2a2a" />
            </g>

            {/* Render two symmetric groups of wire pairs: Left (10) and Right (10) */}
            {[...Array(10).keys()].map((i) => {
              const xLeft = 15 + i * 17;
              const xRight = 295 + i * 17;
              
              return (
                <g key={`group-${i}`}>
                  {/* Left Side */}
                  <g>
                    <rect x={xLeft} y="34" width="14" height="10" rx="1.5" fill="#111" />
                    {[2, 8].map((offset) => (
                      <path
                        key={`left-wire-${offset}`}
                        d={`M ${xLeft + offset} 40 Q ${xLeft + offset + 2} -6, ${xLeft + offset + 4} 40`}
                        fill="none"
                        stroke="#374151"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        filter="url(#wire-shadow)"
                      />
                    ))}
                  </g>
                  
                  {/* Right Side */}
                  <g>
                    <rect x={xRight} y="34" width="14" height="10" rx="1.5" fill="#111" />
                    {[2, 8].map((offset) => (
                      <path
                        key={`right-wire-${offset}`}
                        d={`M ${xRight + offset} 40 Q ${xRight + offset + 2} -6, ${xRight + offset + 4} 40`}
                        fill="none"
                        stroke="#374151"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        filter="url(#wire-shadow)"
                      />
                    ))}
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Image Section */}
        <div className="relative h-[340px] overflow-hidden rounded-t-lg shrink-0 group">
          <Image
            src={activeImage}
            alt="Calendar Hero"
            fill
            sizes="480px"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-between px-4 z-20">
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
            className="absolute bottom-0 left-0 w-full h-[150px] text-[#0f8cca]"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <polygon points="0,40 45,98 100,20 100,100 0,100" />
          </svg>
          <svg
            className="absolute bottom-0 left-0 w-full h-[150px] text-white"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <polygon points="0,55 45,95 65,70 100,110 0,110" />
            <polygon points="0,100 100,100 100,110 0,110" />
          </svg>
          <div className="absolute bottom-6 right-6 text-right z-10 drop-shadow-md">
            <div className="text-white text-2xl font-light leading-none">
              {format(currentDate, "yyyy")}
            </div>
            <div className="text-white text-4xl font-extrabold leading-none tracking-tight uppercase mt-1">
              {format(currentDate, "MMMM")}
            </div>
          </div>
        </div>

        {/* Bottom Content: Notes + Calendar Grid */}
        <div className="flex p-5 pt-4 gap-3">
          {/* Notes Section - Left */}
          <div className="w-[32%] flex flex-col pr-3">
            <h3 className="text-[11px] font-bold text-gray-800 mb-2 italic">
              Notes
            </h3>
            <textarea
              className="w-full flex-1 resize-none bg-transparent outline-none text-[10px] text-gray-600 leading-[24px] min-h-[168px]"
              style={{
                borderBottom: "1px solid #e5e7eb",
              }}
              value={notes}
              onChange={handleNotesChange}
              spellCheck="false"
            />
          </div>

          {/* Calendar Grid - Right */}
          <div className="w-[68%] flex flex-col">
            <div className="grid grid-cols-7 text-center mb-2">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                (day, i) => (
                  <div
                    key={day}
                    className={`text-[9px] font-bold tracking-wide ${i >= 5 ? "text-[#0f8cca]" : "text-gray-500"}`}
                  >
                    {day}
                  </div>
                ),
              )}
            </div>
            <div className="w-full relative">{renderCells()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
