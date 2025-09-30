FROM oven/bun:latest AS base

FROM base AS build

WORKDIR /build

COPY . .
RUN bun install --frozen-lockfile --production
RUN bun --bun run build

FROM base AS release

WORKDIR /app
COPY --from=build /build/dist/ /app/dist/

USER bun

ENTRYPOINT [ "bunx", "astro", "preview" ]
