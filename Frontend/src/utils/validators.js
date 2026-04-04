/**
 * Validate email
 * @param {string} email - Email cần validate
 * @returns {boolean} true nếu hợp lệ
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate password
 * @param {string} password - Password cần validate
 * @returns {Object} { valid: boolean, message: string }
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, message: 'Mật khẩu không được để trống' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLowerCase || !hasUpperCase || !hasNumber) {
    return {
      valid: false,
      message: 'Mật khẩu phải có chữ hoa, chữ thường và số',
    };
  }

  return { valid: true, message: '' };
}

/**
 * Validate phone number (Vietnam format)
 * @param {string} phone - Số điện thoại cần validate
 * @returns {boolean} true nếu hợp lệ
 */
export function validatePhone(phone) {
  const re = /^(0|\+84)[1-9][0-9]{8,9}$/;
  return re.test(phone.replace(/\s/g, ''));
}

/**
 * Validate required field
 * @param {any} value - Giá trị cần validate
 * @returns {boolean} true nếu có giá trị
 */
export function validateRequired(value) {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

