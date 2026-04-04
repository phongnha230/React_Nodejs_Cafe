const sequelize = require('../config/database');

async function addNewsColumns() {
    try {
        console.log('🔄 Đang thêm columns vào bảng news...');

        // Add status column
        try {
            await sequelize.query(`
        ALTER TABLE news 
        ADD COLUMN status ENUM('draft', 'published', 'archived') 
        DEFAULT 'draft' NOT NULL
      `);
            console.log('✅ Đã thêm column status');
        } catch (error) {
            if (error.message.includes('Duplicate column')) {
                console.log('ℹ️  Column status đã tồn tại');
            } else {
                throw error;
            }
        }

        // Add updated_at column
        try {
            await sequelize.query(`
        ALTER TABLE news 
        ADD COLUMN updated_at DATETIME 
        DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP
      `);
            console.log('✅ Đã thêm column updated_at');
        } catch (error) {
            if (error.message.includes('Duplicate column')) {
                console.log('ℹ️  Column updated_at đã tồn tại');
            } else {
                throw error;
            }
        }

        // Update existing records to set status = 'published'
        try {
            await sequelize.query(`
        UPDATE news 
        SET status = 'published'
      `);
            console.log('✅ Đã update status = published cho tất cả records');
        } catch (error) {
            console.log('⚠️  Không thể update status:', error.message);
        }

        // Verify - show table structure
        const [results] = await sequelize.query('DESCRIBE news');
        console.log('\n✅ Cấu trúc bảng news:');
        results.forEach(col => {
            console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
        });

        console.log('\n🎉 Hoàn thành! Database đã được cập nhật.');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
        if (error.parent) {
            console.error('SQL Error:', error.parent.sqlMessage);
        }
        process.exit(1);
    }
}

addNewsColumns();
