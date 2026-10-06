# AGENTS.md

Kraken trading front end in a pnpm + Turborepo monorepo. Start with [README.md](README.md), [docs/features.md](docs/features.md) and [docs/architecture.md](docs/architecture.md).

## Commands

- `pnpm quality-checks` — dependency check, type check, lint and tests; run before proposing a commit.
- `pnpm check:format` — Prettier, including Markdown.
- `BUNDLER=app-vite pnpm dev:app` — run the app.

## Where documentation goes

1. **Repo (`README.md`, `docs/`)** — what the code does now: features and architecture. Update it in the same change as the behavior it describes.
2. **Vault (via [grounder](https://github.com/andrej-kolic/grounder))** — plans, decisions and their alternatives, investigations, status. Nothing dated or speculative goes in the repo.

If this project is linked (`grounder status` shows `Linked: yes`):

- `grounder plan <text>` for a plan or roadmap, `grounder note <text>` for a decision or investigation, `grounder handoff <text>` at the end of a session.
- `grounder search <query>` before planning work, to find earlier decisions.
- `grounder path notes|plans|logs` prints where each lives; don't hard-code vault paths.

If grounder is not set up, keep plans in chat and ask where to save them.

## Agent rules

`.claude/rules/` and `.cursor/rules/` are generated from the playbook repo at the commit pinned in `rulesync.lock`. Move to the latest with `pnpm rules:update` and commit the result. Edit the source in the playbook repo, not the generated files.
