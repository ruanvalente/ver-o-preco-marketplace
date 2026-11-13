"use client"

import { Monitor } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type DisconnectDevicesSwitchProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}

export function DisconnectDevicesSwitch({
  checked,
  onCheckedChange,
  className,
}: DisconnectDevicesSwitchProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-surface-container-low px-4 py-3",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary-muted text-primary">
          <Monitor aria-hidden="true" className="size-4" />
        </span>
        <Label htmlFor="disconnect-devices" className="text-sm font-medium">
          Desconectar outros dispositivos
        </Label>
      </div>
      <Switch
        id="disconnect-devices"
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label="Desconectar outros dispositivos"
      />
    </div>
  )
}
