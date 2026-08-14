const calculateLineItemGST = (item, sellerStateCode, clientStateCode) => {
  const taxableAmount = parseFloat((item.quantity * item.unitPrice).toFixed(2));
  
  if (!item.gstEnabled || item.gstPercentage === 0) {
    return {
      taxableAmount,
      cgstRate: 0, cgstAmount: 0,
      sgstRate: 0, sgstAmount: 0,
      igstRate: 0, igstAmount: 0,
      totalPrice: taxableAmount
    };
  }

  const isInterState = sellerStateCode !== clientStateCode;
  const gstAmount = parseFloat(((taxableAmount * item.gstPercentage) / 100).toFixed(2));

  let cgstRate = 0, cgstAmount = 0;
  let sgstRate = 0, sgstAmount = 0;
  let igstRate = 0, igstAmount = 0;

  if (isInterState) {
    igstRate = item.gstPercentage;
    igstAmount = gstAmount;
  } else {
    cgstRate = item.gstPercentage / 2;
    sgstRate = item.gstPercentage / 2;
    cgstAmount = parseFloat((gstAmount / 2).toFixed(2));
    sgstAmount = parseFloat((gstAmount / 2).toFixed(2));
  }

  return {
    taxableAmount,
    cgstRate, cgstAmount,
    sgstRate, sgstAmount,
    igstRate, igstAmount,
    totalPrice: parseFloat((taxableAmount + gstAmount).toFixed(2))
  };
};

const calculateInvoiceTotals = (items, discount, shippingCharge, sellerStateCode, clientStateCode) => {
  const isInterState = sellerStateCode !== clientStateCode;
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const processedItems = items.map(item => {
    const calculated = calculateLineItemGST(item, sellerStateCode, clientStateCode);
    subtotal += calculated.taxableAmount;
    totalCgst += calculated.cgstAmount;
    totalSgst += calculated.sgstAmount;
    totalIgst += calculated.igstAmount;
    return { ...item, ...calculated };
  });

  let discountAmount = 0;
  if (discount && discount.value) {
    if (discount.type === 'percentage') {
      discountAmount = parseFloat(((subtotal * discount.value) / 100).toFixed(2));
    } else {
      discountAmount = parseFloat(discount.value.toFixed(2));
    }
  }

  const totalTax = parseFloat((totalCgst + totalSgst + totalIgst).toFixed(2));
  const preRoundTotal = subtotal - discountAmount + totalTax + (shippingCharge || 0);
  const grandTotal = Math.round(preRoundTotal);
  const roundOff = parseFloat((grandTotal - preRoundTotal).toFixed(2));

  return {
    isInterState,
    items: processedItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    discountAmount,
    totalCgst: parseFloat(totalCgst.toFixed(2)),
    totalSgst: parseFloat(totalSgst.toFixed(2)),
    totalIgst: parseFloat(totalIgst.toFixed(2)),
    totalTax,
    shippingCharge: parseFloat((shippingCharge || 0).toFixed(2)),
    roundOff,
    grandTotal
  };
};

module.exports = {
  calculateLineItemGST,
  calculateInvoiceTotals
};
