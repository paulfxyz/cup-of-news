FROM node:20-alpine AS builder

# Build tools for any native modules (sharp, better-sqlite3, etc.)
RUN apk add --no-cache python3 make g++ vips-dev

WORKDIR /app
COPY package*.json ./
# Ensure node-gyp is available for native builds
RUN npm install -g node-gyp && npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

# Runtime: vips for sharp, build tools for native compile during npm ci
RUN apk add --no-cache python3 make g++ vips-dev

COPY package*.json ./
RUN npm install -g node-gyp && npm ci --omit=dev

# Strip build deps, keep only vips runtime
RUN apk del python3 make g++ vips-dev && apk add --no-cache vips

# Copy built output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared ./shared

# Create data directory for SQLite + images
RUN mkdir -p /data/images

ENV NODE_ENV=production
ENV DB_PATH=/data/espresso.db
ENV PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "dist/index.cjs"]
