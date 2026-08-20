import { useSearchParams } from 'react-router-dom'

// Keeps the active tab in the `?tab=` query param (not app state) so reload
// and direct links land back on the same tab — falls back to defaultValue
// for anything missing/invalid, and omits the param entirely when it's the
// default, keeping URLs clean.
export function useTabParam<T extends string>(values: readonly T[], defaultValue: T) {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = searchParams.get('tab')
  const active = (values as readonly string[]).includes(raw ?? '') ? (raw as T) : defaultValue

  function setActive(next: string) {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (next === defaultValue) {
          params.delete('tab')
        } else {
          params.set('tab', next)
        }
        return params
      },
      { replace: true },
    )
  }

  return [active, setActive] as const
}
