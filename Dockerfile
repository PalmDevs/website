FROM oven/bun:latest AS base
WORKDIR /build
COPY package.json bun.lock ./

FROM base AS prod-deps
RUN bun install --production --frozen-lockfile

FROM base AS build-deps
RUN bun install --frozen-lockfile

FROM build-deps AS build
ENV NODE_ENV=build
COPY . .
RUN bun --bun run build

FROM base AS release

WORKDIR /app
COPY --from=build /build/dist/ /app/dist/
COPY --from=build /build/server.ts /app/server.ts
COPY --from=prod-deps /build/node_modules/ /app/node_modules/

USER bun

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

ENTRYPOINT [ "bun", "--bun", "run", "server.ts" ]