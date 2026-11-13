import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Página não encontrada</h1>
        <p className="mt-2 text-muted-foreground">
          A página que você procura não existe ou foi removida.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Voltar para o início
        </Link>
      </div>
    </main>
  );
}
