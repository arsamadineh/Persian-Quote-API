# Dockerfile — Persian Quote API (multi-stage build)

# ---- Stage 1: deps ----
FROM oven/bun:1.4.3 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --backend=linker

# ---- Stage 2: build data + next ----
FROM deps AS builder
WORKDIR /app
COPY . .
# Generate canonical JSONL from legacy data.
RUN bun run build:data
# Validate canonical data invariants.
RUN bun run data:validate
# Build Next.js production application.
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# ---- Stage 3: runner ----
FROM oven/bun:1.4.3 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Non-root user for security.
RUN addgroup --system --gid 1001 bunjs && \
    adduser --system --uid 1001 bunjs
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/data ./data
USER bunjs
EXPOSE 3000
# Serve the Next.js app (includes /v1 and /api routes).
CMD ["bun", "run", "start"]
