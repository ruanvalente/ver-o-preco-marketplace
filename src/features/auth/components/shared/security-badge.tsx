import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

type SecurityBadgeProps = {
  className?: string
}

export function SecurityBadge({ className }: SecurityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-[#C7F1DF] px-3 py-1 text-xs font-semibold text-[#477567]",
        className
      )}
    >
      <ShieldCheck aria-hidden="true" className="size-3.5" />
      Ambiente Seguro SSL
    </span>
  )
}
