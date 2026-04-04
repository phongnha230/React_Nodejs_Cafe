const sequelize = require('../config/database');

(async () => {
  try {
    console.log('📦 Updating database schema...');

    // Thêm từng cột một và bỏ qua nếu đã tồn tại
    const columns = [
      { name: 'name', type: 'VARCHAR(255)' },
      { name: 'login_count', type: 'INT DEFAULT 0' },
      { name: 'last_login_at', type: 'DATETIME' }
    ];

    for (const col of columns) {
      try {
        await sequelize.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Added column: ${col.name}`);
      } catch (err) {
        if (err.message.includes('Duplicate column')) {
          console.log(`⚠️  Column ${col.name} already exists, skipping...`);
        } else {
          throw err;
        }
      }
    }

    console.log('✅ Database schema updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
})();

