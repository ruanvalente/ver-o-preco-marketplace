import { ShieldCheck } from "lucide-react";

import { HelpCard } from "./help-card";
import { NextStepPreviewCard } from "./next-step-preview-card";
import { RecoveryStepCard } from "./recovery-step-card";
import { SecurityTipCard } from "./security-tip-card";

export function AccessRecoveryPage() {
  return (
    <main className="bg-[#F8F7FC]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Recuperação de Acesso
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Siga as instruções com verificação segura para proteger sua conta
              e negócios no Pará.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col gap-6">
            <RecoveryStepCard />
            <HelpCard />
          </div>
          <div className="flex flex-col gap-6">
            <NextStepPreviewCard />
            <SecurityTipCard />
          </div>
        </div>
      </div>
    </main>
  );
}
