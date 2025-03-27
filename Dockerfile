# Stage 1: Build the Next.js application
FROM node:23 AS builder

WORKDIR /app
RUN corepack enable

RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
RUN chmod +x /usr/local/bin/yt-dlp  # Make executable

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
      sh -c "yt-dlp -U && pnpm run dev"; \
    elif [ "$NODE_ENV" = "production" ]; then \
      sh -c "yt-dlp -U && pnpm run build && pnpm run db:push && pnpm start"; \
    else \
      echo "No valid node_env specified"; \
    fi
