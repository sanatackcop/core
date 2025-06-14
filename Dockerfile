FROM node:16-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install -f

COPY . .

RUN npm run build && npm run run-migrations

FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
