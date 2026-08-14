export const INDIAN_STATES = [
  'Andaman & Nicobar', 'Andhra Pradesh', 'Andhra Pradesh (Old)', 'Arunachal Pradesh',
  'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra & Nagar Haveli', 'Daman & Diu',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Other Territory',
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const INVOICE_TEMPLATES = [
  { value: 'classic', label: 'Classic' },
  { value: 'modern', label: 'Modern' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'bold', label: 'Bold' }
];

export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  return error?.response?.data?.message || error?.message || fallback;
};

export const downloadBlob = (data, filename) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
