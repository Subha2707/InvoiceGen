const Invoice = require('../models/Invoice');
const BusinessProfile = require('../models/BusinessProfile');
const Client = require('../models/Client');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { generateInvoiceNumber } = require('../utils/invoiceNumber');
const { calculateInvoiceTotals } = require('../services/gst.service');
const { generateInvoicePDF, PDF_SCHEMA_VERSION, isValidPdfBase64 } = require('../services/pdf.service');
const { sendInvoiceEmail } = require('../services/email.service');

const tryCachePdf = async (invoice, pdfBase64) => {
  try {
    invoice.pdfData = pdfBase64;
    invoice.pdfVersion = PDF_SCHEMA_VERSION;
    await invoice.save();
  } catch (error) {
    console.error('Failed to cache PDF, skipping:', error.message);
  }
  return pdfBase64;
};

const getPdfForInvoice = async (invoice) => {
  const cached = invoice.pdfData && isValidPdfBase64(invoice.pdfData) && invoice.pdfVersion === PDF_SCHEMA_VERSION;
  if (cached) return invoice.pdfData;
  const pdfBase64 = await generateInvoicePDF(invoice.toObject(), invoice.template);
  return tryCachePdf(invoice, pdfBase64);
};

const getInvoices = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const { status, dateFrom, dateTo, search } = req.query;

  const query = { user: req.user._id };
  if (status) query.status = status;
  if (dateFrom || dateTo) {
    query.issueDate = {};
    if (dateFrom) query.issueDate.$gte = new Date(dateFrom);
    if (dateTo) query.issueDate.$lte = new Date(dateTo);
  }
  if (search) {
    query.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { 'clientSnapshot.clientName': { $regex: search, $options: 'i' } }
    ];
  }

  const totalItems = await Invoice.countDocuments(query);
  const invoices = await Invoice.find(query)
    .select('-sellerSnapshot.logo -sellerSnapshot.signature')
    .populate('client', 'clientName email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json(new ApiResponse(200, {
    invoices,
    meta: {
      page, limit, totalItems, totalPages: Math.ceil(totalItems / limit)
    }
  }, 'Invoices retrieved'));
});

const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id }).populate('client');
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  res.status(200).json(new ApiResponse(200, invoice, 'Invoice retrieved'));
});

const createInvoice = asyncHandler(async (req, res) => {
  const { clientId, items, discount, shippingCharge, ...rest } = req.body;

  const businessProfile = await BusinessProfile.findOne({ user: req.user._id });
  if (!businessProfile) throw new ApiError(400, 'Please complete your business profile first');

  const client = await Client.findOne({ _id: clientId, user: req.user._id });
  if (!client) throw new ApiError(404, 'Client not found');

  const invoiceNumber = await generateInvoiceNumber(req.user._id);

  const sellerStateCode = businessProfile.stateCode;
  const clientStateCode = client.billingAddress?.stateCode;

  const totals = calculateInvoiceTotals(items, discount, shippingCharge, sellerStateCode, clientStateCode);

  const invoice = await Invoice.create({
    user: req.user._id,
    invoiceNumber,
    client: client._id,
    sellerSnapshot: businessProfile.toObject(),
    clientSnapshot: client.toObject(),
    items: totals.items,
    isInterState: totals.isInterState,
    subtotal: totals.subtotal,
    discount,
    discountAmount: totals.discountAmount,
    totalCgst: totals.totalCgst,
    totalSgst: totals.totalSgst,
    totalIgst: totals.totalIgst,
    totalTax: totals.totalTax,
    shippingCharge: totals.shippingCharge,
    roundOff: totals.roundOff,
    grandTotal: totals.grandTotal,
    ...rest
  });

  res.status(201).json(new ApiResponse(201, invoice, 'Invoice created'));
});

const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  const { items, discount, shippingCharge, ...rest } = req.body;

  if (items || discount || shippingCharge !== undefined) {
    const sellerStateCode = invoice.sellerSnapshot.stateCode;
    const clientStateCode = invoice.clientSnapshot.billingAddress?.stateCode;
    const newItems = items || invoice.items;
    const newDiscount = discount !== undefined ? discount : invoice.discount;
    const newShipping = shippingCharge !== undefined ? shippingCharge : invoice.shippingCharge;
    const totals = calculateInvoiceTotals(newItems, newDiscount, newShipping, sellerStateCode, clientStateCode);
    Object.assign(invoice, totals);
    invoice.discount = newDiscount;
  }

  Object.assign(invoice, rest);
  invoice.pdfData = undefined; // clear cached PDF
  invoice.pdfVersion = undefined;

  await invoice.save();
  res.status(200).json(new ApiResponse(200, invoice, 'Invoice updated'));
});

const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  res.status(200).json(new ApiResponse(200, null, 'Invoice deleted'));
});

const downloadPDF = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id }).select('+pdfData +pdfVersion');
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  let pdfBase64 = await getPdfForInvoice(invoice);

  const pdfBuffer = Buffer.from(pdfBase64, 'base64');
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': pdfBuffer.length,
    'Content-Disposition': `attachment; filename="Invoice_${invoice.invoiceNumber}.pdf"`
  });
  res.send(pdfBuffer);
});

const duplicateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id });
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  const invoiceNumber = await generateInvoiceNumber(req.user._id);
  const duplicate = invoice.toObject();
  delete duplicate._id;
  delete duplicate.createdAt;
  delete duplicate.updatedAt;
  duplicate.invoiceNumber = invoiceNumber;
  duplicate.status = 'draft';
  duplicate.issueDate = new Date();
  duplicate.dueDate = undefined;
  duplicate.pdfData = undefined;
  duplicate.pdfVersion = undefined;
  duplicate.emailSent = false;
  duplicate.emailSentAt = undefined;

  const newInvoice = await Invoice.create(duplicate);
  res.status(201).json(new ApiResponse(201, newInvoice, 'Invoice duplicated'));
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const invoice = await Invoice.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { status },
    { new: true }
  );
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  res.status(200).json(new ApiResponse(200, invoice, 'Status updated'));
});

const emailInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id }).select('+pdfData +pdfVersion');
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  let pdfBase64 = await getPdfForInvoice(invoice);

  const email = invoice.clientSnapshot?.email;
  if (!email) throw new ApiError(400, 'Client email not found');

  await sendInvoiceEmail(email, invoice.toObject(), pdfBase64);

  invoice.emailSent = true;
  invoice.emailSentAt = new Date();
  await invoice.save();

  res.status(200).json(new ApiResponse(200, null, 'Invoice emailed successfully'));
});

const exportCSV = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ user: req.user._id }).sort({ createdAt: -1 });
  let csv = 'Invoice Number,Client Name,Status,Issue Date,Grand Total\n';
  invoices.forEach(inv => {
    csv += `${inv.invoiceNumber},${inv.clientSnapshot?.clientName},${inv.status},${inv.issueDate},${inv.grandTotal}\n`;
  });

  res.set({
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename="invoices.csv"'
  });
  res.send(csv);
});

module.exports = {
  getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice,
  downloadPDF, duplicateInvoice, updateStatus, emailInvoice, exportCSV
};
