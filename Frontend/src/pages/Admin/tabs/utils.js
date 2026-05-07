export const formatDateTime = (dateString) => {
  if (!dateString) return 'Chưa đăng nhập'
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hour}:${minute}`
}

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'N/A'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export const getPaymentMethodName = (method) => {
  const methods = {
    cash: 'Tiền mặt',
    direct: 'Tiền mặt',
    momo: 'MoMo',
    mono: 'MoMo',
    vnpay: 'VNPay',
    online: 'Online',
    card: 'Thẻ',
  }
  return methods[String(method || '').toLowerCase()] || method || 'N/A'
}

export const getOrderTableNumber = (order) => {
  if (order.tableNumber) return Number(order.tableNumber)
  if (order.table_number) return Number(order.table_number)
  const parsed = parseInt(String(order.address || '').replace(/\D+/g, ''), 10)
  return Number.isInteger(parsed) ? parsed : null
}

export const getOrderPayment = (order) => (
  Array.isArray(order?.payments) && order.payments.length > 0
    ? order.payments[0]
    : null
)
