export type NotesMap = Record<string, string>;
export type NoteContext =
  | { type: "month" }
  | { type: "selection"; key: string };
export type SelectionRange = { key: string; start: Date; end: Date };
