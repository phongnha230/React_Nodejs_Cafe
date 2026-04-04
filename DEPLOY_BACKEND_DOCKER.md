# Hướng dẫn Deploy Backend lên Docker

## 📋 Mục lục
1. [Yêu cầu](#yêu-cầu)
2. [Cấu trúc file](#cấu-trúc-file)
3. [Các bước deploy](#các-bước-deploy)
4. [Quản lý container](#quản-lý-container)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Yêu cầu

- **Docker Desktop** đã cài đặt và đang chạy
- **MySQL** (có thể dùng Docker hoặc local)
- File `.env` đã cấu hình đúng

---

## 📁 Cấu trúc file

```
backend/
├── Dockerfile              # File build Docker image
├── .dockerignore          # Loại trừ file không cần thiết
├── package.json           # Dependencies
├── app.js                 # Entry point
├── .env                   # Biến môi trường (không commit)
└── src/
    └── assets/            # Ảnh sản phẩm (được mount từ Frontend)
```

---

## 🚀 Các bước deploy

### Bước 1: Tạo Dockerfile

File `backend/Dockerfile`:

```dockerfile
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
```

### Bước 2: Tạo .dockerignore

File `backend/.dockerignore`:

```
node_modules
npm-debug.log
.env
.git
.gitignore
*.md
```

### Bước 3: Build Docker Image

```powershell
cd c:\Users\HPPAVILION\Documents\Cusor\Cafe_app\my-app\backend
docker build -t cafe-backend .
```

**Giải thích:**
- `docker build`: Lệnh build image
- `-t cafe-backend`: Đặt tên image là `cafe-backend`
- `.`: Build context là thư mục hiện tại

### Bước 4: Chạy Container

#### Cách 1: Chạy đơn lẻ (không dùng docker-compose)

```powershell
docker run -d \
  --name cafe_backend \
  -p 5000:5000 \
  -e DB_URL=mysql://root:password@host.docker.internal:3307/coffeeshop \
  -e JWT_SECRET=mysecretkey \
  -e PORT=5000 \
  -e FRONTEND_URL=http://localhost \
  cafe-backend
```

**Giải thích:**
- `-d`: Chạy background (detached mode)
- `--name cafe_backend`: Đặt tên container
- `-p 5000:5000`: Map port host:container
- `-e`: Thiết lập biến môi trường
- `host.docker.internal`: Trỏ đến localhost của máy host (để kết nối MySQL local)

#### Cách 2: Dùng docker-compose (khuyến nghị)

File `docker-compose.yml` (ở thư mục gốc):

```yaml
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: cafe_mysql
    environment:
      MYSQL_ROOT_PASSWORD: Anhnha@1905
      MYSQL_DATABASE: coffeeshop
    ports:
      - "3307:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - cafe_network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: cafe_backend
    environment:
      - DB_URL=mysql://root:Anhnha%401905@mysql:3306/coffeeshop
      - JWT_SECRET=mysecretkey
      - PORT=5000
      - FRONTEND_URL=http://localhost
    ports:
      - "5000:5000"
    depends_on:
      mysql:
        condition: service_healthy
    volumes:
      - ./Frontend/src/assets:/app/src/assets:ro
    networks:
      - cafe_network
    restart: unless-stopped

networks:
  cafe_network:
    driver: bridge

volumes:
  mysql_data:
```

Chạy:

```powershell
cd c:\Users\HPPAVILION\Documents\Cusor\Cafe_app\my-app
docker-compose up -d backend
```

---

## 🎛️ Quản lý container

### Xem logs

```powershell
# Xem logs realtime
docker logs -f cafe_backend

# Xem 100 dòng cuối
docker logs --tail 100 cafe_backend
```

### Kiểm tra trạng thái

```powershell
# Xem container đang chạy
docker ps

# Xem tất cả container (kể cả đã dừng)
docker ps -a
```

### Restart container

```powershell
docker restart cafe_backend
```

### Dừng container

```powershell
docker stop cafe_backend
```

### Xóa container

```powershell
# Dừng và xóa
docker rm -f cafe_backend
```

### Vào shell của container

```powershell
docker exec -it cafe_backend sh
```

### Rebuild sau khi sửa code

```powershell
# Với docker-compose
docker-compose up -d --build backend

# Hoặc build lại image
docker build -t cafe-backend ./backend
docker restart cafe_backend
```

---

## 🐛 Troubleshooting

### Lỗi 1: Port đã được sử dụng

**Lỗi:** `bind: address already in use`

**Nguyên nhân:** Port 5000 đang được dùng bởi process khác

**Giải pháp:**

```powershell
# Tìm process đang dùng port 5000
netstat -ano | findstr :5000

# Hoặc đổi port trong docker-compose.yml
ports:
  - "5001:5000"  # Map port 5001 của host -> 5000 của container
```

### Lỗi 2: Không kết nối được MySQL

**Lỗi:** `ECONNREFUSED` hoặc `Can't connect to MySQL server`

**Giải pháp:**

1. **Nếu MySQL chạy trên host (local):**
   ```
   DB_URL=mysql://root:password@host.docker.internal:3307/coffeeshop
   ```

2. **Nếu MySQL chạy trong Docker:**
   ```
   DB_URL=mysql://root:password@mysql:3306/coffeeshop
   ```
   (Dùng tên service trong docker-compose)

3. **Kiểm tra MySQL có chạy không:**
   ```powershell
   docker exec cafe_mysql mysql -u root -p -e "SHOW DATABASES;"
   ```

### Lỗi 3: Module not found

**Nguyên nhân:** Dependencies chưa được cài đặt

**Giải pháp:**

```powershell
# Rebuild image
docker-compose up -d --build backend
```

### Lỗi 4: Ảnh không hiển thị

**Nguyên nhân:** Folder assets chưa được mount

**Giải pháp:** Thêm volume mount trong `docker-compose.yml`:

```yaml
volumes:
  - ./Frontend/src/assets:/app/src/assets:ro
```

### Lỗi 5: Container tự động tắt

**Kiểm tra logs:**

```powershell
docker logs cafe_backend
```

**Nguyên nhân thường gặp:**
- Lỗi syntax trong code
- Thiếu biến môi trường
- Không kết nối được database

---

## 📊 Kiểm tra Backend hoạt động

### 1. Health check

```powershell
curl http://localhost:5000
```

Kết quả mong đợi: `☕ Cafe Backend is running!`

### 2. Test API

```powershell
# Lấy danh sách sản phẩm
curl http://localhost:5000/api/products

# Kiểm tra ảnh
curl -I http://localhost:5000/src/assets/Bạc_Hà.jpeg
```

### 3. Kiểm tra database connection

```powershell
docker exec cafe_backend node -e "const sequelize = require('./config/database'); sequelize.authenticate().then(() => console.log('✅ Connected')).catch(e => console.error('❌', e));"
```

---

## 🔐 Biến môi trường

File `.env` (backend):

```env
DB_URL=mysql://root:password@mysql:3306/coffeeshop
JWT_SECRET=your-secret-key-here
PORT=5000
FRONTEND_URL=http://localhost
```

> [!WARNING]
> **KHÔNG commit file `.env` lên Git!** Thêm vào `.gitignore`

---

## 📦 Deploy lên Production

### 1. Build production image

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "app.js"]
```

### 2. Sử dụng Docker secrets cho biến môi trường

```powershell
docker run -d \
  --name cafe_backend \
  -p 5000:5000 \
  --env-file .env.production \
  cafe-backend
```

### 3. Health check trong production

Thêm vào `docker-compose.yml`:

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5000"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## 🎯 Best Practices

1. ✅ Sử dụng `.dockerignore` để giảm kích thước image
2. ✅ Dùng multi-stage build nếu cần compile
3. ✅ Sử dụng Alpine Linux để image nhẹ hơn
4. ✅ Không hardcode credentials trong Dockerfile
5. ✅ Sử dụng health checks
6. ✅ Mount volumes cho data cần persist
7. ✅ Sử dụng networks để cách ly services
8. ✅ Set restart policy: `unless-stopped` hoặc `always`

---

## 📚 Tài liệu tham khảo

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
