import { HelpCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function HelpCard() {
  return (
    <Card className="rounded-2xl border-border/80 shadow-sm">
      <CardContent className="flex flex-col gap-3 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 items-center justify-center rounded-full bg-primary-muted text-primary">
            <HelpCircle aria-hidden="true" className="size-4" />
          </span>
          <div className="space-y-2">
            <h3 className="text-base font-semibold">
              Não recebeu a mensagem de verificação?
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Verifique as abas Promoções e Spam do seu provedor. Caso continue
              enfrentando dificuldades com o acesso de produtor ou comprador
              regional, nossa equipe de suporte está a postos.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
