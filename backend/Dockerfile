# Sử dụng Node.js 20 với Alpine Linux (nhẹ)
FROM node:20-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy file package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies (chỉ production)
RUN npm ci --only=production

# Copy toàn bộ source code
COPY . .

# Khai báo port
EXPOSE 5000

# Lệnh chạy khi container start
CMD ["npm", "start"]
