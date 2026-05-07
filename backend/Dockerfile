FROM node:20-alpine AS installer

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine

RUN apk add --no-cache tini

WORKDIR /app

ENV NODE_ENV=production

COPY --from=installer /app/node_modules ./node_modules
COPY . .

RUN mkdir -p /app/logs /app/uploads && chown -R node:node /app

USER node

EXPOSE 5000

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "app.js"]
