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

Backend project is in ../kostay/

- Kostay is a booking platform: properties have `pricePerNight` and `maxGuests`.
- `propertyStatus` is ACTIVE / INACTIVE / DELETE. A booking never changes it.
- Bookings and payments live in PostgreSQL; the frontend only talks to GraphQL.
- Booking dates are plain `YYYY-MM-DD` strings (no time, no `toISOString()`).

## Workflow

1. Analyze before editing. Questions are read-only; do not implement until I approve.
2. Backend runs at http://localhost:3007/graphql.
3. Make small incremental changes and run typecheck after each phase.
4. Do not remove working logic unless replaced safely.

## Package Manager

- Use Yarn for all frontend commands (`yarn install`). Do not use npm or pnpm.
