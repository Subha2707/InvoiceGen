const Counter = require('../models/Counter');

const generateInvoiceNumber = async (userId) => {
  const currentYear = new Date().getFullYear();
  
  const counter = await Counter.findOneAndUpdate(
    { user: userId, year: currentYear },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const paddedSequence = String(counter.sequence).padStart(5, '0');
  return `INV-${currentYear}-${paddedSequence}`;
};

module.exports = { generateInvoiceNumber };
