# syntax=docker.io/docker/dockerfile:1

# Step 1: Dependencies Stage
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies based on lockfile
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Step 2: Builder Stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set environment variable for standalone build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application (creates .next/standalone)
RUN corepack enable pnpm && pnpm run build

# Step 3: Runner Stage (Minimal Production Image)
FROM node:18-alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set to production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone output (contains only necessary files)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static files (if not using CDN)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application using the standalone server
CMD ["node", "server.js"]
