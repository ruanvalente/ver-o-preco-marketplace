import Link from "next/link";
import {
  ArrowDownWideNarrow,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Pause,
  Pencil,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductImage } from "@/features/products/components/product-image";
import { CONDITION_LABELS } from "@/features/products/utils/catalog-options";
import { formatPrice } from "@/features/products/utils/format";
import { updateListingStatusAction } from "@/features/listings/services/listing.actions";
import type {
  ListingSummary,
  OwnerListingDashboard,
  OwnerListingFilters,
} from "@/features/listings/types/listing.types";
import { formatListingDate } from "@/features/listings/utils/format";
import { ListingStatusBadge } from "@/features/listings/components/listing-status-badge";

import { DashboardStatusButton } from "./dashboard-status-button";
import { buildDashboardHref } from "../utils/dashboard-filters";

type DashboardListingsProps = {
  result:
    | { ok: true; data: OwnerListingDashboard }
    | { ok: false; error: string };
  filters: OwnerListingFilters;
  actionError?: string;
  retryListingId?: string;
};

const STATUS_TABS = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "paused", label: "Pausados" },
  { value: "sold", label: "Vendidos" },
] as const;

const ACTION_ERRORS: Record<string, string> = {
  invalid: "Não foi possível identificar o anúncio.",
  publish:
    "Não foi possível reativar o anúncio. Verifique se ele tem uma foto e tente novamente.",
  pause: "Não foi possível pausar o anúncio. Tente novamente.",
};

function ListingRow({ listing }: { listing: ListingSummary }) {
  const canPublish = listing.status === "draft" || listing.status === "paused";
  const publishedAt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Belem",
  }).format(new Date(listing.createdAt));

  return (
    <article className="grid gap-4 border-b border-border p-4 last:border-b-0 sm:p-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(8rem,0.7fr)_minmax(9rem,0.8fr)] lg:items-center">
      <div className="flex min-w-0 gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-28">
          {listing.image ? (
            <ProductImage
              src={listing.image.url}
              alt={listing.image.alt}
              sizes="(min-width: 640px) 112px, 96px"
              className="object-cover"
            />
          ) : (
            <div
              role="img"
              aria-label={`${listing.title} sem imagem disponível`}
              className="flex size-full items-center justify-center px-2 text-center text-xs text-muted-foreground"
            >
              Sem imagem
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <ListingStatusBadge status={listing.status} />
            <span className="text-xs text-muted-foreground">
              {listing.category.name}
            </span>
          </div>
          <h3 className="line-clamp-2 font-semibold leading-5 text-foreground">
            {listing.title}
          </h3>
          <p className="text-lg font-semibold text-primary">
            {formatPrice(listing.price)}
          </p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin aria-hidden="true" className="size-3.5" />
            {listing.location.label} · {CONDITION_LABELS[listing.condition]}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-1">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Publicado</p>
          <p className="mt-1">{formatListingDate(listing.createdAt)}</p>
          <p className="text-xs text-muted-foreground">{publishedAt}</p>
        </div>
        <div className="lg:hidden">
          <p className="text-xs font-medium text-muted-foreground">Dados</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Visualizações e conversas por anúncio ainda não são contabilizadas.
          </p>
        </div>
        <p className="hidden text-xs leading-5 text-muted-foreground lg:block">
          Visualizações e conversas por anúncio ainda não são contabilizadas.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {listing.status === "sold" ? (
          <Button asChild size="sm" variant="outline" className="min-h-11">
            <Link href={`/listings/${listing.id}/edit`}>
              Ver detalhes
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild size="sm" variant="outline" className="min-h-11">
              <Link href={`/listings/${listing.id}/edit`}>
                <Pencil aria-hidden="true" className="size-4" />
                Editar
              </Link>
            </Button>
            {listing.status === "active" ? (
              <>
                <Button asChild size="sm" variant="ghost" className="min-h-11">
                  <Link href={`/products/${listing.id}`}>
                    <Eye aria-hidden="true" className="size-4" />
                    Ver anúncio
                  </Link>
                </Button>
                <form action={updateListingStatusAction}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <input type="hidden" name="intent" value="pause" />
                  <input type="hidden" name="returnTo" value="/dashboard" />
                  <DashboardStatusButton pendingLabel="Pausando…">
                    <Pause aria-hidden="true" className="size-4" />
                    Pausar
                  </DashboardStatusButton>
                </form>
              </>
            ) : canPublish ? (
              <form action={updateListingStatusAction}>
                <input type="hidden" name="listingId" value={listing.id} />
                <input type="hidden" name="intent" value="publish" />
                <input type="hidden" name="returnTo" value="/dashboard" />
                <DashboardStatusButton pendingLabel="Publicando…">
                  <RotateCcw aria-hidden="true" className="size-4" />
                  {listing.status === "paused"
                    ? "Reativar anúncio"
                    : "Publicar anúncio"}
                </DashboardStatusButton>
              </form>
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}

function DashboardEmptyState({ filters }: { filters: OwnerListingFilters }) {
  const hasQuery = Boolean(filters.query);
  const hasStatusFilter = filters.status !== "all";

  if (hasQuery) {
    return (
      <div className="px-5 py-12 text-center">
        <Search
          aria-hidden="true"
          className="mx-auto size-8 text-muted-foreground"
        />
        <h3 className="mt-3 font-semibold">Nenhum anúncio encontrado</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Tente buscar por outro título, categoria ou localidade.
        </p>
        <Button asChild variant="outline" className="mt-4 min-h-11">
          <Link href={buildDashboardHref({ ...filters, query: "", page: 1 })}>
            Limpar busca
          </Link>
        </Button>
      </div>
    );
  }

  if (hasStatusFilter) {
    const statusLabel =
      filters.status === "paused"
        ? "pausados"
        : filters.status === "sold"
          ? "vendidos"
          : "ativos";

    return (
      <div className="px-5 py-12 text-center">
        <h3 className="font-semibold">Você não tem anúncios {statusLabel}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Seus anúncios com outros status continuam disponíveis na aba Todos.
        </p>
        <Button asChild variant="outline" className="mt-4 min-h-11">
          <Link href={buildDashboardHref(filters, { status: "all", page: 1 })}>
            Ver todos os anúncios
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-5 py-12 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-muted text-primary">
        <Plus aria-hidden="true" className="size-6" />
      </span>
      <h3 className="mt-3 font-semibold">Você ainda não tem anúncios</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Publique seu primeiro anúncio para começar a vender perto de você.
      </p>
      <Button asChild className="mt-4 min-h-11">
        <Link href="/listings/new">
          <Plus aria-hidden="true" className="size-4" />
          Criar anúncio
        </Link>
      </Button>
    </div>
  );
}

export function DashboardListings({
  result,
  filters,
  actionError,
  retryListingId,
}: DashboardListingsProps) {
  if (!result.ok) {
    return (
      <section aria-labelledby="seller-listings-title" className="space-y-4">
        <h2 id="seller-listings-title" className="text-lg font-semibold">
          Seus anúncios
        </h2>
        <Alert variant="destructive" role="alert">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              Não foi possível carregar seus anúncios. Atualize a página para
              tentar novamente.
            </span>
            <Button asChild size="sm" variant="outline">
              <Link href={buildDashboardHref(filters)}>Tentar novamente</Link>
            </Button>
          </div>
        </Alert>
      </section>
    );
  }

  const { counts, page } = result.data;
  const start = page.total === 0 ? 0 : (page.page - 1) * page.pageSize + 1;
  const end = Math.min(page.page * page.pageSize, page.total);

  return (
    <section
      aria-labelledby="seller-listings-title"
      className="space-y-4"
      id="seus-anuncios"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="seller-listings-title" className="text-lg font-semibold">
            Seus anúncios
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe e atualize o que você está vendendo.
          </p>
        </div>
      </div>

      {actionError && ACTION_ERRORS[actionError] ? (
        <Alert variant="destructive" role="alert">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>{ACTION_ERRORS[actionError]}</p>
            {retryListingId &&
            (actionError === "publish" || actionError === "pause") ? (
              <form action={updateListingStatusAction}>
                <input type="hidden" name="listingId" value={retryListingId} />
                <input type="hidden" name="intent" value={actionError} />
                <input type="hidden" name="returnTo" value="/dashboard" />
                <DashboardStatusButton pendingLabel="Tentando novamente…">
                  <RotateCcw aria-hidden="true" className="size-4" />
                  {actionError === "publish"
                    ? "Tentar reativar"
                    : "Tentar pausar"}
                </DashboardStatusButton>
              </form>
            ) : null}
          </div>
        </Alert>
      ) : null}

      {filters.status === "all" && !filters.query && counts.all === 0 ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <DashboardEmptyState filters={filters} />
        </div>
      ) : (
        <>
          <nav aria-label="Filtrar anúncios por status">
            <ul className="flex gap-2 overflow-x-auto pb-1">
              {STATUS_TABS.map((tab) => {
                const count = counts[tab.value];
                const isCurrent = filters.status === tab.value;

                return (
                  <li key={tab.value} className="shrink-0">
                    <Link
                      href={buildDashboardHref(filters, {
                        status: tab.value,
                        page: 1,
                      })}
                      aria-current={isCurrent ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                        isCurrent
                          ? "border-primary bg-primary-muted text-primary"
                          : "border-border bg-card text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {tab.label}
                      <span className="text-xs">{count}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <form
            action="/dashboard"
            method="get"
            role="search"
            aria-label="Buscar e ordenar seus anúncios"
            className="grid gap-3 rounded-xl border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end"
          >
            {filters.status !== "all" ? (
              <input type="hidden" name="status" value={filters.status} />
            ) : null}
            <div className="relative">
              <label
                htmlFor="seller-listings-search"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Buscar nos meus anúncios
              </label>
              <Search
                aria-hidden="true"
                className="absolute top-10 left-3 size-4 text-muted-foreground"
              />
              <Input
                id="seller-listings-search"
                name="q"
                type="search"
                defaultValue={filters.query}
                maxLength={100}
                placeholder="Título, categoria ou localidade"
                className="min-h-11 pl-9"
              />
            </div>
            <div>
              <label
                htmlFor="seller-listings-sort"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Ordenar por
              </label>
              <div className="relative">
                <ArrowDownWideNarrow
                  aria-hidden="true"
                  className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground"
                />
                <select
                  id="seller-listings-sort"
                  name="sort"
                  defaultValue={filters.sort}
                  className="h-11 w-full min-w-44 appearance-none rounded-md border border-input bg-background pr-3 pl-9 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="recent">Mais recentes</option>
                  <option value="price_asc">Menor preço</option>
                  <option value="price_desc">Maior preço</option>
                </select>
              </div>
            </div>
            <Button type="submit" variant="outline" className="min-h-11">
              Aplicar
            </Button>
          </form>

          <div
            className="overflow-hidden rounded-xl border bg-card"
            aria-live="polite"
          >
            {page.items.length === 0 ? (
              <DashboardEmptyState filters={filters} />
            ) : (
              page.items.map((listing) => (
                <ListingRow key={listing.id} listing={listing} />
              ))
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Mostrando {start} a {end} de {page.total} anúncios
            </p>
            {page.totalPages > 1 ? (
              <nav aria-label="Paginação dos anúncios">
                <ul className="flex items-center gap-2">
                  <li>
                    {page.page <= 1 ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled
                        className="min-h-11"
                      >
                        <ChevronLeft aria-hidden="true" className="size-4" />
                        Anterior
                      </Button>
                    ) : (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="min-h-11"
                      >
                        <Link
                          href={buildDashboardHref(filters, {
                            page: page.page - 1,
                          })}
                          aria-label="Página anterior"
                        >
                          <ChevronLeft aria-hidden="true" className="size-4" />
                          Anterior
                        </Link>
                      </Button>
                    )}
                  </li>
                  <li>
                    <span className="px-2 text-sm text-muted-foreground">
                      Página {page.page} de {page.totalPages}
                    </span>
                  </li>
                  <li>
                    {page.page >= page.totalPages ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled
                        className="min-h-11"
                      >
                        Próxima
                        <ChevronRight aria-hidden="true" className="size-4" />
                      </Button>
                    ) : (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="min-h-11"
                      >
                        <Link
                          href={buildDashboardHref(filters, {
                            page: page.page + 1,
                          })}
                          aria-label="Próxima página"
                        >
                          Próxima
                          <ChevronRight aria-hidden="true" className="size-4" />
                        </Link>
                      </Button>
                    )}
                  </li>
                </ul>
              </nav>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
