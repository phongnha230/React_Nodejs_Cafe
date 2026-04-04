const sequelize = require('../config/database');

(async () => {
  try {
    console.log('🗑️  Clearing test payments...');

    await sequelize.query('DELETE FROM payments');

    console.log('✅ All payments cleared!');
    console.log('🚀 Giờ đặt hàng mới để tạo payment thật!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
})();

