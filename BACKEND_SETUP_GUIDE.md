# 🚀 Hướng Dẫn Setup Backend - Quy Trình Chuẩn

> **Tài liệu tóm gọn về quy trình và nguyên tắc setup backend cho bất kỳ dự án Node.js nào**

---

## 📋 Quy Trình Setup Backend (10 Bước)

### **1️⃣ Khởi Tạo Dự Án**
```bash
mkdir backend && cd backend
npm init -y
```

**Tạo cấu trúc thư mục:**
```
backend/
├── config/          # Cấu hình (database, logger, etc.)
├── controllers/     # Business logic
├── middleware/      # Auth, validation, error handling
├── models/          # Database models
├── routes/          # API endpoints
├── scripts/         # Seed data, migrations
├── logs/            # Log files
├── uploads/         # File uploads
├── .env             # Environment variables
├── app.js           # Entry point
└── package.json
```

---

### **2️⃣ Cài Đặt Dependencies**

**Core packages:**
```bash
npm install express dotenv cors body-parser
```

**Database (chọn 1):**
```bash
# MySQL/PostgreSQL
npm install sequelize mysql2

# MongoDB
npm install mongoose
```

**Security & Auth:**
```bash
npm install bcryptjs jsonwebtoken helmet express-rate-limit
```

**Validation & Logging:**
```bash
npm install express-validator winston
```

**File Upload (nếu cần):**
```bash
npm install multer
```

**Dev tools:**
```bash
npm install --save-dev nodemon
```

---

### **3️⃣ Cấu Hình Database**

**File: `config/database.js`**

**Nguyên tắc:**
- ✅ Sử dụng environment variables
- ✅ Connection pooling
- ✅ Error handling
- ✅ Charset UTF-8

**Ví dụ cấu trúc:**
```javascript
// Parse từ .env
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'mysql',
  pool: { max: 10, min: 0 },
  logging: false
});

// Test connection
sequelize.authenticate()
  .then(() => console.log('✅ DB connected'))
  .catch(err => console.error('❌ DB error:', err));
```

---

### **4️⃣ Thiết Lập Models**

**Nguyên tắc:**
- ✅ Mỗi model = 1 file riêng
- ✅ Định nghĩa rõ ràng data types
- ✅ Validation ở model level
- ✅ Timestamps (createdAt, updatedAt)

**Cấu trúc:**
```
models/
├── index.js          # Export tất cả models
├── associations.js   # Quan hệ giữa models
├── User.js
├── Product.js
└── Order.js
```

**Các quan hệ phổ biến:**
- `hasMany` / `belongsTo` (1:N)
- `belongsToMany` (N:N)
- `hasOne` (1:1)

---

### **5️⃣ Tạo Controllers**

**Nguyên tắc:**
- ✅ Mỗi resource = 1 controller
- ✅ CRUD operations chuẩn
- ✅ Try-catch cho mọi async function
- ✅ Log errors
- ✅ Return consistent response format

**Các function cơ bản:**
```javascript
exports.getAll = async (req, res) => { /* ... */ }
exports.getById = async (req, res) => { /* ... */ }
exports.create = async (req, res) => { /* ... */ }
exports.update = async (req, res) => { /* ... */ }
exports.delete = async (req, res) => { /* ... */ }
```

---

### **6️⃣ Định Nghĩa Routes**

**Nguyên tắc:**
- ✅ RESTful API design
- ✅ Versioning (`/api/v1/...`)
- ✅ Middleware cho auth/validation
- ✅ Phân quyền rõ ràng

**Cấu trúc route:**
```javascript
router.get('/', controller.getAll);           // Public
router.get('/:id', controller.getById);       // Public
router.post('/', auth, validate, controller.create);  // Protected
router.put('/:id', auth, isAdmin, controller.update); // Admin only
router.delete('/:id', auth, isAdmin, controller.delete);
```

---

### **7️⃣ Middleware & Security**

**Middleware cần thiết:**

| Middleware | Mục đích |
|------------|----------|
| `authMiddleware` | Xác thực JWT token |
| `roleMiddleware` | Phân quyền (admin/user) |
| `validationMiddleware` | Validate input data |
| `errorHandler` | Xử lý lỗi tập trung |
| `loggerMiddleware` | Log requests |
| `securityMiddleware` | Helmet, rate limiting |
| `uploadMiddleware` | Upload files (Multer) |

**Security checklist:**
- ✅ Hash passwords (bcrypt)
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ Input validation
- ✅ CORS configuration
- ✅ Helmet.js
- ✅ HTTPS (production)

---

### **8️⃣ Cấu Hình App.js**

**Thứ tự middleware quan trọng:**

```javascript
const app = express();

// 1. Security
app.use(helmet());

// 2. CORS
app.use(cors({ origin: allowedOrigins, credentials: true }));

// 3. Body parsing
app.use(bodyParser.json());

// 4. Static files
app.use('/uploads', express.static('uploads'));

// 5. Logging
app.use(loggerMiddleware);

// 6. Rate limiting
app.use('/api', rateLimiter);

// 7. Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// 8. 404 handler
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

// 9. Error handler (cuối cùng)
app.use(errorHandler);
```

---

### **9️⃣ Environment Variables**

**File `.env`:**
```env
# Database
DB_URL=mysql://user:pass@host:port/dbname

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key_here

# Frontend
FRONTEND_URL=http://localhost:3000

# Upload
UPLOAD_DIR=./uploads

# Logging
LOG_LEVEL=info
```

**⚠️ Quan trọng:**
- ✅ Tạo `.env.example` (không chứa giá trị thật)
- ✅ Add `.env` vào `.gitignore`
- ✅ Đổi `JWT_SECRET` trong production

---

### **🔟 Testing & Deployment**

**Development:**
```bash
npm run dev  # nodemon app.js
```

**Production checklist:**
- [ ] Set `NODE_ENV=production`
- [ ] Đổi `JWT_SECRET` mạnh
- [ ] Cấu hình database production
- [ ] Tắt logging chi tiết
- [ ] Setup HTTPS
- [ ] Backup database tự động
- [ ] Monitoring (PM2, New Relic)
- [ ] CI/CD pipeline
- [ ] Security audit

**Docker (optional):**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "app.js"]
```

---

## ✅ Best Practices Tổng Hợp

### **Security**
- Hash passwords (bcrypt, salt rounds ≥ 10)
- JWT với expiration time hợp lý
- Rate limiting cho API
- Validate mọi input từ client
- HTTPS trong production
- Không commit `.env`

### **Database**
- Sử dụng migrations cho schema changes
- Backup thường xuyên
- Indexes cho các trường hay query
- Normalize schema
- Transactions cho thao tác phức tạp

### **Code Quality**
- Cấu trúc MVC rõ ràng
- Async/await thay vì callbacks
- Error handling đầy đủ
- Logging có cấu trúc
- Comment khi cần thiết

### **Performance**
- Caching (Redis) khi cần
- Optimize queries
- Pagination cho large datasets
- Compress responses (gzip)
- CDN cho static files

---

## 🔧 Troubleshooting Nhanh

| Lỗi | Giải pháp |
|-----|-----------|
| Cannot connect to DB | Kiểm tra credentials, MySQL service, firewall |
| Port already in use | Kill process: `netstat -ano \| findstr :5000` (Windows) |
| JWT malformed | Check format `Bearer <token>`, verify JWT_SECRET |
| CORS blocked | Add origin vào `allowedOrigins` |
| Sequelize sync failed | Drop & recreate database |

---

## 📚 Tài Liệu Tham Khảo

- [Express.js Docs](https://expressjs.com/)
- [Sequelize Docs](https://sequelize.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [JWT.io](https://jwt.io/)

---

## 📝 Ghi Chú

**Tài liệu này là template tổng quát - điều chỉnh theo nhu cầu dự án cụ thể:**
- Thêm/bớt models theo yêu cầu
- Chọn database phù hợp (MySQL/MongoDB/PostgreSQL)
- Thêm features: payment gateway, email service, real-time (Socket.io), etc.
- Điều chỉnh security theo mức độ cần thiết

**Happy Coding! ☕**
