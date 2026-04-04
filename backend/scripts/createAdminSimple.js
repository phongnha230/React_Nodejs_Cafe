const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

(async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Dùng raw query để insert trực tiếp (không cần model)
    await sequelize.query(`
      INSERT INTO users (username, email, password, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE password = VALUES(password)
    `, {
      replacements: ['admin', 'admin@jokopi.com', hashedPassword, 'admin']
    });

    console.log('✅ Admin created successfully!');
    console.log('📧 Email: admin@jokopi.com');
    console.log('🔑 Password: admin123');
    console.log('\n🚀 Giờ bạn có thể đăng nhập!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
})();

