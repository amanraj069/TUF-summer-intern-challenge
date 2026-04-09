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
    </main>
  );
}
