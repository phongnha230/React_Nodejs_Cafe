# ☕ Cafe Management System (React + Node.js)

![GitHub repo size](https://img.shields.io/github/repo-size/phongnha230/React_Nodejs_Cafe)
![GitHub stars](https://img.shields.io/github/stars/phongnha230/React_Nodejs_Cafe?style=social)

A full-stack web application for managing a modern Cafe or Coffee Shop. The application provides an intuitive interface for both customers (to browse menus, place orders, read news) and administrators (to manage products, orders, and users).

## 🚀 Features

### For Customers
- **View Menu**: Browse drinks, food, and categories.
- **Cart & Checkout**: Add items to the cart and process payments.
- **Order Tracking**: View order history and status.
- **Product Reviews**: Leave reviews and ratings for drinks.
- **Notifications**: Real-time notifications for order updates.
- **News/Blog**: Read the latest updates and promotions from the cafe.

### For Administrators
- **Dashboard**: Overview of sales, daily orders, and revenue.
- **Product Management**: Add, edit, or remove menu items.
- **Order Management**: Update order statuses (Pending, Preparing, Shipping, Delivered).
- **User Management**: Manage roles and user information.

## 🛠️ Tech Stack

### Frontend (`/Frontend`)
- **Framework**: React.js (Vite)
- **State Management**: Zustand / Custom Hooks
- **Styling**: CSS, Custom UI components
- **Routing**: React Router

### Backend (`/backend`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (with Sequelize ORM or raw SQL scripts)
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer
- **Environment**: Docker & Docker Compose

## 📁 Folder Structure

```text
React_Nodejs_Cafe/
├── Frontend/           # React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route pages (Home, Admin, Menu, etc.)
│   │   ├── services/   # API call services
│   │   ├── stores/     # State management
│   │   └── utils/      # Helper functions
│   └── vite.config.js  # Vite configuration
│
├── backend/            # Express REST API
│   ├── controllers/    # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Auth, Upload, Validation middlewares
│   ├── services/       # Business logic layer
│   └── app.js          # Entry point
│
└── docker-compose.yml  # Docker infrastructure setup
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL (or Docker Desktop)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/phongnha230/React_Nodejs_Cafe.git
cd React_Nodejs_Cafe
```

### 2. Set up the Database (using Docker)
You can quickly spin up the required database using Docker Compose:
```bash
docker-compose up -d
```
*(If you have a local PostgreSQL setup, you can import the provided `backup_full.sql` file).*

### 3. Start the Backend API
```bash
cd backend
npm install
# Ensure you have a .env file configured
npm start
```

### 4. Start the Frontend App
Open a new terminal window:
```bash
cd Frontend
npm install
npm run dev
```

The app will become available at `http://localhost:5173`.

---
*Created by [phongnha230](https://github.com/phongnha230)*
