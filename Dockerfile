FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN node ace build

WORKDIR /app/build

EXPOSE 3333

CMD ["sh", "-c", "node ace migration:run --force && node ace db:seed && node bin/server.js"]
