/**
 * Format various types of values for display in tables
 */
export const formatValue = (value, column) => {
  if (value === null || value === undefined) return '';

  // Hide sensitive fields in table view
  if (column?.hideInTable) return '••••••••';

  // Format boolean
  if (column?.isBoolean) return value ? 'Yes' : 'No';

  // Format currency
  if (column?.isCurrency && typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  // Format dates
  if (
    column?.isDate ||
    (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))
  ) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString('en-US');
  }

  // Format regular numbers
  if (typeof value === 'number' && !column?.isCurrency) {
    return value.toLocaleString();
  }

  return value;
};

/**
 * Get the appropriate HTML input type based on column config
 */
export const getInputType = (col) => {
  if (col.inputType && col.inputType !== 'select') return col.inputType;
  const key = col.key.toLowerCase();
  if (key.includes('email')) return 'email';
  if (key.includes('date') || key === 'dob') return 'date';
  if (key.includes('phone') || key.includes('p_no')) return 'tel';
  return 'text';
};