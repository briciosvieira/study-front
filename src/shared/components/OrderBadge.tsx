export function OrderBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-secondary px-2 text-xs font-semibold text-secondary-foreground">
      {label}
    </span>
  )
}
