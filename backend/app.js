const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const logger = require("./middleware/loggerMiddleware");
const errorHandler = require("./middleware/errorHandler");
const { helmetConfig, apiLimiter, authLimiter } = require("./middleware/securityMiddleware");
const fs = require("fs");
const path = require("path");
dotenv.config();
// Import route modules
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const menuRoutes = require("./routes/menuRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const newRoutes = require("./routes/newRoutes");
// Load required models for associations
const sequelize = require("./config/database"); // <== dùng file database.js
require("./models/index")(sequelize);
require("./models/associations")(sequelize);

const app = express();

// Security middleware
app.use(helmetConfig);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Ensure upload directory exists and serve it statically
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`📁 Created upload directory: ${UPLOAD_DIR}`);
  } catch (e) {
    console.warn('⚠️ Unable to ensure upload directory:', e.message);
  }
}
app.use('/uploads', express.static(UPLOAD_DIR));

// Serve static assets if directory exists (for optional local frontend assets)
const ASSETS_DIR = path.join(process.cwd(), 'src', 'assets');
if (fs.existsSync(ASSETS_DIR)) {
  app.use('/src/assets', express.static(ASSETS_DIR));
}

// Logging middleware
app.use(logger);

// Rate limiting
app.use('/api', apiLimiter);

// Mount API routes
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/menu-sections", menuRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/news", newRoutes);
app.get('/', (req, res) => res.send('☕ Cafe Backend is running!'));

// 404 handler (after routes, before error handler)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler (after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
// Ensure DB is synced before starting server
sequelize
  .sync()
  .then(() => {
    console.log("🗄️  Sequelize models synced");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to sync database:", err);
    process.exit(1);
  });

