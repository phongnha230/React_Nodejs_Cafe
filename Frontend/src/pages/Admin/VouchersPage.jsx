import { useEffect, useMemo, useState } from 'react'
import { useVoucherStore } from '../../stores/voucherStore.js'

const emptyForm = {
  code: '',
  name: '',
  type: 'direct',
  discount_type: 'percent',
  discount_value: '',
  coin_cost: '',
  min_order_amount: '',
  max_discount_amount: '',
  usage_limit: '',
  is_active: true,
  start_at: '',
  end_at: '',
}

const toInputDateTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')}d`

export function VouchersPage() {
  const vouchers = useVoucherStore((s) => s.vouchers)
  const loading = useVoucherStore((s) => s.loading)
  const loadAdminVouchers = useVoucherStore((s) => s.loadAdminVouchers)
  const createVoucher = useVoucherStore((s) => s.createVoucher)
  const updateVoucher = useVoucherStore((s) => s.updateVoucher)
  const deleteVoucher = useVoucherStore((s) => s.deleteVoucher)

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadAdminVouchers()
  }, [loadAdminVouchers])

  const filteredVouchers = useMemo(() => {
    if (filter === 'all') return vouchers
    return vouchers.filter((voucher) => voucher.type === filter)
  }, [filter, vouchers])

  const updateField = (name, value) => {
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'type' && value === 'direct' ? { coin_cost: '' } : {}),
    }))
  }

  const startEdit = (voucher) => {
    setEditingId(voucher.id)
    setForm({
      code: voucher.code || '',
      name: voucher.name || '',
      type: voucher.type || 'direct',
      discount_type: voucher.discount_type || 'percent',
      discount_value: voucher.discount_value ?? '',
      coin_cost: voucher.coin_cost ?? '',
      min_order_amount: voucher.min_order_amount ?? '',
      max_discount_amount: voucher.max_discount_amount ?? '',
      usage_limit: voucher.usage_limit ?? '',
      is_active: Boolean(voucher.is_active),
      start_at: toInputDateTime(voucher.start_at),
      end_at: toInputDateTime(voucher.end_at),
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const submit = async (event) => {
    event.preventDefault()
    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      discount_value: Number(form.discount_value || 0),
      coin_cost: Number(form.coin_cost || 0),
      min_order_amount: Number(form.min_order_amount || 0),
      max_discount_amount: form.max_discount_amount === '' ? null : Number(form.max_discount_amount),
      usage_limit: form.usage_limit === '' ? null : Number(form.usage_limit),
      start_at: form.start_at || null,
      end_at: form.end_at || null,
    }

    try {
      if (editingId) {
        await updateVoucher(editingId, payload)
        alert('Da cap nhat voucher')
      } else {
        await createVoucher(payload)
        alert('Da tao voucher')
      }
      resetForm()
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Luu voucher that bai')
    }
  }

  return (
    <div className="dashboard-section">
      <h3>Quan ly voucher</h3>

      <form className="newsletter-form" onSubmit={submit}>
        <input
          className="newsletter-input"
          placeholder="Ma voucher, vi du WELCOME10"
          value={form.code}
          onChange={(event) => updateField('code', event.target.value)}
        />
        <input
          className="newsletter-input"
          placeholder="Ten voucher"
          value={form.name}
          onChange={(event) => updateField('name', event.target.value)}
        />
        <select
          className="newsletter-input"
          value={form.type}
          onChange={(event) => updateField('type', event.target.value)}
        >
          <option value="direct">Dung thang bang ma</option>
          <option value="coin_exchange">Doi bang xu</option>
        </select>
        <select
          className="newsletter-input"
          value={form.discount_type}
          onChange={(event) => updateField('discount_type', event.target.value)}
        >
          <option value="percent">Giam theo phan tram</option>
          <option value="fixed">Giam so tien co dinh</option>
        </select>
        <input
          className="newsletter-input"
          type="number"
          min="1"
          placeholder={form.discount_type === 'percent' ? 'Gia tri giam (%)' : 'Gia tri giam (d)'}
          value={form.discount_value}
          onChange={(event) => updateField('discount_value', event.target.value)}
        />
        {form.type === 'coin_exchange' && (
          <input
            className="newsletter-input"
            type="number"
            min="1"
            placeholder="So xu can doi"
            value={form.coin_cost}
            onChange={(event) => updateField('coin_cost', event.target.value)}
          />
        )}
        <input
          className="newsletter-input"
          type="number"
          min="0"
          placeholder="Don toi thieu (d)"
          value={form.min_order_amount}
          onChange={(event) => updateField('min_order_amount', event.target.value)}
        />
        <input
          className="newsletter-input"
          type="number"
          min="0"
          placeholder="Giam toi da (bo trong neu khong gioi han)"
          value={form.max_discount_amount}
          onChange={(event) => updateField('max_discount_amount', event.target.value)}
        />
        <input
          className="newsletter-input"
          type="number"
          min="1"
          placeholder="So luot dung toi da"
          value={form.usage_limit}
          onChange={(event) => updateField('usage_limit', event.target.value)}
        />
        <input
          className="newsletter-input"
          type="datetime-local"
          value={form.start_at}
          onChange={(event) => updateField('start_at', event.target.value)}
        />
        <input
          className="newsletter-input"
          type="datetime-local"
          value={form.end_at}
          onChange={(event) => updateField('end_at', event.target.value)}
        />
        <select
          className="newsletter-input"
          value={form.is_active ? 'true' : 'false'}
          onChange={(event) => updateField('is_active', event.target.value === 'true')}
        >
          <option value="true">Dang bat</option>
          <option value="false">Tam tat</option>
        </select>
        <button className="btn" type="submit" disabled={loading}>
          {editingId ? 'Cap nhat voucher' : 'Tao voucher'}
        </button>
        {editingId && (
          <button className="btn secondary" type="button" onClick={resetForm}>
            Huy sua
          </button>
        )}
      </form>

      <div style={{ margin: '16px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          ['all', 'Tat ca'],
          ['direct', 'Dung thang'],
          ['coin_exchange', 'Doi bang xu'],
        ].map(([value, label]) => (
          <button
            key={value}
            className={`btn ${filter === value ? '' : 'secondary'}`}
            type="button"
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Ma</th>
            <th>Ten</th>
            <th>Loai</th>
            <th>Giam</th>
            <th>Dieu kien</th>
            <th>Luot dung</th>
            <th>Trang thai</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredVouchers.map((voucher) => (
            <tr key={voucher.id}>
              <td><strong>{voucher.code}</strong></td>
              <td>{voucher.name}</td>
              <td>{voucher.type === 'coin_exchange' ? `Doi ${voucher.coin_cost} xu` : 'Dung thang'}</td>
              <td>
                {voucher.discount_type === 'percent'
                  ? `${voucher.discount_value}%`
                  : formatMoney(voucher.discount_value)}
                {voucher.max_discount_amount ? `, toi da ${formatMoney(voucher.max_discount_amount)}` : ''}
              </td>
              <td>{voucher.min_order_amount ? `Tu ${formatMoney(voucher.min_order_amount)}` : 'Khong'}</td>
              <td>
                {Number(voucher.used_count || 0).toLocaleString('vi-VN')} / {voucher.usage_limit || 'khong gioi han'}
              </td>
              <td>
                <span className={`status-badge ${voucher.is_active ? 'delivered' : 'cancelled'}`}>
                  {voucher.is_active ? 'Dang bat' : 'Tam tat'}
                </span>
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>
                <button className="btn" type="button" onClick={() => startEdit(voucher)}>
                  Sua
                </button>
                <button
                  className="btn secondary"
                  type="button"
                  style={{ marginLeft: 8 }}
                  onClick={async () => {
                    if (!confirm('Xoa voucher nay? Voucher da co lich su se duoc tam tat thay vi xoa.')) return
                    try {
                      const response = await deleteVoucher(voucher.id)
                      alert(response?.message || 'Da xu ly voucher')
                    } catch (error) {
                      alert(error.response?.data?.message || error.message || 'Xoa voucher that bai')
                    }
                  }}
                >
                  Xoa
                </button>
              </td>
            </tr>
          ))}
          {filteredVouchers.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', color: '#64748b' }}>
                Chua co voucher nao. Tao voucher dau tien tu form ben tren.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
