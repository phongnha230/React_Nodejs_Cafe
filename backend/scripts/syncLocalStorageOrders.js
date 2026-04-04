const sequelize = require('../config/database');

// Script để tạo payment cho các order đã có
(async () => {
  try {
    console.log('📦 Syncing payments for existing orders...');

    // Lấy tất cả orders chưa có payment
    const [orders] = await sequelize.query(`
      SELECT o.id, o.total_amount, o.status, o.created_at
      FROM orders o
      LEFT JOIN payments p ON p.order_id = o.id
      WHERE p.id IS NULL
      ORDER BY o.id
    `);

    if (orders.length === 0) {
      console.log('✅ All orders already have payments!');
      process.exit(0);
    }

    console.log(`Found ${orders.length} orders without payments`);

    // Tạo payment cho mỗi order
    for (const order of orders) {
      await sequelize.query(`
        INSERT INTO payments (order_id, amount, method, status, created_at, updated_at)
        VALUES (?, ?, 'cash', 'completed', ?, NOW())
      `, {
        replacements: [order.id, order.total_amount, order.created_at]
      });

      console.log(`✅ Created payment for order #${order.id}`);
    }

    console.log(`\n🎉 Successfully created ${orders.length} payment records!`);
    console.log('🚀 Refresh trang "Quản lý thanh toán" để xem kết quả!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
})();

