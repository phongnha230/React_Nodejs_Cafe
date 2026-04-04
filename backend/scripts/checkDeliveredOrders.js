const sequelize = require('../config/database');

async function checkDeliveredOrders() {
    try {
        console.log('🔍 Kiểm tra orders đã delivered...\n');

        // Query directly without associations
        const [deliveredOrders] = await sequelize.query(`
      SELECT o.id, o.user_id, o.status, o.total_amount, o.created_at
      FROM orders o
      WHERE o.status = 'delivered'
      ORDER BY o.id DESC
      LIMIT 10
    `);

        if (deliveredOrders.length === 0) {
            console.log('❌ KHÔNG có order nào đã delivered!\n');

            // Check all orders
            const [allOrders] = await sequelize.query(`
        SELECT id, user_id, status, total_amount, created_at
        FROM orders
        ORDER BY id DESC
        LIMIT 5
      `);

            if (allOrders.length > 0) {
                console.log('📋 Orders hiện có (5 mới nhất):');
                console.log('─'.repeat(80));
                allOrders.forEach(o => {
                    console.log(`   ID: ${o.id} | User: ${o.user_id} | Status: ${o.status} | Total: ${o.total_amount}đ`);
                });
                console.log('\n💡 Bạn có thể update status của order này thành "delivered":');
                console.log(`   PUT /api/orders/${allOrders[0].id}/status`);
                console.log(`   Body: {"status": "delivered"}\n`);
            } else {
                console.log('❌ Không có order nào! Tạo order mới trước.\n');
            }
        } else {
            console.log(`✅ Tìm thấy ${deliveredOrders.length} order(s) đã delivered:\n`);
            console.log('═'.repeat(80));

            for (const order of deliveredOrders) {
                console.log(`\n📦 Order ID: ${order.id}`);
                console.log(`   User ID: ${order.user_id}`);
                console.log(`   Status: ${order.status}`);
                console.log(`   Total: ${Number(order.total_amount).toLocaleString('vi-VN')}đ`);
                console.log(`   Created: ${new Date(order.created_at).toLocaleString('vi-VN')}`);

                // Get order items
                const [items] = await sequelize.query(`
          SELECT oi.product_id, oi.quantity, oi.unit_price, p.name
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ${order.id}
        `);

                if (items.length > 0) {
                    console.log('\n   📝 Products trong order:');
                    items.forEach(item => {
                        console.log(`      - Product ID: ${item.product_id} | ${item.name || 'N/A'} | Qty: ${item.quantity}`);
                    });

                    const productIds = items.map(i => i.product_id).join(', ');
                    console.log(`\n   ✅ Có thể review product IDs: ${productIds}`);
                }
            }

            console.log('\n' + '═'.repeat(80));
            console.log('\n💡 CÁCH TEST REVIEW API:');
            const firstOrder = deliveredOrders[0];
            console.log(`   1. Login với user_id = ${firstOrder.user_id}`);
            console.log(`   2. POST /api/reviews`);
            console.log(`      Body: {`);
            console.log(`        "product_id": <ID từ order trên>,`);
            console.log(`        "rating": 5,`);
            console.log(`        "comment": "Test review"`);
            console.log(`      }`);
            console.log(`   3. Sẽ thành công vì order đã delivered!\n`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

checkDeliveredOrders();
