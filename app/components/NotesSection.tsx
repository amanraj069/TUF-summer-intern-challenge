import React from "react";

interface NotesSectionProps {
  activeNotesLabel: string;
  activeNotes: string;
  handleNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  clearActiveNote: () => void;
  themeColor: string;
}

export default React.memo(function NotesSection({
  activeNotesLabel,
  activeNotes,
  handleNotesChange,
  clearActiveNote,
  themeColor,
}: NotesSectionProps) {
  return (
    <div className="w-full md:w-[34%] flex flex-col md:pr-4 md:border-r border-zinc-100 min-h-[90px] md:min-h-0 pt-3 md:pt-0 border-t md:border-t-0 md:border-b-0 pb-2 md:pb-0">
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
          className="w-full flex-1 resize-none bg-transparent outline-none text-xs md:text-[11px] font-medium text-zinc-700 leading-[24px] p-0 custom-scrollbar break-words"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 23px, #e2e8f0 23px, #e2e8f0 24px)",
            backgroundAttachment: "local",
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
  );
});
