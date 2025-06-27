# Stage 1: Build the Next.js application
FROM node:23 AS builder

WORKDIR /app
RUN corepack enable

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json pnpm-lock.yaml .npmrc ./
COPY prisma ./prisma
COPY .env .env

# Install dependencies
RUN pnpm install

# Set environment variables for building
RUN pnpm exec next telemetry disable

COPY . .

# Expose port 3000
EXPOSE 3000

CMD if [ "$NODE_ENV" = "development" ]; then \
      sh -c "pnpm run dev"; \
    elif [ "$NODE_ENV" = "production" ]; then \
      sh -c "pnpm run build && pnpm start"; \
    else \
      echo "No valid node_env specified"; \
    fi
