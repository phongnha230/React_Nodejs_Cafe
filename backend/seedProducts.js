// Seed script to add menu products to database
const sequelize = require('./config/database');
const Product = require('./models/product');

const products = [
    { name: 'Nước Bạc Hà', price: 30000, image_url: '/src/assets/Bạc_Hà.jpeg', category: 'juice', description: 'Nước ép bạc hà tươi mát' },
    { name: 'Nước Dừa hấu', price: 25000, image_url: '/src/assets/Dưa_hấu.jpeg', category: 'juice', description: 'Nước ép dưa hấu mát lạnh' },
    { name: 'Nước Dưa lưới', price: 25000, image_url: '/src/assets/Dưa_lưới.jpg', category: 'juice', description: 'Nước ép dưa lưới thơm ngon' },
    { name: 'Nước Cam ép', price: 25000, image_url: '/src/assets/nuoc-cam-vat_master.jpg', category: 'juice', description: 'Nước cam tươi vắt tay' },
    { name: 'Trà Đào', price: 35000, image_url: '/src/assets/Trà Đào.jpeg', category: 'tea', description: 'Trà đào cam sả' },
    { name: 'Cà phê sữa', price: 25000, image_url: '/src/assets/cà phê sữa.jpeg', category: 'coffee', description: 'Cà phê sữa đá truyền thống' },
    { name: 'Cà phê đen', price: 20000, image_url: '/src/assets/cà phê đen.jpeg', category: 'coffee', description: 'Cà phê đen đá' },
    { name: 'Matcha latte', price: 35000, image_url: '/src/assets/Matcha.jpeg', category: 'tea', description: 'Matcha latte thơm béo' },
    { name: 'Trà sữa trân châu', price: 35000, image_url: '/src/assets/Trân châu.jpeg', category: 'milk-tea', description: 'Trà sữa trân châu đường đen' },
    { name: 'Trà sữa Thái xanh', price: 30000, image_url: '/src/assets/Thái xanh.jpeg', category: 'milk-tea', description: 'Trà sữa Thái xanh' },
    { name: 'Nước Ổi ép', price: 30000, image_url: '/src/assets/nuoc-ep-oi.jpg', category: 'juice', description: 'Nước ổi ép tươi' },
    { name: 'Milo Dầm', price: 30000, image_url: '/src/assets/Milo_Dằm.jpeg', category: 'milk-tea', description: 'Milo dầm đá' },
    { name: 'Bánh mì trứng', price: 15000, image_url: '/src/assets/1-o-banh-mi-trung-bao-nhieu-calo.jpg', category: 'food', description: 'Bánh mì trứng thơm ngon' },
];

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Sync models
        await sequelize.sync();
        console.log('✅ Models synced');

        // Check if products already exist
        const existingCount = await Product.count();
        if (existingCount > 0) {
            console.log(`⚠️ Products table already has ${existingCount} products.`);
            console.log('   Skipping seed to avoid duplicates.');
            console.log('   Delete existing products first if you want to re-seed.');
            process.exit(0);
        }

        // Insert products
        const created = await Product.bulkCreate(products);
        console.log(`✅ Seeded ${created.length} products successfully!`);

        // List created products
        console.log('\n📦 Products in database:');
        created.forEach((p, i) => {
            console.log(`   ${i + 1}. [ID: ${p.id}] ${p.name} - ${p.price}đ`);
        });

        console.log('\n🎉 Done! Now products have numeric IDs that can be used in orders.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

seed();
