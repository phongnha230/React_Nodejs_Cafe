const sequelize = require('../config/database');

async function checkAssociations() {
    try {
        console.log('🔍 Kiểm tra kết nối Order → Payment → Review\n');

        // Query to check if data is connected
        const [results] = await sequelize.query(`
      SELECT 
        o.id as order_id,
        o.user_id,
        o.status as order_status,
        o.total_amount,
        p.id as payment_id,
        p.status as payment_status,
        p.method as payment_method,
        oi.product_id,
        oi.quantity
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = 15 AND o.status = 'delivered'
      LIMIT 10
    `);

        if (results.length === 0) {
            console.log('❌ Không tìm thấy order delivered nào của user 15!\n');
        } else {
            console.log(`✅ Tìm thấy ${results.length} records:\n`);
            console.log('═'.repeat(100));

            results.forEach(r => {
                console.log(`\n📦 Order ID: ${r.order_id} | User: ${r.user_id} | Status: ${r.order_status}`);
                console.log(`   💰 Total: ${Number(r.total_amount).toLocaleString('vi-VN')}đ`);

                if (r.payment_id) {
                    console.log(`   💳 Payment ID: ${r.payment_id} | Status: ${r.payment_status} | Method: ${r.payment_method}`);

                    if (r.payment_status === 'completed' || r.payment_status === 'success') {
                        console.log(`   ✅ CÓ THỂ REVIEW product_id: ${r.product_id}`);
                    } else {
                        console.log(`   ❌ CHƯA THỂ REVIEW (payment ${r.payment_status})`);
                    }
                } else {
                    console.log(`   ❌ KHÔNG CÓ PAYMENT → CHƯA THỂ REVIEW`);
                }

                console.log(`   📦 Product ID: ${r.product_id} | Qty: ${r.quantity}`);
            });

            console.log('\n' + '═'.repeat(100));

            // Summary
            const withPayment = results.filter(r => r.payment_id);
            const completedPayment = results.filter(r => r.payment_status === 'completed' || r.payment_status === 'success');

            console.log('\n📊 TỔNG KẾT:');
            console.log(`   - Tổng orders delivered: ${results.length}`);
            console.log(`   - Orders có payment: ${withPayment.length}`);
            console.log(`   - Orders payment completed: ${completedPayment.length}`);
            console.log(`   - ✅ CÓ THỂ REVIEW: ${completedPayment.length} orders\n`);

            if (completedPayment.length > 0) {
                console.log('💡 CÁCH TEST:');
                const first = completedPayment[0];
                console.log(`   1. Login với user_id = ${first.user_id}`);
                console.log(`   2. POST /api/reviews`);
                console.log(`      Body: {`);
                console.log(`        "product_id": ${first.product_id},`);
                console.log(`        "rating": 5,`);
                console.log(`        "comment": "Test review"`);
                console.log(`      }`);
                console.log(`   3. Sẽ thành công vì order delivered + payment completed!\n`);
            } else {
                console.log('⚠️  KHÔNG CÓ order nào đủ điều kiện review!');
                console.log('   Cần: order delivered + payment completed\n');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

checkAssociations();
