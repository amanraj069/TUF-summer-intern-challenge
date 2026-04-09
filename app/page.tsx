"use client";

import { useCalendarState } from "./hooks/useCalendarState";
import { useCalendarTheme } from "./hooks/useCalendarTheme";
import WireBinding from "./components/WireBinding";
import CalendarHero from "./components/CalendarHero";
import NotesSection from "./components/NotesSection";
import CalendarGrid from "./components/CalendarGrid";

export default function Home() {
  const {
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
  } = useCalendarState();

  const themeColor = useCalendarTheme(currentDate);

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center bg-zinc-200 overflow-y-auto overflow-x-hidden font-sans py-12 md:py-16 px-4 sm:px-6"
      style={{ perspective: "1200px" }}
    >
      <div className="relative w-full max-w-[480px] mt-8 md:mt-0 mb-8 md:mb-0">
        {/* Stacked pages behind the calendar */}
        {[...Array(4)].map((_, i) => {
          const layer = 4 - i;
          const offsetY = layer * 3;
          return (
            <div
              key={`page-${i}`}
              className="absolute inset-x-0 top-0 bottom-0 bg-white rounded-xl sm:rounded-2xl"
              style={{
                transform: `translateY(${offsetY}px)`,
                boxShadow: `0 ${1 + layer}px ${3 + layer * 2}px rgba(0,0,0,${0.06 + layer * 0.02})`,
                zIndex: i,
              }}
            />
          );
        })}

        <div
          className="paper-texture relative w-full md:h-[610px] bg-white flex flex-col rounded-xl sm:rounded-2xl transition-transform duration-500 ease-out"
          style={{
            transformOrigin: "center -30px", // approximately where the nail is
            transform: isFlipping
              ? "rotateX(8deg) scale(0.98)"
              : "rotateX(0deg) scale(1)",
            boxShadow: isFlipping
              ? "0 50px 100px -20px rgba(0,0,0,0.55), 0 25px 50px -10px rgba(0,0,0,0.3), 0 10px 20px -5px rgba(0,0,0,0.15)"
              : "0 40px 90px -10px rgba(0,0,0,0.45), 0 20px 45px -5px rgba(0,0,0,0.25), 0 8px 20px 0px rgba(0,0,0,0.12), 0 2px 6px 0px rgba(0,0,0,0.06)",
            zIndex: 5,
          }}
        >
          <WireBinding />

          <CalendarHero
            currentDate={currentDate}
            themeColor={themeColor}
            isPickerOpen={isPickerOpen}
            setIsPickerOpen={setIsPickerOpen}
            prevMonth={prevMonth}
            nextMonth={nextMonth}
            selectMonth={selectMonth}
          />

          <div className="flex flex-col-reverse md:flex-row flex-1 p-4 md:p-5 gap-3 md:gap-3 rounded-b-xl sm:rounded-b-2xl bg-white relative z-10 w-full">
            <NotesSection
              activeNotesLabel={activeNotesLabel}
              activeNotes={activeNotes}
              handleNotesChange={handleNotesChange}
              clearActiveNote={clearActiveNote}
              themeColor={themeColor}
            />

            <CalendarGrid
              currentDate={currentDate}
              startDate={startDate}
              endDate={endDate}
              hoverDate={hoverDate}
              setHoverDate={setHoverDate}
              onDateClick={onDateClick}
              notedRanges={notedRanges}
              themeColor={themeColor}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
