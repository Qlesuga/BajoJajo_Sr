# Stage 1: Build the Next.js application
FROM node:23 AS builder

WORKDIR /app
RUN corepack enable

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY .env.prod .env

# Install dependencies
RUN pnpm install

# Set environment variables for building
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

RUN pnpm exec next telemetry disable

COPY . .

RUN pnpm run build

# Expose port 3000
EXPOSE 3000

# Start the Next.js application in production mode
CMD ["sh", "-c","pnpm run db:push && pnpm start"]
