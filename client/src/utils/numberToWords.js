const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const twoDigits = (num) => {
  if (num < 20) return ones[num];
  return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
};

const rec = (num) => {
  if (num === 0) return '';
  if (num < 100) return twoDigits(num).trim();

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const rest = num % 100;

  let parts = [];
  if (crore) parts.push(rec(crore) + ' Crore');
  if (lakh) parts.push(rec(lakh) + ' Lakh');
  if (thousand) parts.push(rec(thousand) + ' Thousand');
  if (hundred) parts.push(twoDigits(hundred) + ' Hundred');
  if (rest) parts.push(twoDigits(rest));
  return parts.join(' ').trim();
};

export const numberToWords = (amount) => {
  if (amount == null || isNaN(amount)) return 'Zero Only';
  const rounded = Math.round(amount * 100) / 100;
  const intPart = Math.floor(Math.abs(rounded));
  const decPart = Math.round((Math.abs(rounded) - intPart) * 100);

  const rupee = intPart ? rec(intPart) : 'Zero';
  let result = rupee + ' Rupees';
  if (decPart > 0) result += ' and ' + rec(decPart) + ' Paise';
  return result + ' Only';
};

export default numberToWords;
