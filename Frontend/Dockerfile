# ========== GIAI ĐOẠN BUILD ==========
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci

# Copy source code
COPY . .

# Build ứng dụng React
RUN npm run build

# ========== GIAI ĐOẠN PRODUCTION ==========
FROM nginx:alpine

# Copy file build từ giai đoạn trước
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Khai báo port
EXPOSE 80

# Chạy nginx
CMD ["nginx", "-g", "daemon off;"]
