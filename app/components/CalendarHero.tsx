import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTH_IMAGES } from "../lib/constants";

interface CalendarHeroProps {
  currentDate: Date;
  themeColor: string;
  prevMonth: () => void;
  nextMonth: () => void;
}

export default React.memo(function CalendarHero({
  currentDate,
  themeColor,
  prevMonth,
  nextMonth,
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
      {/* 1px white strip to completely hide any subpixel antialiasing line at the joined edge */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white z-20" />
      <div className="absolute bottom-3 md:bottom-6 right-4 md:right-6 text-right z-30 drop-shadow-lg">
        <div className="text-white text-lg md:text-2xl font-semibold leading-none opacity-90 tracking-widest">
          {format(currentDate, "yyyy")}
        </div>
        <div className="flex flex-col items-end">
          <div className="text-white text-4xl md:text-5xl font-black leading-none tracking-tighter uppercase mt-1 drop-shadow-md">
            {format(currentDate, "MMM")}
          </div>
        </div>
      </div>
    </div>
  );
});
