const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

(async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully!');

    const staffEmail = 'staff@cafe.local';
    const staffPassword = 'staff123';
    const baristaEmail = 'barista@cafe.local';
    const baristaPassword = 'barista123';

    // 1. Check and Create Staff
    const [existingStaff] = await sequelize.query('SELECT id FROM users WHERE email = ? LIMIT 1', {
      replacements: [staffEmail]
    });

    if (existingStaff.length > 0) {
      console.log(`✅ Staff account already exists: ${staffEmail}`);
    } else {
      const hashedStaffPassword = await bcrypt.hash(staffPassword, 10);
      await sequelize.query(`
        INSERT INTO users (username, email, password, role, name, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: ['Staff Nhân Viên', staffEmail, hashedStaffPassword, 'staff', 'Nhân viên Phục vụ']
      });
      console.log(`🚀 Created Staff successfully! Email: ${staffEmail}, Password: ${staffPassword}`);
    }

    // 2. Check and Create Barista
    const [existingBarista] = await sequelize.query('SELECT id FROM users WHERE email = ? LIMIT 1', {
      replacements: [baristaEmail]
    });

    if (existingBarista.length > 0) {
      console.log(`✅ Barista account already exists: ${baristaEmail}`);
    } else {
      const hashedBaristaPassword = await bcrypt.hash(baristaPassword, 10);
      await sequelize.query(`
        INSERT INTO users (username, email, password, role, name, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: ['Barista Pha Chế', baristaEmail, hashedBaristaPassword, 'barista', 'Nhân viên Pha chế']
      });
      console.log(`🚀 Created Barista successfully! Email: ${baristaEmail}, Password: ${baristaPassword}`);
    }

  } catch (error) {
    console.error('❌ Error creating test accounts:', error.message);
  }

  process.exit(0);
})();
