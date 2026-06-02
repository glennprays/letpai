# Stage 1: Build the SvelteKit application
FROM node:22-slim AS builder

WORKDIR /app

# Enable pnpm and pin to the version used in development
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

# Copy dependency manifests first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Stage 2: Production image
FROM node:22-slim

WORKDIR /app

# Copy only the built output and runtime dependencies
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy entrypoint script for runtime env injection
COPY entrypoint.sh /app/entrypoint.sh

# SvelteKit adapter-node listens on PORT env var
ENV PORT=3000
ENV HOST=0.0.0.0
# Default API URL — override at runtime with -e VITE_API_URL=...
ENV VITE_API_URL=http://localhost:3000/api/v1
EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "build"]
