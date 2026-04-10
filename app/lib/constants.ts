export const MONTH_IMAGES = [
  "https://images.unsplash.com/photo-1478265409131-1f65c88f965c?q=80&w=1000&auto=format&fit=crop", // Jan - Snow
  "https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?q=80&w=1000&auto=format&fit=crop", // Feb - Lake
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?q=80&w=1000&auto=format&fit=crop", // Mar - Spring Blossom
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=1000&auto=format&fit=crop", // Apr - Hills
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop", // May - Beach
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1000&auto=format&fit=crop", // Jun - Peak Summer
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1000&auto=format&fit=crop", // Jul - Ocean
  "https://images.unsplash.com/photo-1508964942454-1a56651d54ac?q=80&w=1000&auto=format&fit=crop", // Aug - Forest
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop", // Sep - Fall Leaves
  "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1000&auto=format&fit=crop", // Oct - Autumn Path
  "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?q=80&w=1000&auto=format&fit=crop", // Nov - Cozy
  "https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?q=80&w=1000&auto=format&fit=crop", // Dec - Winter Cabin
];

export const DEFAULT_CALENDAR_DATE = new Date();

export const STORAGE_KEYS = {
  startDate: "calendar-start",
  endDate: "calendar-end",
  monthNotes: "calendar-month-notes",
  selectionNotes: "calendar-selection-notes",
  legacyNotes: "calendar-notes",
} as const;
