const sequelize = require('../config/database');

async function verifyNewsTable() {
    try {
        console.log('📊 Kiểm tra cấu trúc bảng news...\n');

        // Show table structure
        const [columns] = await sequelize.query('DESCRIBE news');
        console.log('Columns trong bảng news:');
        console.log('─'.repeat(80));
        columns.forEach(col => {
            console.log(`${col.Field.padEnd(20)} | ${col.Type.padEnd(30)} | ${col.Null === 'NO' ? 'NOT NULL' : 'NULL    '} | ${col.Default || ''}`);
        });
        console.log('─'.repeat(80));

        // Count records
        const [count] = await sequelize.query('SELECT COUNT(*) as total FROM news');
        console.log(`\n📈 Tổng số records: ${count[0].total}`);

        // Show sample data
        if (count[0].total > 0) {
            const [sample] = await sequelize.query('SELECT id, title, status, created_at FROM news LIMIT 3');
            console.log('\n📝 Sample data:');
            sample.forEach(row => {
                console.log(`   ID: ${row.id} | Title: ${row.title} | Status: ${row.status}`);
            });
        }

        console.log('\n✅ Kiểm tra hoàn tất!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

verifyNewsTable();
