# Kostay Frontend Modification Instructions

This client project is being migrated from nestar-next to kostay-next.

## Rules

- Preserve current project architecture
- Keep GraphQL/Apollo integration
- Do not rewrite the whole app
- Improve UI incrementally
- Do not add tests, fixtures, seed data or new doc files unless asked
- Visible text says "Stays" and "Hosts"; prices use the shared `formatKRW` helper; desktop first

## Backend facts

- Kostay is a booking platform: properties have `pricePerNight` and `maxGuests`.
- `propertyStatus` is ACTIVE / INACTIVE / DELETE. A booking never changes it.
- Bookings and payments live in PostgreSQL; the frontend only talks to GraphQL.
- Booking dates are plain `YYYY-MM-DD` strings (no time, no `toISOString()`).

## Docs (read only when the task needs it, not at the start of every session)

Docs are in ../kostay/docs/ai:

- Booking screens or booking/payment API: FRONTEND_MIGRATION.md ("Booking contract" section only)
- Product or domain decisions: DECISIONS.md
- What is left to do: NEXT_STEPS.md
- Do not read COMPLETED_TASKS.md or BACKEND_MIGRATION.md unless asked. Only append to COMPLETED_TASKS.md after a step is verified.

## Workflow

1. Analyze before editing. Questions are read-only; do not implement until I approve.
2. Backend runs at http://localhost:3007/graphql.
3. Make small incremental changes and run typecheck after each phase.
4. Do not remove working logic unless replaced safely.

## Package Manager

- Use Yarn for all frontend commands (`yarn install`). Do not use npm or pnpm.
