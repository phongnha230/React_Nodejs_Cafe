const sequelize = require('../config/database');

(async () => {
  try {
    console.log('🗑️  Clearing all orders and payments...');

    // 1. Xóa payments trước (vì có foreign key)
    await sequelize.query('DELETE FROM payments');
    console.log('✅ Payments cleared!');

    // 2. Xóa orders
    await sequelize.query('DELETE FROM orders');
    console.log('✅ Orders cleared!');

    console.log('');
    console.log('🎯 Database cleared successfully!');
    console.log('');
    console.log('📝 QUAN TRỌNG: Bạn cũng cần xóa localStorage trong browser:');
    console.log('   1. Mở trang admin → F12 → Console');
    console.log('   2. Chạy: localStorage.clear()');
    console.log('   3. Refresh trang (F5)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
})();

