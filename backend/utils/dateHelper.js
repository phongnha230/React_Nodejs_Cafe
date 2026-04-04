/**
 * Date Helper Utilities
 * Date calculations and formatting
 */

/**
 * Calculate age from birth date
 * @param {Date|string} birthDate - Birth date
 * @returns {number} Age in years
 */
exports.calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
};

/**
 * Check if date is a business day (Monday-Friday)
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if business day
 */
exports.isBusinessDay = (date) => {
    const day = new Date(date).getDay();
    return day !== 0 && day !== 6; // Not Sunday (0) or Saturday (6)
};

/**
 * Add business days to a date
 * @param {Date|string} date - Starting date
 * @param {number} days - Number of business days to add
 * @returns {Date} New date
 */
exports.addBusinessDays = (date, days) => {
    const result = new Date(date);
    let addedDays = 0;

    while (addedDays < days) {
        result.setDate(result.getDate() + 1);
        if (this.isBusinessDay(result)) {
            addedDays++;
        }
    }

    return result;
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if in the past
 */
exports.isPast = (date) => {
    return new Date(date) < new Date();
};

/**
 * Check if date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if in the future
 */
exports.isFuture = (date) => {
    return new Date(date) > new Date();
};

/**
 * Get start of day
 * @param {Date|string} date - Date
 * @returns {Date} Start of day (00:00:00)
 */
exports.startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Get end of day
 * @param {Date|string} date - Date
 * @returns {Date} End of day (23:59:59)
 */
exports.endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
exports.formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Format date to DD/MM/YYYY
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
exports.formatDateVN = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
};

/**
 * Get difference in days between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Difference in days
 */
exports.daysDifference = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
