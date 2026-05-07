# Stage 1: Installer - Cai dat dependencies
FROM node:20-alpine AS installer

WORKDIR /app

# Copy files dinh nghia dependencies
COPY package*.json ./

# Cai dat production dependencies va don dep cache ngay lap tuc
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Runner - Image thuc thi gon nhe
FROM node:20-alpine

# Cai dat tini de quan ly process tot hon (xu ly signals nhu SIGTERM)
RUN apk add --no-cache tini

WORKDIR /app

# Thiet lap bien moi truong
ENV NODE_ENV=production

# Copy node_modules tu stage installer
COPY --from=installer /app/node_modules ./node_modules

# Copy source code (da duoc loc qua .dockerignore)
COPY . .

# Tao thu muc runtime can thiet va gan quyen cho user node
RUN mkdir -p /app/logs /app/uploads && chown -R node:node /app

# Su dung user 'node' co san trong image alpine de tang bao mat (khong chay quyen root)
USER node

# Khai bao port ung dung
EXPOSE 5000

# Su dung tini lam entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

# Chay ung dung bang node truc tiep (thay vi npm start de tiet kiem tai nguyen)
CMD ["node", "app.js"]
