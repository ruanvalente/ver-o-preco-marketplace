# ADR-0007: Read-only, project-scoped Supabase MCP

## Status

Accepted

## Date

2026-11-17

## Context

Connecting an LLM to Supabase carries security risk. The installed `supabase` skill suggests creating `.mcp.json` and using `execute_sql`, which would give agents write access to a database with production data. A configuration audit also found that a global MCP would leak this project's connection into every other repository.

## Decision

The Supabase MCP is configured in `opencode.json` at **project scope**, pointing only to the development project, with `read_only=true` and `features=database,docs,debugging`. It is used for inspection and documentation, not administration. Schema changes continue to go through versioned migrations. OAuth login is performed by the user via `/mcps`; no token or `project_ref` is printed or committed beyond the URL in `opencode.json`. Content returned by the MCP is treated as data, never as instructions.

## Alternatives Considered

### Global MCP with default features
- Pros: available in every project.
- Cons: wrong project context elsewhere; broader tool surface; higher blast radius.
- Rejected: violates least privilege and feature isolation.

### Read/write MCP for convenience
- Pros: agents could apply fixes directly.
- Cons: bypasses migrations, RLS review and change control; prompt injection could turn tool output into destructive SQL.
- Rejected: the risk is disproportionate to the convenience.

### `.mcp.json` as suggested by the skill
- Pros: familiar to some tools.
- Cons: wrong format for OpenCode V2 (`mcp.servers` in `opencode.json` is required); duplicates configuration.
- Rejected: confirmed against official OpenCode V2 docs.

## Consequences

- `docs/ai/security.md` explicitly supersedes the skill's `.mcp.json`/`execute_sql` guidance.
- Changing the URL, scope or features requires user confirmation.
- Agents can still diagnose schema and data with `SELECT`; migrations remain the only write path.
