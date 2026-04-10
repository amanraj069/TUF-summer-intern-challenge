import { Holiday } from "../types";

/**
 * Supplementary Indian holidays not covered by the Google Calendar API.
 * These are merged with the API results to ensure completeness.
 */

type SupplementaryEntry = {
  month: number; // 1-indexed (Jan = 1)
  day: number;
  name: string;
};

// Fixed-date observances that Google Calendar may not include
const SUPPLEMENTARY_FIXED: SupplementaryEntry[] = [
  { month: 11, day: 14, name: "Children's Day" },
  { month: 1, day: 1, name: "New Year's Day" },
  { month: 5, day: 1, name: "May Day / Labour Day" },
];

/**
 * Returns supplementary holidays for a given year (fixed-date ones
 * that the Google Calendar API might omit). The caller should
 * de-duplicate against API data before merging.
 */
export function getSupplementaryHolidays(year: number): Holiday[] {
  return SUPPLEMENTARY_FIXED.map((h) => ({
    date: `${year}-${String(h.month).padStart(2, "0")}-${String(h.day).padStart(2, "0")}`,
    name: h.name,
    localName: h.name,
    countryCode: "IN",
    fixed: true,
    global: false,
    types: ["Observance"],
  }));
}
