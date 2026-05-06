const Table = require('../models/table');
const { success, error } = require('../utils/responseFormatter');

exports.listTables = async (req, res) => {
  try {
    const tables = await Table.findAll({
      order: [['table_number', 'ASC']]
    });

    res.json(success(tables));
  } catch (err) {
    res.status(500).json(error('List tables error', 500, err.message));
  }
};

exports.getTableById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json(error('Invalid table ID', 400));
    }

    const table = await Table.findByPk(id);
    if (!table) {
      return res.status(404).json(error('Table not found', 404));
    }

    res.json(success(table));
  } catch (err) {
    res.status(500).json(error('Get table error', 500, err.message));
  }
};
