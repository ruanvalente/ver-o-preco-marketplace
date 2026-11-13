"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Algo deu errado</h1>
        <p className="mt-2 text-muted-foreground">
          Não foi possível carregar esta página.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
