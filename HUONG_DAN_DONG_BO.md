# 🔄 Hướng Dẫn Đồng Bộ Dữ Liệu Frontend ↔️ MySQL

## ✅ Đã Hoàn Thành

### 1. **Products đã được đồng bộ vào MySQL**

- ✅ 13 products đã import vào database
- ✅ Frontend tự động load từ MySQL khi vào trang
- ✅ Fallback về localStorage nếu API lỗi

### 2. **Các trang đã cập nhật:**

- `HomePage.jsx` - Load products từ API
- `MenuPage.jsx` - Load products từ API
- `productStore.js` - Thêm function `loadFromAPI()`
- `productServices.js` - Sửa endpoint từ `/product` → `/products`

---

## 🚀 Cách Sử Dụng

### **Xem Products từ MySQL**

Khi vào trang web, products sẽ tự động load từ MySQL:

1. Mở trang **Trang chủ** hoặc **Menu**
2. Products sẽ tự động fetch từ backend
3. Nếu thành công → hiển thị dữ liệu MySQL
4. Nếu thất bại → hiển thị dữ liệu localStorage (backup)

---

## 📋 Scripts Quản Lý Database

### 1. **Đồng bộ Products từ Frontend vào MySQL**

```bash
cd backend
node scripts/syncProducts.js
```

### 2. **Xóa tất cả Payments**

```bash
cd backend
node scripts/clearPayments.js
```

### 3. **Xóa toàn bộ dữ liệu (Users, Orders, Payments)**

```bash
cd backend
node scripts/clearAllData.js
```

### 4. **Tạo Admin mới**

```bash
cd backend
node scripts/createAdminSimple.js
```

### 5. **Cập nhật Schema Database**

```bash
cd backend
node scripts/updateSchema.js
```

---

## 🗑️ Xóa Dữ Liệu Giả Từ Frontend

### **Cách 1: Dùng nút trong Admin Dashboard**

1. Login vào Admin Dashboard
2. Click nút **"🗑️ Xóa dữ liệu test"** ở góc phải
3. Confirm → Xóa toàn bộ localStorage
4. Trang tự động reload

### **Cách 2: Dùng Browser Console**

Mở Console (F12) và chạy:

```javascript
// Xóa từng loại
localStorage.removeItem('orders')
localStorage.removeItem('products')
localStorage.removeItem('payments')

// Hoặc xóa TẤT CẢ
localStorage.clear()

// Reload trang
location.reload()
```

---

## 🔧 Cấu Trúc Dữ Liệu

### **Frontend (localStorage)**

```javascript
{
  id: "p1",           // String UUID
  name: "Nước Bạc Hà",
  price: 30000,       // Number
  category: "juice",
  image: "src/assets/..."
}
```

### **Backend (MySQL)**

```sql
{
  id: 1,              -- Integer AUTO_INCREMENT
  name: "Nước Bạc Hà",
  price: 30000.00,    -- DECIMAL(10,2)
  category: "juice",
  image_url: "src/assets/...",
  created_at: "2024-..."
}
```

### **Mapping trong productStore**

- `image` (frontend) → `image_url` (backend)
- `id` String → `id` Integer (tự động convert)

---

## ⚠️ Lưu Ý Quan Trọng

### **1. Thứ tự ưu tiên load dữ liệu:**

1. **MySQL Database** (ưu tiên cao nhất)
2. **localStorage** (fallback khi API lỗi)
3. **Seed data** (chỉ dùng lần đầu khởi tạo)

### **2. Khi nào dùng localStorage?**

- Khi backend chưa chạy
- Khi không có internet
- Khi MySQL trống (chưa sync)

### **3. Khi nào dùng MySQL?**

- Khi backend đang chạy (khuyến nghị)
- Khi muốn dữ liệu đồng bộ giữa nhiều user
- Khi muốn admin quản lý products

---

## 📊 Kiểm Tra Dữ Liệu

### **Kiểm tra MySQL có dữ liệu chưa:**

```sql
-- Mở MySQL Workbench
SELECT * FROM products;
SELECT * FROM payments;
SELECT * FROM orders;
SELECT * FROM users;
```

### **Kiểm tra Frontend đang dùng dữ liệu gì:**

Mở Console (F12) và chạy:

```javascript
// Xem products trong localStorage
console.log(JSON.parse(localStorage.getItem('products')))

// Xem products trong Zustand store
// (Cần vào trang có sử dụng products trước)
```

---

## 🎯 Kết Luận

- ✅ **Dữ liệu products giờ lưu trong MySQL**
- ✅ **Frontend tự động load từ API**
- ✅ **LocalStorage chỉ là backup**
- ✅ **Admin có thể xóa dữ liệu test dễ dàng**

**Giờ hệ thống đã chuyển sang dùng dữ liệu thật từ Database!** 🎉
