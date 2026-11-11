# ---------- Stage 1: build ----------
FROM node:22-slim AS build
WORKDIR /app

# Install dependencies first so Docker can reuse this layer when only code changes
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# API URLs come from docker-compose.yml (build args); Next bakes them into the build
ARG REACT_APP_API_URL
ARG REACT_APP_API_GRAPHQL_URL
ARG REACT_APP_API_WS
ENV REACT_APP_API_URL=$REACT_APP_API_URL \
	REACT_APP_API_GRAPHQL_URL=$REACT_APP_API_GRAPHQL_URL \
	REACT_APP_API_WS=$REACT_APP_API_WS

COPY . .
RUN yarn build

# ---------- Stage 2: run ----------
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
# Listen on all interfaces (Docker sets HOSTNAME to the container id)
ENV HOSTNAME=0.0.0.0

# "standalone" output (next.config.js) contains server.js + only the runtime packages
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/next-i18next.config.js ./

USER node
CMD ["node", "server.js"]
