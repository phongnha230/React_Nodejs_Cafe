/**
 * Script để đồng bộ products từ Frontend localStorage vào MySQL Database
 * 
 * Cách chạy:
 * 1. Mở Console trên trang web (F12)
 * 2. Chạy: copy(JSON.stringify(localStorage.getItem('products')))
 * 3. Paste kết quả vào mảng PRODUCTS_DATA bên dưới
 * 4. Chạy: node backend/scripts/syncProducts.js
 */

const sequelize = require('../config/database');
const Product = require('../models/product');

// ===== PASTE DỮ LIỆU TỪ LOCALSTORAGE VÀO ĐÂY =====
const PRODUCTS_DATA = [
  { id: 'p1', name: 'Nước Bạc Hà', price: 30000, image: 'src/assets/Bạc_Hà.jpeg', category: 'juice' },
  { id: 'p2', name: 'Nước Dừa hấu', price: 25000, image: 'src/assets/Dưa_hấu.jpeg', category: 'juice' },
  { id: 'p3', name: 'Nước Dưa lưới', price: 25000, image: 'src/assets/Dưa_lưới.jpg', category: 'juice' },
  { id: 'p4', name: 'Nước Cam ép', price: 25000, image: 'src/assets/nuoc-cam-vat_master.jpg', category: 'juice' },
  { id: 'p5', name: 'Trà Đào', price: 35000, image: 'src/assets/Trà Đào.jpeg', category: 'tea' },
  { id: 'p6', name: 'Cà phê sữa', price: 25000, image: 'src/assets/cà phê sữa.jpeg', category: 'coffee' },
  { id: 'p7', name: 'Cà phê đen', price: 20000, image: 'src/assets/cà phê đen.jpeg', category: 'coffee' },
  { id: 'p8', name: 'Matcha latte', price: 35000, image: 'src/assets/Matcha.jpeg', category: 'tea' },
  { id: 'p9', name: 'Trà sữa trân châu', price: 35000, image: 'src/assets/Trân châu.jpeg', category: 'milk-tea' },
  { id: 'p10', name: 'Trà sữa Thái xanh', price: 30000, image: 'src/assets/Thái xanh.jpeg', category: 'milk-tea' },
  { id: 'p11', name: 'Nước Ổi ép', price: 30000, image: 'src/assets/nuoc-ep-oi.jpg', category: 'juice' },
  { id: 'p12', name: 'Milo Dầm', price: 30000, image: 'src/assets/Milo_Dằm.jpeg', category: 'milk-tea' },
  { id: 'p13', name: 'Bánh mì trứng', price: 15000, image: 'src/assets/1-o-banh-mi-trung-bao-nhieu-calo.jpg', category: 'food' },
];

async function syncProducts() {
  try {
    console.log('🔄 Bắt đầu đồng bộ products...');

    await sequelize.authenticate();
    console.log('✅ Kết nối MySQL thành công!');

    // Xóa toàn bộ products cũ (nếu có)
    const deletedCount = await Product.destroy({ where: {} });
    console.log(`🗑️  Đã xóa ${deletedCount} products cũ`);

    // Thêm products mới
    let successCount = 0;
    let errorCount = 0;

    for (const product of PRODUCTS_DATA) {
      try {
        await Product.create({
          name: product.name,
          price: product.price,
          category: product.category || 'other',
          image_url: product.image || null,
        });
        successCount++;
        console.log(`  ✓ ${product.name} - ${product.price}đ`);
      } catch (err) {
        errorCount++;
        console.error(`  ✗ Lỗi khi tạo ${product.name}:`, err.message);
      }
    }

    console.log('\n📊 Kết quả:');
    console.log(`  ✅ Thành công: ${successCount} products`);
    console.log(`  ❌ Thất bại: ${errorCount} products`);
    console.log('\n🎉 Hoàn tất đồng bộ products!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

syncProducts();

