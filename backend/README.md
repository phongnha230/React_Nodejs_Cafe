# Cafe Backend API

## Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình environment variables
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Cập nhật các giá trị trong file `.env`:
- `DB_URL`: URL kết nối MySQL database
- `JWT_SECRET`: Secret key cho JWT authentication
- `PORT`: Port cho server (mặc định 3000)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: URL của frontend cho CORS

### 3. Chạy server
```bash
# Development mode với nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Đăng ký user mới
- `POST /api/users/login` - Đăng nhập
- `GET /api/users/me` - Lấy thông tin user hiện tại

### User Management (Admin only)
- `GET /api/users` - Lấy danh sách users (có pagination)
- `GET /api/users/:id` - Lấy thông tin user theo ID
- `PUT /api/users/:id` - Cập nhật thông tin user
- `DELETE /api/users/:id` - Xóa user

### Orders
- `GET /api/orders` - Lấy danh sách orders (có pagination, filter theo status)
- `POST /api/orders` - Tạo order mới
- `GET /api/orders/:id` - Lấy order theo ID
- `PUT /api/orders/:id/status` - Cập nhật trạng thái order (admin only)

### Products
- `GET /api/products` - Lấy danh sách sản phẩm (có pagination)
- `POST /api/products` - Tạo sản phẩm mới (admin only)
- `GET /api/products/:id` - Lấy sản phẩm theo ID
- `PUT /api/products/:id` - Cập nhật sản phẩm (admin only)
- `DELETE /api/products/:id` - Xóa sản phẩm (admin only)

### Reviews
- `GET /api/reviews` - Lấy danh sách đánh giá (có pagination)
- `POST /api/reviews` - Tạo đánh giá mới
- `GET /api/reviews/:id` - Lấy đánh giá theo ID
- `PUT /api/reviews/:id` - Cập nhật đánh giá
- `DELETE /api/reviews/:id` - Xóa đánh giá (admin only)

### Payments
- `GET /api/payments` - Lấy danh sách thanh toán (có pagination)
- `POST /api/payments` - Tạo thanh toán mới
- `GET /api/payments/:id` - Lấy thanh toán theo ID
- `PUT /api/payments/:id` - Cập nhật thanh toán
- `DELETE /api/payments/:id` - Xóa thanh toán (admin only)

### Notifications
- `GET /api/notifications` - Lấy danh sách thông báo (có pagination)
- `POST /api/notifications` - Tạo thông báo mới (admin only)
- `GET /api/notifications/:id` - Lấy thông báo theo ID
- `PUT /api/notifications/:id` - Cập nhật thông báo (admin only)
- `DELETE /api/notifications/:id` - Xóa thông báo (admin only)

### Menu Sections
- `GET /api/menu-sections` - Lấy danh sách menu sections (có pagination)
- `POST /api/menu-sections` - Tạo menu section mới (admin only)
- `GET /api/menu-sections/:id` - Lấy menu section theo ID
- `PUT /api/menu-sections/:id` - Cập nhật menu section (admin only)
- `DELETE /api/menu-sections/:id` - Xóa menu section (admin only)

### News
- `GET /api/news/public` - Lấy tin tức công khai
- `GET /api/news/private` - Lấy tin tức riêng tư (cần đăng nhập)
- `GET /api/news/admin` - Lấy tin tức admin (admin only)

## Security Features

- **Rate Limiting**: Giới hạn số lượng requests
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **JWT Authentication**: Token-based authentication
- **Input Validation**: Validation với express-validator
- **Logging**: Winston logger với file logs

## Database

Sử dụng MySQL với Sequelize ORM. Database sẽ tự động sync khi khởi động server.

## Logs

Logs được lưu trong thư mục `logs/`:
- `error.log`: Chỉ chứa error logs
- `combined.log`: Tất cả logs
