import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";

import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/features/auth/services/session.service";
import { getSellerDashboardData } from "@/features/dashboard/services/dashboard.service";
import { SellerDashboard } from "@/features/dashboard/components/seller-dashboard";
import { parseDashboardFilters } from "@/features/dashboard/utils/dashboard-filters";
import type {
  DashboardFeedback,
  DashboardFilters,
} from "@/features/dashboard/types/dashboard.types";
import { isListingId } from "@/features/listings/schemas/listing.schemas";

export const metadata: Metadata = {
  title: "Painel do vendedor | Ver-o-Preço",
};

type DashboardRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function DashboardPage({ searchParams }: DashboardRouteProps) {
  return (
    <main className="flex w-full flex-1">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function DashboardContent({ searchParams }: DashboardRouteProps) {
  await connection();
  const user = await requireUser("/dashboard");
  const params = await searchParams;
  const filters: DashboardFilters = parseDashboardFilters(params);
  const rawListingId = firstValue(params.listingId);
  const feedback: DashboardFeedback = {
    error: firstValue(params.error),
    listingId:
      rawListingId && isListingId(rawListingId) ? rawListingId : undefined,
    updated: firstValue(params.updated),
  };
  const data = await getSellerDashboardData(user.id, filters);

  return (
    <SellerDashboard
      data={data}
      email={user.email}
      filters={filters}
      feedback={feedback}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-330 flex-1 space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      aria-busy="true"
    >
      <span role="status" className="sr-only">
        Carregando seu painel…
      </span>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="space-y-3">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-11 w-36 rounded-full" />
          <Skeleton className="h-11 w-44 rounded-full" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
