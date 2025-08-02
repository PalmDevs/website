FROM oven/bun:latest AS base

FROM base AS build

WORKDIR /build

RUN apt update
RUN apt install -y git

COPY . .
RUN bun install --frozen-lockfile --production
RUN bun --bun run build

FROM base AS release

WORKDIR /app
COPY --from=build /build/.output/ /app/

USER bun

ENTRYPOINT [ "bun", "--bun", "run", "server/index.mjs" ]
