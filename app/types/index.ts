export type NotesMap = Record<string, string>;
export type NoteContext =
  | { type: "month" }
  | { type: "selection"; key: string };
export type SelectionRange = { key: string; start: Date; end: Date };

export interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  types: string[];
}
