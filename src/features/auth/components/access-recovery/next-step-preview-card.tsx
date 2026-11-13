"use client"

import { Check, Eye, EyeOff, KeyRound, Lock } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { DisconnectDevicesSwitch } from "./disconnect-devices-switch"
import { PasswordStrength } from "./password-strength"

export function NextStepPreviewCard() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [disconnect, setDisconnect] = useState(true)

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword

  return (
    <Card className="rounded-2xl border-border/80 shadow-sm">
      <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Eye aria-hidden="true" className="size-3.5" />
            Próxima Etapa (Prévia)
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Link via E-mail
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight sm:text-[22px]">
            Nova Senha
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Assim que abrir o e-mail autenticado pelo Supabase, você definirá
            suas novas credenciais neste formato:
          </p>
        </div>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <div className="relative">
              <KeyRound
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="h-12 pl-10 pr-10"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="size-4" />
                ) : (
                  <Eye aria-hidden="true" className="size-4" />
                )}
              </button>
            </div>
          </div>
          <PasswordStrength value={newPassword} />
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar nova senha</Label>
            <div className="relative">
              <Lock
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="h-12 pl-10 pr-10"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
              >
                {showConfirm ? (
                  <EyeOff aria-hidden="true" className="size-4" />
                ) : (
                  <Eye aria-hidden="true" className="size-4" />
                )}
              </button>
              {passwordsMatch ? (
                <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[#3B7668]">
                  <Check aria-hidden="true" className="size-4" />
                </span>
              ) : null}
            </div>
          </div>
          <DisconnectDevicesSwitch
            checked={disconnect}
            onCheckedChange={setDisconnect}
          />
          <Button className="h-12 w-full gap-2 text-base font-semibold">
            <Check aria-hidden="true" className="size-4" />
            Redefinir senha e entrar
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Padrão OWASP / Supabase Auth</span>
            <span>🔒 256-bit</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
