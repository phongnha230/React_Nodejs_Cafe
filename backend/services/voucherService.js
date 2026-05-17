const sequelize = require('../config/database');
const { Op } = require('sequelize');
const User = require('../models/user');
const Voucher = require('../models/voucher');
const UserVoucher = require('../models/userVoucher');
const CoinTransaction = require('../models/coinTransaction');

class VoucherService {
    isVoucherActive(voucher, now = new Date()) {
        if (!voucher || !voucher.is_active) return false;
        if (voucher.start_at && new Date(voucher.start_at) > now) return false;
        if (voucher.end_at && new Date(voucher.end_at) < now) return false;
        if (voucher.usage_limit !== null && voucher.used_count >= voucher.usage_limit) return false;
        return true;
    }

    calculateDiscount(voucher, subtotal) {
        const orderSubtotal = Math.max(0, Number(subtotal) || 0);
        if (!voucher || orderSubtotal < Number(voucher.min_order_amount || 0)) {
            return 0;
        }

        let discount = 0;
        if (voucher.discount_type === 'percent') {
            discount = orderSubtotal * (Number(voucher.discount_value) / 100);
            if (voucher.max_discount_amount) {
                discount = Math.min(discount, Number(voucher.max_discount_amount));
            }
        } else {
            discount = Number(voucher.discount_value) || 0;
        }

        return Math.min(orderSubtotal, Math.max(0, Math.floor(discount)));
    }

    async getWallet(userId) {
        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', 'coins']
        });

        if (!user) {
            throw new Error('User not found');
        }

        const vouchers = await UserVoucher.findAll({
            where: { user_id: userId },
            include: [{ model: Voucher, as: 'voucher' }],
            order: [['id', 'DESC']]
        });

        return {
            coins: user.coins || 0,
            vouchers
        };
    }

    async listAvailableVouchers() {
        const now = new Date();
        return Voucher.findAll({
            where: {
                is_active: true,
                [Op.and]: [
                    { [Op.or]: [{ start_at: null }, { start_at: { [Op.lte]: now } }] },
                    { [Op.or]: [{ end_at: null }, { end_at: { [Op.gte]: now } }] },
                    { [Op.or]: [{ usage_limit: null }, sequelize.where(sequelize.col('used_count'), '<', sequelize.col('usage_limit'))] }
                ]
            },
            order: [['coin_cost', 'ASC'], ['id', 'DESC']]
        });
    }

    async listAdminVouchers() {
        return Voucher.findAll({
            order: [['id', 'DESC']]
        });
    }

    normalizeVoucherPayload(data) {
        const code = String(data.code || '').trim().toUpperCase();
        const name = String(data.name || '').trim();
        const type = data.type || 'direct';
        const discountType = data.discount_type || data.discountType;
        const discountValue = Number(data.discount_value ?? data.discountValue);
        const coinCost = Number(data.coin_cost ?? data.coinCost ?? 0);
        const minOrderAmount = Number(data.min_order_amount ?? data.minOrderAmount ?? 0);
        const maxDiscountRaw = data.max_discount_amount ?? data.maxDiscountAmount;
        const usageLimitRaw = data.usage_limit ?? data.usageLimit;

        if (!code) throw new Error('Voucher code is required');
        if (!name) throw new Error('Voucher name is required');
        if (!['coin_exchange', 'direct'].includes(type)) throw new Error('Invalid voucher type');
        if (!['percent', 'fixed'].includes(discountType)) throw new Error('Invalid discount type');
        if (!Number.isFinite(discountValue) || discountValue <= 0) throw new Error('Discount value must be greater than 0');
        if (discountType === 'percent' && discountValue > 100) throw new Error('Percent discount cannot exceed 100');
        if (type === 'coin_exchange' && (!Number.isFinite(coinCost) || coinCost <= 0)) {
            throw new Error('Coin cost must be greater than 0 for coin exchange vouchers');
        }

        return {
            code,
            name,
            type,
            discount_type: discountType,
            discount_value: Math.floor(discountValue),
            coin_cost: type === 'coin_exchange' ? Math.floor(coinCost) : 0,
            min_order_amount: Number.isFinite(minOrderAmount) ? Math.max(0, Math.floor(minOrderAmount)) : 0,
            max_discount_amount: maxDiscountRaw === '' || maxDiscountRaw === null || maxDiscountRaw === undefined
                ? null
                : Math.max(0, Math.floor(Number(maxDiscountRaw) || 0)),
            usage_limit: usageLimitRaw === '' || usageLimitRaw === null || usageLimitRaw === undefined
                ? null
                : Math.max(1, Math.floor(Number(usageLimitRaw) || 1)),
            is_active: data.is_active ?? data.isActive ?? true,
            start_at: data.start_at || data.startAt || null,
            end_at: data.end_at || data.endAt || null,
        };
    }

    async createVoucher(data) {
        const payload = this.normalizeVoucherPayload(data);
        return Voucher.create(payload);
    }

    async updateVoucher(voucherId, data) {
        const voucher = await Voucher.findByPk(voucherId);
        if (!voucher) {
            throw new Error('Voucher not found');
        }

        const payload = this.normalizeVoucherPayload({
            ...voucher.toJSON(),
            ...data
        });

        await voucher.update(payload);
        return voucher;
    }

    async deleteVoucher(voucherId) {
        const voucher = await Voucher.findByPk(voucherId);
        if (!voucher) {
            throw new Error('Voucher not found');
        }

        const assignedCount = await UserVoucher.count({
            where: { voucher_id: voucherId }
        });

        if (assignedCount > 0 || Number(voucher.used_count || 0) > 0) {
            await voucher.update({ is_active: false });
            return { deleted: false, deactivated: true, voucher };
        }

        await voucher.destroy();
        return { deleted: true, deactivated: false };
    }

    async redeemVoucher(userId, voucherId) {
        const transaction = await sequelize.transaction();

        try {
            const voucher = await Voucher.findByPk(voucherId, { transaction, lock: transaction.LOCK.UPDATE });
            if (!this.isVoucherActive(voucher)) {
                throw new Error('Voucher is not available');
            }

            if (voucher.type !== 'coin_exchange') {
                throw new Error('This voucher does not require coin exchange');
            }

            const user = await User.findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE });
            if (!user) {
                throw new Error('User not found');
            }

            const cost = Number(voucher.coin_cost || 0);
            if (Number(user.coins || 0) < cost) {
                throw new Error('Not enough coins');
            }

            await user.update({ coins: Number(user.coins || 0) - cost }, { transaction });
            await CoinTransaction.create({
                user_id: userId,
                amount: -cost,
                type: 'voucher_redeem',
                description: `Redeemed voucher ${voucher.code}`
            }, { transaction });

            const userVoucher = await UserVoucher.create({
                user_id: userId,
                voucher_id: voucher.id
            }, { transaction });

            await transaction.commit();

            return UserVoucher.findByPk(userVoucher.id, {
                include: [{ model: Voucher, as: 'voucher' }]
            });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async resolveVoucherForOrder(userId, { voucherCode, userVoucherId, subtotal, transaction }) {
        if (!voucherCode && !userVoucherId) {
            return {
                voucher: null,
                userVoucher: null,
                discountAmount: 0
            };
        }

        let voucher = null;
        let userVoucher = null;

        if (userVoucherId) {
            userVoucher = await UserVoucher.findOne({
                where: { id: userVoucherId, user_id: userId, is_used: false },
                include: [{ model: Voucher, as: 'voucher' }],
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!userVoucher) {
                throw new Error('User voucher not found or already used');
            }

            voucher = userVoucher.voucher;
        } else {
            voucher = await Voucher.findOne({
                where: { code: String(voucherCode).trim().toUpperCase(), type: 'direct' },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!voucher) {
                throw new Error('Voucher code is invalid');
            }
        }

        if (!this.isVoucherActive(voucher)) {
            throw new Error('Voucher is not available');
        }

        const discountAmount = this.calculateDiscount(voucher, subtotal);
        if (discountAmount <= 0) {
            throw new Error('Voucher conditions are not met');
        }

        return {
            voucher,
            userVoucher,
            discountAmount
        };
    }
}

module.exports = new VoucherService();
