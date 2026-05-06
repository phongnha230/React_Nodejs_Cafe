# Stage 1: Installer - Cài đặt dependencies
FROM node:20-alpine AS installer

WORKDIR /app

# Copy files định nghĩa dependencies
COPY package*.json ./

# Cài đặt production dependencies và dọn dẹp cache ngay lập tức
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Runner - Image thực thi gọn nhẹ
FROM node:20-alpine

# Cài đặt tini để quản lý process tốt hơn (xử lý signals như SIGTERM)
RUN apk add --no-cache tini

WORKDIR /app

# Thiết lập biến môi trường
ENV NODE_ENV=production

# Copy node_modules từ stage installer
COPY --from=installer /app/node_modules ./node_modules

# Copy source code (đã được lọc qua .dockerignore)
COPY . .

# Sử dụng user 'node' có sẵn trong image alpine để tăng bảo mật (không chạy quyền root)
USER node

# Khai báo port ứng dụng
EXPOSE 5000

# Sử dụng tini làm entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

# Chạy ứng dụng bằng node trực tiếp (thay vì npm start để tiết kiệm tài nguyên)
CMD ["node", "app.js"]
