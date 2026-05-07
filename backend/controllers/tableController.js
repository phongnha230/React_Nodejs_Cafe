const Table = require('../models/table');
const { success, error } = require('../utils/responseFormatter');
const { buildSignedTablePayload } = require('../utils/qrSignature');

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
