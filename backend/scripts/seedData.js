const sequelize = require('../config/database');
const Product = require('../models/product');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Payment = require('../models/payment');
const User = require('../models/user');

const products = [
    { name: 'Nuoc Bac Ha', price: 30000, category: 'juice' },
    { name: 'Nuoc Dua Hau', price: 25000, category: 'juice' },
    { name: 'Nuoc Dua Luoi', price: 25000, category: 'juice' },
    { name: 'Nuoc Cam Ep', price: 25000, category: 'juice' },
    { name: 'Tra Dao', price: 35000, category: 'tea' },
    { name: 'Ca Phe Sua', price: 25000, category: 'coffee' },
    { name: 'Ca Phe Den', price: 20000, category: 'coffee' },
];

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database');

        await sequelize.sync();

        const admin = await User.findOne({ where: { role: 'admin' } });
        if (!admin) {
            console.error('Admin user not found. Please run createAdminSimple.js first.');
            process.exit(1);
        }

        const existingProducts = await Product.findAll();
        let seededProducts = existingProducts;
        if (existingProducts.length === 0) {
            seededProducts = await Product.bulkCreate(products);
            console.log(`Seeded ${seededProducts.length} products`);
        }

        await Payment.destroy({ where: {}, truncate: false });
        await OrderItem.destroy({ where: {}, truncate: false });
        await Order.destroy({ where: {}, truncate: false });
        console.log('Cleared old order data');

        const statuses = ['delivered', 'pending', 'cancelled'];
        const methods = ['cash', 'momo', 'card'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            const numOrders = Math.floor(Math.random() * 3) + 3;

            for (let j = 0; j < numOrders; j++) {
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                const order = await Order.create({
                    user_id: admin.id,
                    status,
                    total_amount: 0,
                    created_at: date,
                    updated_at: date
                });

                const numItems = Math.floor(Math.random() * 3) + 1;
                let total = 0;

                for (let k = 0; k < numItems; k++) {
                    const product = seededProducts[Math.floor(Math.random() * seededProducts.length)];
                    const qty = Math.floor(Math.random() * 2) + 1;
                    const subtotal = Number(product.price) * qty;
                    total += subtotal;

                    await OrderItem.create({
                        order_id: order.id,
                        product_id: product.id,
                        quantity: qty,
                        unit_price: product.price,
                        subtotal,
                        created_at: date,
                        updated_at: date
                    });
                }

                await order.update({ total_amount: total });

                if (status === 'delivered') {
                    await Payment.create({
                        order_id: order.id,
                        amount: total,
                        method: methods[Math.floor(Math.random() * methods.length)],
                        status: 'completed',
                        created_at: date,
                        updated_at: date
                    });
                }
            }
        }

        console.log('Seeded orders and payments for the last 7 days');
        console.log('Done. Refresh the dashboard to see the charts.');
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
}

seed();
