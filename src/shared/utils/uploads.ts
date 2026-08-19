// The backend stores only a relative key (e.g. "course-covers/<uuid>.webp"),
// never an absolute URL — the client builds the full URL from its own known
// API base, so this works the same in dev, behind a proxy, or in production.
export function getUploadUrl(key: string | null | undefined): string | null {
  if (!key) return null
  const base = import.meta.env.VITE_API_URL.replace(/\/$/, '')
  return `${base}/uploads/${key}`
}
