// "2" before "10", numeric prefixes compared as numbers, case-insensitive
// alphabetic fallback otherwise — Module.order isn't a real signal here (no
// UI ever sets it, every module is created at 0), so titles are the only
// meaningful ordering source for these lists.
export function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

export function naturalSortByTitle<T>(items: T[], getTitle: (item: T) => string): T[] {
  return [...items].sort((a, b) => naturalCompare(getTitle(a), getTitle(b)))
}
