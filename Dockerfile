# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Public browser endpoints, embedded by Next.js at build time. Never pass secrets here.
# Changing these requires rebuilding the image; runtime environment overrides do not apply.
ARG REACT_APP_API_URL
ARG REACT_APP_API_GRAPHQL_URL
ARG REACT_APP_API_WS
ENV REACT_APP_API_URL=$REACT_APP_API_URL \
    REACT_APP_API_GRAPHQL_URL=$REACT_APP_API_GRAPHQL_URL \
    REACT_APP_API_WS=$REACT_APP_API_WS
RUN test -n "$REACT_APP_API_URL" && \
    test -n "$REACT_APP_API_GRAPHQL_URL" && \
    test -n "$REACT_APP_API_WS" || \
    (echo 'All three REACT_APP_API_* build arguments are required.' >&2; exit 1)
RUN yarn typecheck && yarn build

FROM base AS runner
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/next-i18next.config.js ./next-i18next.config.js
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "server.js"]
