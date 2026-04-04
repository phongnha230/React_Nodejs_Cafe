# 📦 Import Guide - Cách Sử Dụng Files Mới

> **Hướng dẫn chi tiết cách import và sử dụng Constants, Utils, Services trong Backend**

---

## 🗺️ Import Map - Ai Import Gì?

### **1. Controllers Import Services**

```javascript
// backend/controllers/userController.js
const userService = require('../services/userService');
const { success, error, paginated } = require('../utils/responseFormatter');

// backend/controllers/orderController.js
const orderService = require('../services/orderService');
const { success, error, created, paginated } = require('../utils/responseFormatter');

// backend/controllers/productController.js (future)
const productService = require('../services/productService');
const { success, error } = require('../utils/responseFormatter');
```

---

### **2. Services Import Models, Utils, Constants**

```javascript
// backend/services/userService.js
const User = require('../models/user');
const { hashPassword, comparePassword } = require('../utils/encryption');
const { ROLES } = require('../constants/roles');
const logger = require('../config/logger');

// backend/services/orderService.js
const sequelize = require('../config/database');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Payment = require('../models/payment');
const Product = require('../models/product');
const { ORDER_STATUS, VALID_TRANSITIONS } = require('../constants/orderStatus');
const { calculateSubtotal } = require('../utils/priceCalculator');
const logger = require('../config/logger');

// backend/services/productService.js (future)
const Product = require('../models/product');
const { formatVND } = require('../utils/priceCalculator');
const logger = require('../config/logger');
```

---

### **3. Middleware Import Constants**

```javascript
// backend/middleware/roleMiddleware.js
const { ROLES } = require('../constants/roles');

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

exports.isCustomer = (req, res, next) => {
  if (req.user.role !== ROLES.CUSTOMER) {
    return res.status(403).json({ message: 'Access denied. Customer only.' });
  }
  next();
};
```

```javascript
// backend/middleware/validationMiddleware.js
const { body, validationResult } = require('express-validator');
const { ORDER_STATUS } = require('../constants/orderStatus');
const { PAYMENT_METHODS } = require('../constants/paymentMethods');

exports.validateOrderStatus = [
  body('status')
    .isIn(Object.values(ORDER_STATUS))
    .withMessage('Invalid order status'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

---

### **4. Utils Import Constants**

```javascript
// backend/utils/encryption.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { BCRYPT_ROUNDS } = require('../constants/config');

exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
};
```

---

## 📋 Import Cheat Sheet

### **Constants**

```javascript
// Roles
const { ROLES } = require('../constants/roles');
// Usage: ROLES.ADMIN, ROLES.CUSTOMER

// Order Status
const { ORDER_STATUS, VALID_TRANSITIONS } = require('../constants/orderStatus');
// Usage: ORDER_STATUS.PENDING, VALID_TRANSITIONS.pending

// Payment Methods
const { PAYMENT_METHODS } = require('../constants/paymentMethods');
// Usage: PAYMENT_METHODS.CASH, PAYMENT_METHODS.VNPAY

// Config
const { 
  JWT_EXPIRATION, 
  BCRYPT_ROUNDS, 
  MAX_LOGIN_ATTEMPTS,
  DEFAULT_PAGE_SIZE 
} = require('../constants/config');
```

---

### **Utils**

```javascript
// Encryption
const { 
  hashPassword, 
  comparePassword, 
  generateToken,
  generateNumericCode,
  sha256
} = require('../utils/encryption');

// Date Helper
const { 
  calculateAge,
  isBusinessDay,
  addBusinessDays,
  isPast,
  isFuture,
  formatDate,
  formatDateVN,
  daysDifference
} = require('../utils/dateHelper');

// Price Calculator
const { 
  calculateDiscount,
  calculateTax,
  calculatePriceWithTax,
  calculateSubtotal,
  roundPrice,
  formatVND,
  calculateLoyaltyPoints
} = require('../utils/priceCalculator');

// Response Formatter
const { 
  success, 
  error, 
  paginated,
  created,
  noContent
} = require('../utils/responseFormatter');
```

---

### **Services**

```javascript
// User Service
const userService = require('../services/userService');
// Methods: getAllUsers, getUserById, createUser, updateUser, deleteUser, etc.

// Order Service
const orderService = require('../services/orderService');
// Methods: createOrder, getOrders, getOrderById, updateOrderStatus, etc.

// Product Service (future)
const productService = require('../services/productService');

// Payment Service (future)
const paymentService = require('../services/paymentService');
```

---

## 🔄 Dependency Graph

```
Controllers
    ↓
Services ← Utils ← Constants
    ↓
Models
```

**Chi tiết:**

```
userController.js
  ├─ userService.js
  │   ├─ User (model)
  │   ├─ encryption.js (utils)
  │   │   └─ config.js (constants)
  │   └─ roles.js (constants)
  └─ responseFormatter.js (utils)

orderController.js
  ├─ orderService.js
  │   ├─ Order, OrderItem, Payment (models)
  │   ├─ orderStatus.js (constants)
  │   └─ priceCalculator.js (utils)
  └─ responseFormatter.js (utils)
```

---

## 📝 Ví Dụ Cụ Thể

### **Example 1: User Controller**

```javascript
// backend/controllers/userController.js

// Import service
const userService = require('../services/userService');

// Import utils
const { success, error, paginated } = require('../utils/responseFormatter');

exports.list = async (req, res) => {
  try {
    const { page, limit, role } = req.query;
    
    // Sử dụng service
    const result = await userService.getAllUsers({ page, limit, role });
    
    // Sử dụng response formatter
    res.json(paginated(
      result.users, 
      result.pagination.page, 
      result.pagination.limit, 
      result.pagination.total
    ));
  } catch (err) {
    // Sử dụng error formatter
    res.status(500).json(error('List users error', 500, err.message));
  }
};
```

---

### **Example 2: User Service**

```javascript
// backend/services/userService.js

// Import model
const User = require('../models/user');

// Import utils
const { hashPassword, comparePassword } = require('../utils/encryption');

// Import constants
const { ROLES } = require('../constants/roles');

// Import logger
const logger = require('../config/logger');

class UserService {
  async createUser(userData) {
    const { username, email, password, role = ROLES.CUSTOMER } = userData;
    
    // Sử dụng encryption util
    const hashedPassword = await hashPassword(password);
    
    // Sử dụng model
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role
    });
    
    // Sử dụng logger
    logger.info('User created', { userId: user.id });
    
    return user;
  }
}

module.exports = new UserService();
```

---

### **Example 3: Order Service**

```javascript
// backend/services/orderService.js

// Import database
const sequelize = require('../config/database');

// Import models
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');

// Import constants
const { ORDER_STATUS, VALID_TRANSITIONS } = require('../constants/orderStatus');

// Import utils
const { calculateSubtotal } = require('../utils/priceCalculator');

// Import logger
const logger = require('../config/logger');

class OrderService {
  async createOrder(userId, orderData) {
    const { items } = orderData;
    
    // Sử dụng price calculator
    const totalAmount = calculateSubtotal(items);
    
    // Sử dụng constant
    const order = await Order.create({
      user_id: userId,
      status: ORDER_STATUS.PENDING,
      total_amount: totalAmount
    });
    
    return order;
  }
  
  async updateOrderStatus(orderId, newStatus, userId) {
    // Sử dụng constant
    if (!Object.values(ORDER_STATUS).includes(newStatus)) {
      throw new Error('Invalid order status');
    }
    
    const order = await Order.findByPk(orderId);
    
    // Sử dụng valid transitions
    const validTransitions = VALID_TRANSITIONS[order.status] || [];
    if (!validTransitions.includes(newStatus)) {
      throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
    }
    
    await order.update({ status: newStatus });
    
    // Sử dụng logger
    logger.info('Order status updated', { orderId, newStatus, userId });
    
    return order;
  }
}

module.exports = new OrderService();
```

---

### **Example 4: Middleware**

```javascript
// backend/middleware/roleMiddleware.js

// Import constants
const { ROLES } = require('../constants/roles');

exports.isAdmin = (req, res, next) => {
  // Sử dụng constant
  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};
```

---

### **Example 5: Auth Controller (future)**

```javascript
// backend/controllers/authController.js

// Import service
const userService = require('../services/userService');

// Import utils
const { generateToken } = require('../utils/encryption');
const { success, error } = require('../utils/responseFormatter');

// Import constants
const { JWT_EXPIRATION } = require('../constants/config');

const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Sử dụng service
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json(error('Invalid credentials', 401));
    }
    
    // Sử dụng service method
    const isValid = await userService.verifyPassword(user.id, password);
    if (!isValid) {
      return res.status(401).json(error('Invalid credentials', 401));
    }
    
    // Sử dụng constant
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );
    
    // Sử dụng response formatter
    res.json(success({ token, user }, 'Login successful'));
  } catch (err) {
    res.status(500).json(error('Login error', 500, err.message));
  }
};
```

---

## 🎯 Best Practices

### **1. Import Order (Khuyến nghị)**

```javascript
// 1. Node modules
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 2. Config
const sequelize = require('../config/database');
const logger = require('../config/logger');

// 3. Constants
const { ROLES } = require('../constants/roles');
const { ORDER_STATUS } = require('../constants/orderStatus');

// 4. Utils
const { hashPassword } = require('../utils/encryption');
const { success, error } = require('../utils/responseFormatter');

// 5. Services
const userService = require('../services/userService');

// 6. Models
const User = require('../models/user');
const Order = require('../models/order');
```

---

### **2. Destructuring vs Direct Import**

```javascript
// ✅ GOOD - Destructuring cho multiple exports
const { ROLES } = require('../constants/roles');
const { hashPassword, comparePassword } = require('../utils/encryption');

// ✅ GOOD - Direct import cho single export (class/service)
const userService = require('../services/userService');

// ❌ BAD - Không cần destructuring cho single export
const { userService } = require('../services/userService'); // Wrong!
```

---

### **3. Relative Paths**

```javascript
// From controllers/
require('../services/userService')
require('../utils/encryption')
require('../constants/roles')

// From services/
require('../models/user')
require('../utils/encryption')
require('../constants/roles')

// From middleware/
require('../constants/roles')
require('../utils/responseFormatter')
```

---

## 📊 Import Summary Table

| File Type | Imported By | Import Pattern |
|-----------|-------------|----------------|
| **Constants** | Services, Middleware, Utils | `const { CONSTANT } = require('../constants/file')` |
| **Utils** | Controllers, Services | `const { function } = require('../utils/file')` |
| **Services** | Controllers | `const service = require('../services/file')` |
| **Models** | Services | `const Model = require('../models/file')` |

---

## ✅ Checklist - Files Đã Import Đúng Chưa?

### **Controllers:**
- [x] `userController.js` - Import `userService`, `responseFormatter` ✅
- [x] `orderController.js` - Import `orderService`, `responseFormatter` ✅
- [ ] `productController.js` - Cần refactor
- [ ] `reviewController.js` - Cần refactor
- [ ] `paymentController.js` - Cần refactor
- [ ] `authController.js` - Cần refactor

### **Services:**
- [x] `userService.js` - Import `User`, `encryption`, `roles` ✅
- [x] `orderService.js` - Import `Order`, `orderStatus`, `priceCalculator` ✅
- [ ] `productService.js` - Cần tạo
- [ ] `reviewService.js` - Cần tạo
- [ ] `paymentService.js` - Cần tạo

### **Middleware:**
- [ ] `roleMiddleware.js` - Nên import `ROLES` constant
- [ ] `validationMiddleware.js` - Nên import constants

---

## 🔧 Quick Fix - Update Existing Files

### **Update roleMiddleware.js:**

```javascript
// backend/middleware/roleMiddleware.js
const { ROLES } = require('../constants/roles');

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

exports.isCustomer = (req, res, next) => {
  if (req.user.role !== ROLES.CUSTOMER) {
    return res.status(403).json({ message: 'Access denied. Customer only.' });
  }
  next();
};
```

---

## 📝 Tóm Tắt

**Ai import gì:**

1. **Controllers** → Import **Services** + **Utils** (responseFormatter)
2. **Services** → Import **Models** + **Utils** + **Constants**
3. **Middleware** → Import **Constants** + **Utils**
4. **Utils** → Import **Constants** (nếu cần)

**Không ai import:**
- Constants không import gì (chỉ export)
- Models không import Services (tránh circular dependency)

---

**Cập nhật:** 2024-12-24  
**Status:** ✅ Ready to use
