/**
 * Format số tiền thành định dạng VND
 * @param {number} amount - Số tiền cần format
 * @returns {string} Chuỗi đã được format
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format ngày tháng
 * @param {Date|string} date - Ngày cần format
 * @param {string} format - Định dạng (default: 'dd/MM/yyyy')
 * @returns {string} Chuỗi ngày đã được format
 */
export function formatDate(date, format = 'dd/MM/yyyy') {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year)
    .replace('HH', hours)
    .replace('mm', minutes);
}

/**
 * Format số với dấu phẩy
 * @param {number} num - Số cần format
 * @returns {string} Chuỗi số đã được format
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('vi-VN').format(num);
}

