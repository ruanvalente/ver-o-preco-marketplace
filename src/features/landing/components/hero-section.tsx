import Link from "next/link"
import { ArrowRight, Check, MapPin, Search } from "lucide-react"

import { Button } from "@/components/ui/button"

import { heroTrustItems } from "../data/landing-content"
import { ChatPreviewCard } from "./chat-preview-card"
import { PhoneMockup } from "./hero-phone-mockup"

export function HeroSection() {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative scroll-mt-24 overflow-hidden py-14 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 size-[28rem] rounded-full bg-primary/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 size-72 rounded-full bg-secondary/10 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="flex flex-col items-start">
            <p className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-border bg-card px-3 py-1.5 text-label-sm font-medium text-muted-foreground">
              <MapPin
                aria-hidden="true"
                className="size-3.5 shrink-0 text-primary"
              />
              <span>Marketplace Regional do Pará</span>
              <span aria-hidden="true" className="text-border">
                •
              </span>
              <span>Comércio Seguro e Local</span>
            </p>

            <h1
              id="hero-title"
              className="mt-6 text-balance text-headline-xl-mobile font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-headline-xl lg:text-5xl"
            >
              Compre e venda perto de você,{" "}
              <span className="text-primary">sem taxas e sem burocracia.</span>
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              O Ver-o-Preço conecta quem quer vender com quem está por perto, no
              Pará. Anuncie em minutos, converse pelo chat seguro e combine tudo
              direto com o vizinho — sem comissões e sem intermediários.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <Link href="/register">
                  Quero anunciar
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-6 text-base"
              >
                <Link href="/">
                  <Search aria-hidden="true" className="size-4" />
                  Explorar produtos
                </Link>
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {heroTrustItems.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success-surface text-success-strong">
                    <Check aria-hidden="true" className="size-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div
              aria-hidden="true"
              className="absolute inset-x-6 inset-y-10 rounded-[3rem] bg-primary-muted/70"
            />

            <div
              role="img"
              aria-label="Prévia do aplicativo Ver-o-Preço com anúncios próximos e uma conversa no Chat Seguro"
              className="relative"
            >
              <PhoneMockup className="relative z-10 sm:translate-x-6" />
              <ChatPreviewCard className="relative z-20 mx-auto mt-4 sm:absolute sm:-bottom-6 sm:left-0 sm:mx-0 sm:mt-0 sm:w-64" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
