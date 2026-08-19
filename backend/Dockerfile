# Build from the repository root:  docker build -f backend/Dockerfile .
FROM node:22-alpine AS builder

WORKDIR /app

# corepack installs the pnpm version pinned in package.json ("packageManager").
RUN corepack enable

# Every workspace manifest has to be present before install, because the
# lockfile covers the whole workspace.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json
RUN pnpm install --frozen-lockfile --filter erp-backend

COPY backend ./backend
RUN pnpm --filter erp-backend build

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache dumb-init

COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
