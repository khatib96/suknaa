# Suknaa (سُكنى)

Syrian rental platform — monorepo (pnpm workspaces).

## Structure

- **`apps/web`** — Next.js 16 (App Router) public website
- **`packages/types`** — shared types (placeholder)
- **`packages/ui`** — shared UI (placeholder)
- **`infrastructure/`** — future Docker / IaC assets
- **`docs/`** — project documentation (v2)

## Development

From the repository root (requires [pnpm](https://pnpm.io/installation); e.g. `corepack enable` or `npx pnpm@9`):

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). App source lives under `apps/web/` (e.g. edit `apps/web/app/page.tsx`).

```bash
pnpm build
pnpm lint
```

See [`ai_memory.md`](ai_memory.md) and [`docs/`](docs/) for architecture and progress.
