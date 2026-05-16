const Table = require('../models/table');
const Order = require('../models/order');
const { success, error } = require('../utils/responseFormatter');
const { buildSignedTablePayload } = require('../utils/qrSignature');

const VALID_TABLE_STATUSES = ['available', 'occupied', 'reserved', 'inactive'];

const normalizeTablePayload = (body) => {
  const tableNumber = Number(body.table_number ?? body.tableNumber);
  const status = body.status || 'available';

  if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
    throw new Error('Table number must be a positive integer');
  }

  if (!VALID_TABLE_STATUSES.includes(status)) {
    throw new Error('Invalid table status');
  }

  return {
    table_number: tableNumber,
    status,
  };
};

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

exports.createTable = async (req, res) => {
  try {
    const payload = normalizeTablePayload(req.body);
    const exists = await Table.findOne({ where: { table_number: payload.table_number } });

    if (exists) {
      return res.status(409).json(error(`Table ${payload.table_number} already exists`, 409));
    }

    const table = await Table.create(payload);
    res.status(201).json(success(table, 'Table created successfully'));
  } catch (err) {
    if (err.message.includes('Table number') || err.message.includes('Invalid table status')) {
      return res.status(400).json(error(err.message, 400));
    }
    res.status(500).json(error('Create table error', 500, err.message));
  }
};

exports.updateTable = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const table = await Table.findByPk(id);

    if (!table) {
      return res.status(404).json(error('Table not found', 404));
    }

    const updates = {};

    if (req.body.table_number !== undefined || req.body.tableNumber !== undefined) {
      const tableNumber = Number(req.body.table_number ?? req.body.tableNumber);
      if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
        return res.status(400).json(error('Table number must be a positive integer', 400));
      }

      const exists = await Table.findOne({ where: { table_number: tableNumber } });
      if (exists && exists.id !== table.id) {
        return res.status(409).json(error(`Table ${tableNumber} already exists`, 409));
      }

      updates.table_number = tableNumber;
    }

    if (req.body.status !== undefined) {
      if (!VALID_TABLE_STATUSES.includes(req.body.status)) {
        return res.status(400).json(error('Invalid table status', 400));
      }
      updates.status = req.body.status;
    }

    await table.update(updates);
    res.json(success(table, 'Table updated successfully'));
  } catch (err) {
    res.status(500).json(error('Update table error', 500, err.message));
  }
};

exports.deleteTable = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const table = await Table.findByPk(id);

    if (!table) {
      return res.status(404).json(error('Table not found', 404));
    }

    const linkedOrders = await Order.count({ where: { table_id: table.id } });
    if (linkedOrders > 0) {
      return res.status(409).json(
        error('Table has orders. Set it to inactive instead of deleting it.', 409)
      );
    }

    await table.destroy();
    res.json(success(null, 'Table deleted successfully'));
  } catch (err) {
    res.status(500).json(error('Delete table error', 500, err.message));
  }
};

exports.getQrLinks = async (req, res) => {
  try {
    const tables = await Table.findAll({
      where: { status: ['available', 'occupied', 'reserved', 'inactive'] },
      order: [['table_number', 'ASC']]
    });

    const frontendOrigin =
      process.env.FRONTEND_URL ||
      req.headers.origin ||
      'http://localhost:5173';

    const qrLinks = tables.map((table) => {
      const signedPayload = buildSignedTablePayload(table.table_number);
      const menuUrl = new URL('/menu', frontendOrigin);
      menuUrl.searchParams.set('table', String(signedPayload.table_number));
      menuUrl.searchParams.set('ts', String(signedPayload.ts));
      menuUrl.searchParams.set('sig', signedPayload.sig);

      return {
        id: table.id,
        table_number: table.table_number,
        status: table.status,
        ...signedPayload,
        menu_url: menuUrl.toString(),
      };
    });

    res.json(success(qrLinks));
  } catch (err) {
    res.status(500).json(error('Get QR links error', 500, err.message));
  }
};
