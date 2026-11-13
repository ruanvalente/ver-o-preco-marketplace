import { REGISTRATION_STATS } from "../../data/register-content"

/**
 * Estatísticas resumidas da comunidade. O texto acompanha cada número para que
 * a informação não dependa apenas da leitura visual.
 */
export function RegistrationStats() {
  return (
    <dl className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border/60 bg-card p-4 shadow-card">
      {REGISTRATION_STATS.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col-reverse px-2 text-center"
        >
          <dt className="mt-1 text-badge-label leading-tight text-muted-foreground">
            {stat.label}
          </dt>
          <dd className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
