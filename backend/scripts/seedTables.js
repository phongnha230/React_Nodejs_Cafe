const sequelize = require('../config/database');
const Table = require('../models/table');

const DEFAULT_TABLE_COUNT = 12;

async function seedTables() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const existingCount = await Table.count();

    if (existingCount > 0) {
      console.log(`Tables already exist (${existingCount}). No new tables created.`);
      process.exit(0);
    }

    const tables = Array.from({ length: DEFAULT_TABLE_COUNT }, (_, index) => ({
      table_number: index + 1,
      status: 'available',
    }));

    await Table.bulkCreate(tables);
    console.log(`Seeded ${tables.length} tables.`);
    process.exit(0);
  } catch (error) {
    console.error('Seed tables failed:', error);
    process.exit(1);
  }
}

seedTables();
