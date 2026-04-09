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
  "https://images.unsplash.com/photo-1542314831-c53cd3b82756?q=80&w=1000&auto=format&fit=crop", // Jan - Snow
  "https://images.unsplash.com/photo-1444458514120-cf17fa42d17c?q=80&w=1000&auto=format&fit=crop", // Feb - Lake
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?q=80&w=1000&auto=format&fit=crop", // Mar - Spring Blossom
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=1000&auto=format&fit=crop", // Apr - Hills
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop", // May - Beach
  "https://images.unsplash.com/photo-1433602484045-8fbc9f72c3d5?q=80&w=1000&auto=format&fit=crop", // Jun - Peak Summer
  "https://images.unsplash.com/photo-1473496169904-658ba37448eb?q=80&w=1000&auto=format&fit=crop", // Jul - Ocean
  "https://images.unsplash.com/photo-1508964942454-1a56651d54ac?q=80&w=1000&auto=format&fit=crop", // Aug - Forest
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop", // Sep - Fall Leaves
  "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1000&auto=format&fit=crop", // Oct - Autumn Path
  "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?q=80&w=1000&auto=format&fit=crop", // Nov - Cozy
  "https://images.unsplash.com/photo-1517260715366-5121b67f1395?q=80&w=1000&auto=format&fit=crop", // Dec - Winter Cabin
];

export default function Home() {
  const [themeColor, setThemeColor] = useState<string>("#38bdf8");
  const [currentDate, setCurrentDate] = useState(new Date()); // default to current
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

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

  // Extract theme color when image changes
  useEffect(() => {
    if (!isClient) return;
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
        setThemeColor(
          `rgb(${Math.floor(r / count)}, ${Math.floor(g / count)}, ${Math.floor(b / count)})`,
        );
      } catch (e) {
        console.error("Canvas taint error, fallback to default", e);
        setThemeColor("#38bdf8"); // fallback
      }
    };
  }, [currentDate, isClient]);

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

  const selectMonth = (idx: number) => {
    triggerFlipAnimation();
    const newDate = new Date(currentDate.getFullYear(), idx, 1);
    setCurrentDate(newDate);
    setIsPickerOpen(false);
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
        let dynamicStyle: React.CSSProperties = {};

        if (!isCurrentMonth) {
          cellStyles += "text-gray-300 pointer-events-none ";
        } else if (isSelStart || isSelEnd) {
          cellStyles += "text-white shadow-md scale-110 z-10 ";
          dynamicStyle = { backgroundColor: themeColor };
        } else if (isInSelRange || isHoverInRange) {
          dynamicStyle = {
            backgroundColor: `${themeColor}20`,
            color: themeColor,
          };
        } else if (i >= 5) {
          cellStyles += "hover:bg-gray-100 ";
          dynamicStyle = { color: themeColor };
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
              <div
                className="absolute top-1/2 -mt-3.5 h-7 w-full -z-10"
                style={{ backgroundColor: `${themeColor}20` }}
              />
            )}
            {(isSelStart || isSelEnd) &&
              startDate &&
              (endDate || hoverDate) && (
                <div
                  className={`absolute top-1/2 -mt-3.5 h-7 w-1/2 -z-10 ${
                    isSelStart
                      ? cloneDay.getDay() === 0
                        ? "hidden"
                        : "right-0"
                      : cloneDay.getDay() === 1
                        ? "hidden"
                        : "left-0"
                  }`}
                  style={{ backgroundColor: `${themeColor}20` }}
                />
              )}
            <div className={cellStyles} style={dynamicStyle}>
              {formattedDate}
            </div>
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
    <main className="fixed inset-0 flex items-center justify-center bg-zinc-200 overflow-hidden font-sans">
      <div
        className={`relative w-full max-w-[480px] h-[610px] bg-white shadow-2xl flex flex-col rounded-none transition-all duration-300 ${isFlipping ? "scale-[0.98] opacity-90" : "scale-100 opacity-100"}`}
      >
        {/* Wire-O Binding — Twin-Loop with Rounder Extreme Curvature */}
        <div className="absolute -top-[48px] left-0 w-full h-[66px] z-30 pointer-events-none select-none">
          <svg
            width="100%"
            height="66"
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
            <g>
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
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* Central Hook Stem */}
              <line
                x1="240"
                y1="0"
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
                r="2.5"
                fill="#777"
                stroke="#555"
                strokeWidth="0.8"
              />
              <line
                x1="240"
                y1="-21.5"
                x2="240"
                y2="-27"
                stroke="#999"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <circle cx="240" cy="-27.5" r="0.8" fill="#bbb" />
            </g>

            {/* === LEFT GROUP: 12 twin-loop pairs === */}
            {[...Array(12).keys()].map((i) => {
              const x = 20 + i * 17;
              const distFromCenter = 11 - i;
              const tilt = 1 + distFromCenter * 1.1; // More aggressive tilt for roundness
              const loopHeight = 27 + distFromCenter * 0.4;

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

                  {/* Twin Loop 1 (left wire) — Cubic Bezier for ROUNDNESS */}
                  <path
                    d={`M ${x + 3} 61 C ${x + 3 - tilt} 61, ${x + 3 - tilt} ${61 - loopHeight}, ${x + 3 - tilt * 0.3} ${28}`}
                    fill="none"
                    stroke="#333"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  {/* Twin Loop 2 (right wire) — Cubic Bezier for ROUNDNESS */}
                  <path
                    d={`M ${x + 9} 61 C ${x + 9 - tilt} 61, ${x + 9 - tilt} ${61 - loopHeight}, ${x + 9 - tilt * 0.3} ${28}`}
                    fill="none"
                    stroke="#333"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}

            {/* === RIGHT GROUP: 12 twin-loop pairs === */}
            {[...Array(12).keys()].map((i) => {
              const x = 261 + i * 17;
              const distFromCenter = i;
              const tilt = 1 + distFromCenter * 1.1;
              const loopHeight = 27 + distFromCenter * 0.4;

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

                  {/* Twin Loop 1 (left wire) — Cubic Bezier for ROUNDNESS */}
                  <path
                    d={`M ${x + 3} 61 C ${x + 3 + tilt} 61, ${x + 3 + tilt} ${61 - loopHeight}, ${x + 3 + tilt * 0.3} ${28}`}
                    fill="none"
                    stroke="#333"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  {/* Twin Loop 2 (right wire) — Cubic Bezier for ROUNDNESS */}
                  <path
                    d={`M ${x + 9} 61 C ${x + 9 + tilt} 61, ${x + 9 + tilt} ${61 - loopHeight}, ${x + 9 + tilt * 0.3} ${28}`}
                    fill="none"
                    stroke="#333"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Image Section */}
        <div className="relative h-[340px] overflow-hidden rounded-none shrink-0 [transform:translateZ(0)]">
          <Image
            src={activeImage}
            alt="Calendar Hero"
            fill
            sizes="480px"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-between px-4 z-20 opacity-100">
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
            className="absolute bottom-0 left-0 w-full h-[150px]"
            style={{ color: themeColor }}
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
          <div className="absolute bottom-6 right-6 text-right z-30 drop-shadow-lg">
            <div className="text-white text-xl font-light leading-none opacity-80">
              {format(currentDate, "yyyy")}
            </div>
            <button
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="group relative flex flex-col items-end outline-none focus:outline-none"
            >
              <div className="text-white text-4xl font-extrabold leading-none tracking-tight uppercase mt-1 transition-transform group-hover:scale-105 active:scale-95">
                {format(currentDate, "MMMM")}
              </div>
              <div className="h-0.5 w-0 bg-white transition-all group-hover:w-full mt-1 opacity-50" />
            </button>

            {/* Month Picker Overlay */}
            {isPickerOpen && (
              <div className="absolute bottom-full right-0 mb-4 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-4 grid grid-cols-3 gap-2 border border-white/20 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
                        px-2 py-3 rounded-xl text-[10px] font-bold uppercase transition-all
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
        <div className="flex p-5 pt-4 gap-3">
          {/* Notes Section - Left */}
          <div className="w-[32%] flex flex-col pr-3">
            <h3 className="text-[11px] font-bold text-gray-800 mb-2">Notes</h3>
            <textarea
              className="w-full flex-1 resize-none bg-transparent outline-none text-[10.5px] font-medium text-gray-700 leading-[24px] min-h-[168px] pt-[4px] custom-scrollbar break-words"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(transparent, transparent 23px, #cbd5e1 23px, #cbd5e1 24px)",
                backgroundAttachment: "local",
                backgroundPosition: "0 0",
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
                    className={`text-[9px] font-bold tracking-wide ${i >= 5 ? "" : "text-gray-500"}`}
                    style={i >= 5 ? { color: themeColor } : {}}
                  >
                    {day}
                  </div>
                ),
              )}
            </div>
            <div className="w-full relative h-[192px] flex flex-col justify-center">
              {renderCells()}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
