const typeOf = (v) => {
  if (Array.isArray(v)) return 'array';
  if (v === null) return 'null';
  return typeof v;
};

module.exports = (schema) => {
  return (req, res, next) => {
    const body = req.body ?? {};
    const errors = [];

    for (const [field, rule] of Object.entries(schema || {})) {
      const value = body[field];
      const required = !!rule.required;
      const expected = rule.type;
      if (required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: 'is required' });
        continue;
      }
      if (value !== undefined && expected) {
        const t = typeOf(value);
        if (t !== expected) {
          errors.push({ field, message: `must be type ${expected}` });
          continue;
        }
      }
      if (rule.enum && value !== undefined && !rule.enum.includes(value)) {
        errors.push({ field, message: `must be one of ${rule.enum.join(', ')}` });
      }
      if (rule.min != null && typeof value === 'number' && value < rule.min) {
        errors.push({ field, message: `must be >= ${rule.min}` });
      }
      if (rule.max != null && typeof value === 'number' && value > rule.max) {
        errors.push({ field, message: `must be <= ${rule.max}` });
      }
      if (rule.minLength != null && typeof value === 'string' && value.length < rule.minLength) {
        errors.push({ field, message: `length must be >= ${rule.minLength}` });
      }
      if (rule.maxLength != null && typeof value === 'string' && value.length > rule.maxLength) {
        errors.push({ field, message: `length must be <= ${rule.maxLength}` });
      }
    }

    if (errors.length) return res.status(400).json({ message: 'Validation failed', errors });
    next();
  };
};

