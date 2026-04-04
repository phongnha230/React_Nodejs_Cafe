# Hướng dẫn Docker Swarm cho Cafe App

## 📋 Mục lục
1. [Docker Swarm là gì?](#docker-swarm-là-gì)
2. [So sánh với Docker Compose](#so-sánh-với-docker-compose)
3. [Chuẩn bị](#chuẩn-bị)
4. [Khởi tạo Swarm](#khởi-tạo-swarm)
5. [Deploy ứng dụng](#deploy-ứng-dụng)
6. [Quản lý & Scale](#quản-lý--scale)
7. [Monitoring](#monitoring)
8. [Rollback & Updates](#rollback--updates)

---

## 🐝 Docker Swarm là gì?

**Docker Swarm** là công cụ orchestration (điều phối) containers được tích hợp sẵn trong Docker, giúp:

- ✅ Chạy nhiều containers trên nhiều servers (nodes)
- ✅ Auto-scaling (tự động tăng/giảm số containers)
- ✅ Load balancing tự động
- ✅ Rolling updates (deploy không downtime)
- ✅ Self-healing (tự động restart khi container chết)

---

## 📊 So sánh với Docker Compose

| Tính năng | Docker Compose | Docker Swarm |
|-----------|----------------|--------------|
| **Số máy** | 1 máy | Nhiều máy (cluster) |
| **File config** | `docker-compose.yml` | `docker-compose.yml` (tương tự) |
| **Lệnh deploy** | `docker-compose up` | `docker stack deploy` |
| **Auto-scaling** | ❌ | ✅ |
| **Load balancing** | ❌ | ✅ Tự động |
| **Rolling updates** | ❌ | ✅ |
| **Độ phức tạp** | Đơn giản | Trung bình |
| **Phù hợp** | Dev, small apps | Production, medium apps |

---

## 🔧 Chuẩn bị

### Yêu cầu

- Docker Desktop đã cài đặt
- Port mở: 2377 (cluster management), 7946 (node communication), 4789 (overlay network)

### Kiểm tra Docker Swarm

```powershell
# Kiểm tra Swarm có active không
docker info | Select-String "Swarm"
```

Nếu thấy `Swarm: inactive` → chưa khởi tạo

---

## 🚀 Khởi tạo Swarm

### Bước 1: Khởi tạo Swarm mode

```powershell
# Khởi tạo Swarm (máy này sẽ là manager node)
docker swarm init
```

**Output:**
```
Swarm initialized: current node (abc123) is now a manager.

To add a worker to this swarm, run the following command:
    docker swarm join --token SWMTKN-1-xxx... 192.168.1.100:2377
```

### Bước 2: Kiểm tra nodes

```powershell
docker node ls
```

**Output:**
```
ID              HOSTNAME   STATUS   AVAILABILITY   MANAGER STATUS
abc123 *        desktop    Ready    Active         Leader
```

---

## 📦 Chuẩn bị file docker-compose cho Swarm

### File `docker-compose.swarm.yml`

Tạo file mới dựa trên `docker-compose.yml` hiện tại:

```yaml
version: '3.8'

services:
  # ========== MySQL Database ==========
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: Anhnha@1905
      MYSQL_DATABASE: coffeeshop
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - cafe_network
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3

  # ========== Backend API ==========
  backend:
    image: cafe-backend:latest
    environment:
      - DB_URL=mysql://root:Anhnha%401905@mysql:3306/coffeeshop
      - JWT_SECRET=mysecretkey
      - PORT=5000
      - FRONTEND_URL=http://localhost
    networks:
      - cafe_network
    deploy:
      replicas: 3                    # Chạy 3 instances
      update_config:
        parallelism: 1               # Update từng cái một
        delay: 10s
        failure_action: rollback
      rollback_config:
        parallelism: 1
        delay: 5s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    depends_on:
      - mysql

  # ========== Frontend ==========
  frontend:
    image: cafe-frontend:latest
    ports:
      - "80:80"
    networks:
      - cafe_network
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    depends_on:
      - backend

networks:
  cafe_network:
    driver: overlay
    attachable: true

volumes:
  mysql_data:
```

### Thay đổi chính so với Docker Compose:

1. **`deploy` section**: Cấu hình cho Swarm
2. **`replicas`**: Số lượng containers chạy
3. **`update_config`**: Cách deploy version mới
4. **`restart_policy`**: Chính sách restart
5. **Network driver**: `overlay` thay vì `bridge`

---

## 🎯 Deploy ứng dụng lên Swarm

### Bước 1: Build images

```powershell
# Build backend image
cd backend
docker build -t cafe-backend:latest .

# Build frontend image
cd ../Frontend
docker build -t cafe-frontend:latest .
```

### Bước 2: Deploy stack

```powershell
cd c:\Users\HPPAVILION\Documents\Cusor\Cafe_app\my-app

# Deploy stack với tên "cafe"
docker stack deploy -c docker-compose.swarm.yml cafe
```

**Output:**
```
Creating network cafe_cafe_network
Creating service cafe_mysql
Creating service cafe_backend
Creating service cafe_frontend
```

### Bước 3: Kiểm tra services

```powershell
# Xem tất cả services
docker service ls
```

**Output:**
```
ID             NAME            MODE         REPLICAS   IMAGE
abc123         cafe_mysql      replicated   1/1        mysql:8.0
def456         cafe_backend    replicated   3/3        cafe-backend:latest
ghi789         cafe_frontend   replicated   2/2        cafe-frontend:latest
```

---

## 🎛️ Quản lý & Scale

### Xem chi tiết service

```powershell
# Xem chi tiết backend service
docker service ps cafe_backend
```

**Output:**
```
ID        NAME              IMAGE                  NODE      DESIRED STATE   CURRENT STATE
abc1      cafe_backend.1    cafe-backend:latest    desktop   Running         Running 2 minutes
abc2      cafe_backend.2    cafe-backend:latest    desktop   Running         Running 2 minutes
abc3      cafe_backend.3    cafe-backend:latest    desktop   Running         Running 2 minutes
```

### Scale service

```powershell
# Tăng backend lên 5 replicas
docker service scale cafe_backend=5

# Giảm frontend xuống 1 replica
docker service scale cafe_frontend=1
```

### Xem logs

```powershell
# Xem logs của service
docker service logs -f cafe_backend

# Xem logs của 1 task cụ thể
docker service logs cafe_backend.1
```

---

## 📊 Monitoring

### Kiểm tra trạng thái cluster

```powershell
# Xem nodes
docker node ls

# Xem services
docker service ls

# Xem tasks (containers) đang chạy
docker stack ps cafe
```

### Kiểm tra resource usage

```powershell
# Xem CPU/Memory của services
docker stats
```

---

## 🔄 Rolling Updates

### Update image mới

```powershell
# Build image mới với tag v2
docker build -t cafe-backend:v2 ./backend

# Update service (tự động rolling update)
docker service update --image cafe-backend:v2 cafe_backend
```

**Swarm sẽ:**
1. Dừng 1 container cũ
2. Start 1 container mới
3. Chờ 10s (theo `delay`)
4. Lặp lại cho containers còn lại

### Theo dõi update

```powershell
docker service ps cafe_backend
```

---

## ⏪ Rollback

### Rollback về version trước

```powershell
# Rollback backend về version trước
docker service rollback cafe_backend
```

### Rollback toàn bộ stack

```powershell
# Xóa stack hiện tại
docker stack rm cafe

# Deploy lại version cũ
docker stack deploy -c docker-compose.swarm.yml.old cafe
```

---

## 🐛 Troubleshooting

### Service không start

```powershell
# Xem lỗi
docker service ps cafe_backend --no-trunc

# Xem logs
docker service logs cafe_backend
```

### Container liên tục restart

```powershell
# Kiểm tra logs
docker service logs --tail 50 cafe_backend

# Kiểm tra health check
docker service inspect cafe_backend
```

### Network issues

```powershell
# Xem networks
docker network ls

# Inspect network
docker network inspect cafe_cafe_network
```

---

## 🔐 Secrets Management

### Tạo secret

```powershell
# Tạo secret cho DB password
echo "Anhnha@1905" | docker secret create mysql_root_password -

# Tạo secret cho JWT
echo "mysecretkey" | docker secret create jwt_secret -
```

### Sử dụng secrets trong docker-compose

```yaml
services:
  backend:
    secrets:
      - jwt_secret
    environment:
      - JWT_SECRET_FILE=/run/secrets/jwt_secret

secrets:
  jwt_secret:
    external: true
```

---

## 📈 Auto-scaling (nâng cao)

Swarm không có auto-scaling tự động như Kubernetes, nhưng có thể dùng script:

```powershell
# Script kiểm tra CPU và scale
$cpu = docker stats --no-stream --format "{{.CPUPerc}}" cafe_backend
if ($cpu -gt 70) {
    docker service scale cafe_backend=5
}
```

---

## 🌐 Multi-node Setup (tùy chọn)

### Thêm worker node

**Trên máy thứ 2:**

```powershell
# Chạy lệnh join token từ manager
docker swarm join --token SWMTKN-1-xxx... 192.168.1.100:2377
```

**Kiểm tra trên manager:**

```powershell
docker node ls
```

---

## 🎯 So sánh lệnh

| Tác vụ | Docker Compose | Docker Swarm |
|--------|----------------|--------------|
| Deploy | `docker-compose up -d` | `docker stack deploy -c file.yml stack-name` |
| Stop | `docker-compose down` | `docker stack rm stack-name` |
| Logs | `docker-compose logs` | `docker service logs service-name` |
| Scale | Sửa file, up lại | `docker service scale service=N` |
| Restart | `docker-compose restart` | `docker service update --force` |

---

## ⚠️ Khi nào NÊN dùng Swarm?

✅ **NÊN dùng:**
- Cần auto-scaling
- Cần zero-downtime deployment
- Cần load balancing tự động
- Có nhiều servers
- Production environment

❌ **KHÔNG NÊN dùng:**
- Chỉ có 1 server
- Development environment
- Traffic thấp, ổn định
- Team nhỏ, ít kinh nghiệm DevOps

---

## 🚀 Migration từ Docker Compose sang Swarm

### Bước 1: Backup

```powershell
# Backup database
docker exec cafe_mysql mysqldump -u root -pAnhnha@1905 coffeeshop > backup.sql
```

### Bước 2: Stop Compose

```powershell
docker-compose down
```

### Bước 3: Init Swarm

```powershell
docker swarm init
```

### Bước 4: Deploy Stack

```powershell
docker stack deploy -c docker-compose.swarm.yml cafe
```

### Bước 5: Restore data

```powershell
docker exec -i $(docker ps -q -f name=cafe_mysql) mysql -u root -pAnhnha@1905 coffeeshop < backup.sql
```

---

## 📚 Tài liệu tham khảo

- [Docker Swarm Documentation](https://docs.docker.com/engine/swarm/)
- [Docker Stack Deploy](https://docs.docker.com/engine/reference/commandline/stack_deploy/)
- [Swarm Mode Tutorial](https://docs.docker.com/engine/swarm/swarm-tutorial/)

---

## 💡 Kết luận

**Docker Swarm** là lựa chọn tốt khi:
- Bạn đã quen với Docker Compose
- Cần orchestration nhưng không muốn phức tạp như Kubernetes
- Có 2-10 servers
- Cần production-ready nhưng không quá lớn

**Cho dự án cafe của bạn:**
- Hiện tại: Dùng **Docker Compose** (đủ tốt)
- Tương lai: Nếu cần scale → **Docker Swarm**
- Sau này: Nếu rất lớn → **Kubernetes**
