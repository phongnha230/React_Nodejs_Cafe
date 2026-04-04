const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
const path = require("path");

// Tìm file .env ở thư mục backend (hoặc thư mục gốc nếu không có)
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Kiểm tra DB_URL
if (!process.env.DB_URL) {
  console.error('❌ ERROR: DB_URL không được tìm thấy trong file .env');
  console.error(`📁 Đang tìm file .env tại: ${envPath}`);
  console.error('💡 Hãy đảm bảo file .env trong thư mục backend/ có dòng:');
  console.error('   DB_URL=mysql://username:password@localhost:3306/coffeeshop');
  throw new Error('DB_URL is required in .env file');
}

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "mysql",
  logging: false, // tắt log SQL nếu không cần
});

sequelize
  .authenticate()
  .then(() => console.log("✅ Connected to MySQL (coffeeshop) successfully"))
  .catch((err) => console.error("❌ Database connection error:", err));

module.exports = sequelize;
