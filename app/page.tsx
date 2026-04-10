"use client";

import { useEffect } from "react";
import { useCalendarState } from "./hooks/useCalendarState";
import { useCalendarTheme } from "./hooks/useCalendarTheme";
import WireBinding from "./components/WireBinding";
import CalendarHero from "./components/CalendarHero";
import NotesSection from "./components/NotesSection";
import CalendarGrid from "./components/CalendarGrid";

export default function Home() {
  const {
    currentDate,
    previousDate,
    targetDate,
    startDate,
    endDate,
    hoverDate,
    setHoverDate,
    isFlipping,
    flipDirection,
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

  const { themeColor, getColor } = useCalendarTheme(currentDate);

  // Adjacent month colours — already pre-extracted by the hook,
  // so they're available synchronously the moment a flip starts.
  const prevThemeColor = previousDate
    ? getColor(previousDate.getMonth())
    : themeColor;
  const nextThemeColor = targetDate
    ? getColor(targetDate.getMonth())
    : themeColor;

  const showFlip = isFlipping && previousDate && flipDirection;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if focus is inside an input or textarea
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement
      ) {
        return;
      }
      if (isFlipping) return;

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        prevMonth();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        nextMonth();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipping, prevMonth, nextMonth]);

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
          className="paper-texture relative w-full md:h-[610px] bg-white flex flex-col rounded-xl sm:rounded-2xl"
          style={{
            transformOrigin: "center -30px",
            boxShadow:
              "0 40px 90px -10px rgba(0,0,0,0.45), 0 20px 45px -5px rgba(0,0,0,0.25), 0 8px 20px 0px rgba(0,0,0,0.12), 0 2px 6px 0px rgba(0,0,0,0.06)",
            zIndex: 5,
          }}
        >
          <WireBinding />

          {/* Flip stage — holds both old and new page layers */}
          <div
            className="relative flex-1 flex flex-col overflow-hidden rounded-t-xl sm:rounded-t-2xl rounded-b-xl sm:rounded-b-2xl"
            style={{ perspective: "1200px" }}
          >
            {/* ── NEXT: Old page (previousDate) overlays & flips away ── */}
            {showFlip && flipDirection === "next" && (
              <div
                key={`flip-next-${previousDate.toISOString()}`}
                className="absolute inset-0 z-20 bg-white flex flex-col page-flip-next"
                style={{ willChange: "transform, opacity" }}
              >
                <CalendarHero
                  currentDate={previousDate}
                  themeColor={prevThemeColor}
                  isPickerOpen={false}
                  setIsPickerOpen={() => {}}
                  prevMonth={() => {}}
                  nextMonth={() => {}}
                  selectMonth={() => {}}
                />
                <div className="flex flex-col-reverse md:flex-row flex-1 p-4 md:p-5 gap-3 md:gap-3 bg-white relative z-10 w-full">
                  <NotesSection
                    activeNotesLabel={activeNotesLabel}
                    activeNotes={activeNotes}
                    handleNotesChange={() => {}}
                    clearActiveNote={() => {}}
                    themeColor={prevThemeColor}
                  />
                  <CalendarGrid
                    currentDate={previousDate}
                    startDate={startDate}
                    endDate={endDate}
                    hoverDate={null}
                    setHoverDate={() => {}}
                    onDateClick={() => {}}
                    notedRanges={notedRanges}
                    themeColor={prevThemeColor}
                  />
                </div>
              </div>
            )}

            {/* ── PREV: New page (targetDate) overlays & flips back into view ── */}
            {showFlip && flipDirection === "prev" && targetDate && (
              <div
                key={`flip-prev-${targetDate.toISOString()}`}
                className="absolute inset-0 z-20 bg-white flex flex-col page-flip-prev-in"
                style={{ willChange: "transform, opacity" }}
              >
                <CalendarHero
                  currentDate={targetDate}
                  themeColor={nextThemeColor}
                  isPickerOpen={false}
                  setIsPickerOpen={() => {}}
                  prevMonth={() => {}}
                  nextMonth={() => {}}
                  selectMonth={() => {}}
                />
                <div className="flex flex-col-reverse md:flex-row flex-1 p-4 md:p-5 gap-3 md:gap-3 bg-white relative z-10 w-full">
                  <NotesSection
                    activeNotesLabel={activeNotesLabel}
                    activeNotes={activeNotes}
                    handleNotesChange={() => {}}
                    clearActiveNote={() => {}}
                    themeColor={nextThemeColor}
                  />
                  <CalendarGrid
                    currentDate={targetDate}
                    startDate={startDate}
                    endDate={endDate}
                    hoverDate={null}
                    setHoverDate={() => {}}
                    onDateClick={() => {}}
                    notedRanges={notedRanges}
                    themeColor={nextThemeColor}
                  />
                </div>
              </div>
            )}


            {/* ── Base page (current month) — always in flow ── */}
            <div
              className="flex flex-col flex-1"
            >
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
        </div>
      </div>
    </main>
  );
}
