import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTH_IMAGES } from "../lib/constants";

interface CalendarHeroProps {
  currentDate: Date;
  themeColor: string;
  isPickerOpen: boolean;
  setIsPickerOpen: (open: boolean) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  selectMonth: (idx: number) => void;
}

export default function CalendarHero({
  currentDate,
  themeColor,
  isPickerOpen,
  setIsPickerOpen,
  prevMonth,
  nextMonth,
  selectMonth,
}: CalendarHeroProps) {
  const monthIndex = currentDate.getMonth();
  const activeImage = MONTH_IMAGES[monthIndex];

  return (
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
  );
}
