FROM oven/bun:latest AS base

FROM base AS build

WORKDIR /build

COPY . .
RUN bun install --frozen-lockfile
RUN bun --bun run build

FROM httpd:2.4 AS runtime
COPY --from=build /build/dist /usr/local/apache2/htdocs/
EXPOSE 80
