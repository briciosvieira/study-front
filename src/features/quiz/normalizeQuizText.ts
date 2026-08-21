// Some already-imported questions have a literal backslash-n (two
// characters: `\` and `n`) stored instead of a real line break — this
// converts both that and a literal `\r\n` into a real `\n` at display time,
// so old data reads correctly without a database backfill. New imports
// already arrive normalized (see quiz-import.processor.ts on the backend);
// this is purely a display-time correction and never touches the stored
// value. A string with no literal escape sequences passes through
// unchanged — real line breaks and normal spacing are never altered.
export function normalizeQuizDisplayText(value: string): string {
  return value.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n')
}
