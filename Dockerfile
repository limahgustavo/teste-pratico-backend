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

CMD ["sh", "-c", "\
    echo '⏳ Aguardando banco de dados...' && \
    until node build/ace.js migration:run --force 2>&1; do \
    echo '🔄 DB não disponível, tentando novamente em 3s...' && sleep 3; \
    done && \
    echo '✅ Migrations aplicadas!' && \
    node build/ace.js db:seed && \
    echo '✅ Seeds executados!' && \
    node build/bin/server.js \
    "]
