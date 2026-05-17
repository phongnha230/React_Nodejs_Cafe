# 🔄 Shared Constants Documentation

> **Danh sách các constants phải đồng bộ giữa Backend và Frontend**

---

## ⚠️ QUAN TRỌNG

Các constants dưới đây **PHẢI GIỐNG NHAU** giữa Backend và Frontend.  
Khi thay đổi, **BẮT BUỘC** phải update cả 2 nơi!

---

## 1. User Roles

**Backend:** `backend/constants/roles.js`  
**Frontend:** `Frontend/src/constants/roles.js`

```javascript
{
  ADMIN: 'admin',
  STAFF: 'staff',
  BARISTA: 'barista',
  CUSTOMER: 'customer'
}
```

**Sử dụng:**
- Authorization/Phân quyền
- UI conditional rendering
- Route protection

---

## 2. Order Status

**Backend:** `backend/constants/orderStatus.js`  
**Frontend:** `Frontend/src/constants/orderStatus.js` (nếu có)

```javascript
{
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERING: 'delivering',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
}
```

**Sử dụng:**
- Order status display
- Status filtering
- Status badge colors

**Valid Transitions (Backend only):**
```javascript
{
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivering', 'cancelled'],
  delivering: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: []
}
```

---

## 3. Payment Methods

**Backend:** `backend/constants/paymentMethods.js`  
**Frontend:** `Frontend/src/constants/paymentMethods.js` (nếu có)

```javascript
{
  CASH: 'cash',
  VNPAY: 'vnpay',
  CREDIT_CARD: 'credit_card'
}
```

**Sử dụng:**
- Payment method selection
- Payment processing
- Display payment icons

---

## 📝 Checklist Khi Thay Đổi Constants

Khi thay đổi bất kỳ constant nào ở trên:

- [ ] Update Backend constant file
- [ ] Update Frontend constant file
- [ ] Test Backend API
- [ ] Test Frontend UI
- [ ] Update documentation (nếu có)
- [ ] Notify team members

---

## 🚫 Constants KHÔNG Cần Sync

### Backend Only

**File:** `backend/constants/config.js`

```javascript
{
  JWT_EXPIRATION: '7d',
  BCRYPT_ROUNDS: 10,
  MAX_LOGIN_ATTEMPTS: 5,
  SESSION_TIMEOUT: 3600,
  DEFAULT_PAGE_SIZE: 10,
  MAX_FILE_SIZE: 5242880
}
```

### Frontend Only

**File:** `Frontend/src/constants/apiEndpoints.js`

```javascript
{
  USERS: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    PROFILE: '/users/me'
  },
  PRODUCTS: { ... },
  ORDERS: { ... }
}
```

**File:** `Frontend/src/constants/messages.js`

```javascript
{
  LOGIN_SUCCESS: 'Đăng nhập thành công!',
  LOGIN_FAILED: 'Sai email hoặc mật khẩu',
  ORDER_CREATED: 'Đơn hàng đã được tạo'
}
```

---

## 🔍 Cách Kiểm Tra Sync

### Manual Check
```bash
# So sánh roles
cat backend/constants/roles.js
cat Frontend/src/constants/roles.js
```

### Automated Check (Future)
Có thể tạo script để tự động kiểm tra:

```javascript
// scripts/checkConstantsSync.js
const backendRoles = require('../backend/constants/roles');
const frontendRoles = require('../Frontend/src/constants/roles');

// Compare and report differences
```

---

## 📅 Lịch Sử Thay Đổi

| Ngày | Constant | Thay Đổi | Người Thực Hiện |
|------|----------|-----------|-----------------|
| 2024-12-24 | ORDER_STATUS | Thêm 'ready' status | - |
| 2024-12-24 | PAYMENT_METHODS | Thêm 'credit_card' | - |

---

**Cập nhật lần cuối:** 2024-12-24  
**Người duy trì:** Development Team
