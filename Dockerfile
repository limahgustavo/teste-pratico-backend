FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN node ace build

# ─── Production image ──────────────────────────────────────────────────────────
FROM node:24-alpine AS production

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3333

CMD ["sh", "-c", "node build/ace.js migration:run --force && node build/ace.js db:seed && node build/bin/server.js"]
