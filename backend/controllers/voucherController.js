const voucherService = require('../services/voucherService');
const { success, error, created } = require('../utils/responseFormatter');

exports.wallet = async (req, res) => {
  try {
    const wallet = await voucherService.getWallet(req.user.id);
    res.json(success(wallet));
  } catch (err) {
    res.status(500).json(error('Get wallet error', 500, err.message));
  }
};

exports.list = async (req, res) => {
  try {
    const vouchers = await voucherService.listAvailableVouchers();
    res.json(success(vouchers));
  } catch (err) {
    res.status(500).json(error('List vouchers error', 500, err.message));
  }
};

exports.adminList = async (req, res) => {
  try {
    const vouchers = await voucherService.listAdminVouchers();
    res.json(success(vouchers));
  } catch (err) {
    res.status(500).json(error('List admin vouchers error', 500, err.message));
  }
};

exports.adminCreate = async (req, res) => {
  try {
    const voucher = await voucherService.createVoucher(req.body);
    res.status(201).json(created(voucher, 'Voucher created successfully'));
  } catch (err) {
    if (err.message.includes('required') || err.message.includes('Invalid') || err.message.includes('must') || err.message.includes('cannot')) {
      return res.status(400).json(error(err.message, 400));
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json(error('Voucher code already exists', 400));
    }

    res.status(500).json(error('Create voucher error', 500, err.message));
  }
};

exports.adminUpdate = async (req, res) => {
  try {
    const voucherId = Number(req.params.id);
    if (!Number.isInteger(voucherId)) {
      return res.status(400).json(error('Invalid voucher ID', 400));
    }

    const voucher = await voucherService.updateVoucher(voucherId, req.body);
    res.json(success(voucher, 'Voucher updated successfully'));
  } catch (err) {
    if (err.message === 'Voucher not found') {
      return res.status(404).json(error(err.message, 404));
    }

    if (err.message.includes('required') || err.message.includes('Invalid') || err.message.includes('must') || err.message.includes('cannot')) {
      return res.status(400).json(error(err.message, 400));
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json(error('Voucher code already exists', 400));
    }

    res.status(500).json(error('Update voucher error', 500, err.message));
  }
};

exports.adminDelete = async (req, res) => {
  try {
    const voucherId = Number(req.params.id);
    if (!Number.isInteger(voucherId)) {
      return res.status(400).json(error('Invalid voucher ID', 400));
    }

    const result = await voucherService.deleteVoucher(voucherId);
    res.json(success(result, result.deactivated ? 'Voucher deactivated because it has usage history' : 'Voucher deleted successfully'));
  } catch (err) {
    if (err.message === 'Voucher not found') {
      return res.status(404).json(error(err.message, 404));
    }

    res.status(500).json(error('Delete voucher error', 500, err.message));
  }
};

exports.redeem = async (req, res) => {
  try {
    const voucherId = Number(req.params.id);
    if (!Number.isInteger(voucherId)) {
      return res.status(400).json(error('Invalid voucher ID', 400));
    }

    const userVoucher = await voucherService.redeemVoucher(req.user.id, voucherId);
    res.status(201).json(created(userVoucher, 'Voucher redeemed successfully'));
  } catch (err) {
    if (
      err.message.includes('not available') ||
      err.message.includes('not require') ||
      err.message.includes('Not enough')
    ) {
      return res.status(400).json(error(err.message, 400));
    }

    res.status(500).json(error('Redeem voucher error', 500, err.message));
  }
};
