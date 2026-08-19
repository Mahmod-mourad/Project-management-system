# Frontend Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# corepack installs the pnpm version pinned in package.json ("packageManager"),
# so the image and CI never drift from the lockfile.
RUN corepack enable

# The lockfile covers the whole workspace, so every workspace manifest has to be
# present before install or --frozen-lockfile fails.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json
RUN pnpm install --frozen-lockfile --filter project-management-system

# NEXT_PUBLIC_* is inlined into the client bundle at build time, so this has to
# be a build argument. Passing it as a runtime environment variable, which is
# what docker-compose used to do, leaves the browser calling whatever the
# default in lib/api-client.ts was.
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build application
COPY . .
RUN pnpm build

# Runtime Stage
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built application from builder
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/pnpm-lock.yaml /app/pnpm-lock.yaml

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node_modules/.bin/next", "start"]
