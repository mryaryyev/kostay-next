Go outside of this project and read kostay/docs/ai first!

# Kostay Frontend Modification Instructions

This client project is being migrated from nestar-next to kostay-next.

## Rules

- Preserve current project architecture
- Keep GraphQL/Apollo integration
- Do not rewrite the whole app
- Improve UI incrementally
- Do not add tests, fixtures, seed data or new doc files unless asked

## Backend Context

Before making any changes, read:

- kostay/docs/ai/BACKEND_MIGRATION.md
- kostay/docs/ai/DECISIONS.md
- kostay/docs/ai/FRONTEND_MIGRATION.md
- kostay/docs/ai/NEXT_STEPS.md
- and the rest inside kostay/docs/ai

Key backend facts:

- Kostay is a booking platform: properties have `pricePerNight` and `maxGuests`.
- `propertyStatus` is ACTIVE / INACTIVE / DELETE. A booking never changes it.
- Bookings and payments live in PostgreSQL; the frontend only talks to GraphQL.
- Booking dates are plain `YYYY-MM-DD` strings (no time, no `toISOString()`).

## Workflow

1. Analyze before editing.
2. Backend is running on port http://localhost:3007/graphql now.
3. Make small incremental changes.
4. Run typecheck after each phase.
5. Do not remove working logic unless replaced safely.
6. Update kostay/docs/ai/COMPLETED_TASKS.md after major changes (a few bullets, no new files).

## Package Manager

- Use Yarn for all frontend commands.
- Do not use npm or pnpm.
- Install dependencies with:

```bash
yarn install
```
