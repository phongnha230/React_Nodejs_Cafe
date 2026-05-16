const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

(async () => {
  try {
    // 🛡️ Bảo mật: Ưu tiên lấy thông tin từ biến môi trường (Environment Variables)
    // Trên Railway/Render, bạn hãy cấu hình 2 biến này trong phần Variables
    const adminEmail = process.env.ADMIN_INIT_EMAIL || 'admin@jokopi.com';
    const adminPassword = process.env.ADMIN_INIT_PASSWORD || 'admin123';

    if (adminEmail === 'admin@jokopi.com' && adminPassword === 'admin123' && process.env.NODE_ENV === 'production') {
      console.warn('⚠️ CẢNH BÁO: Bạn đang sử dụng thông tin Admin mặc định trên môi trường Production!');
      console.warn('💡 Hãy thiết lập ADMIN_INIT_EMAIL và ADMIN_INIT_PASSWORD trong biến môi trường.');
    }

    // 🔍 Kiểm tra xem đã có tài khoản Admin nào chưa để tránh tạo trùng hoặc lộ lỗ hổng
    const [existingAdmins] = await sequelize.query('SELECT id FROM users WHERE role = "admin" LIMIT 1');
    
    if (existingAdmins.length > 0) {
      console.log('✅ Hệ thống đã có tài khoản Admin. Không cần tạo thêm.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Dùng raw query để insert trực tiếp
    await sequelize.query(`
      INSERT INTO users (username, email, password, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `, {
      replacements: ['Administrator', adminEmail, hashedPassword, 'admin']
    });

    console.log('🚀 Đã khởi tạo tài khoản Admin thành công!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log('🔑 Password: (Đã được bảo mật bằng Environment Variable)');
    console.log('\n💡 Giờ bạn có thể dùng thông tin này để đăng nhập vào trang quản trị.');

  } catch (error) {
    console.error('❌ Lỗi khi tạo Admin:', error.message);
  }

  process.exit(0);
})();

