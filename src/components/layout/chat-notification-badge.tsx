type ChatNotificationBadgeProps = {
  count: number
}

export function ChatNotificationBadge({ count }: ChatNotificationBadgeProps) {
  if (count <= 0) {
    return null
  }

  const visibleCount = count > 9 ? "9+" : String(count)

  return (
    <span
      aria-label={`${visibleCount} conversas com nova mensagem`}
      className="absolute -right-1.5 -top-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground"
    >
      {visibleCount}
    </span>
  )
}
