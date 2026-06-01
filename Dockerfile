# Stage 1: Build the SvelteKit application
FROM node:20-slim AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency manifests first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Stage 2: Production image
FROM node:20-slim

WORKDIR /app

# Copy only the built output and runtime dependencies
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# SvelteKit adapter-node listens on PORT env var
ENV PORT=3000
ENV HOST=0.0.0.0
EXPOSE 3000

CMD ["node", "build"]
