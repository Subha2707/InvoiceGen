const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  gstEnabled: { type: Boolean, default: false },
  gstPercentage: { type: Number, enum: [0, 5, 12, 18, 28], default: 0 },
  taxableAmount: { type: Number, default: 0 },
  cgstRate: { type: Number, default: 0 },
  cgstAmount: { type: Number, default: 0 },
  sgstRate: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  igstRate: { type: Number, default: 0 },
  igstAmount: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  status: { type: String, enum: ['draft', 'pending', 'paid', 'overdue'], default: 'draft' },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date },
  currency: { type: String, enum: ['INR', 'USD', 'EUR', 'GBP'], default: 'INR' },
  template: { type: String, default: 'classic' },
  
  sellerSnapshot: { type: mongoose.Schema.Types.Mixed },
  clientSnapshot: { type: mongoose.Schema.Types.Mixed },
  
  items: [invoiceItemSchema],
  isInterState: { type: Boolean, default: false },
  
  subtotal: { type: Number, default: 0 },
  discount: {
    type: { type: String, enum: ['percentage', 'fixed'] },
    value: { type: Number, default: 0 }
  },
  discountAmount: { type: Number, default: 0 },
  
  totalCgst: { type: Number, default: 0 },
  totalSgst: { type: Number, default: 0 },
  totalIgst: { type: Number, default: 0 },
  totalTax: { type: Number, default: 0 },
  
  shippingCharge: { type: Number, default: 0 },
  roundOff: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  
  notes: String,
  termsAndConditions: String,
  
  pdfData: { type: String, select: false },
  pdfVersion: { type: String, select: false },
  emailSent: { type: Boolean, default: false },
  emailSentAt: Date
}, { timestamps: true });

invoiceSchema.index({ user: 1, createdAt: -1 });
invoiceSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
