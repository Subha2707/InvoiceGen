const express = require('express');
const { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, downloadPDF, duplicateInvoice, updateStatus, emailInvoice, exportCSV } = require('../controllers/invoice.controller');
const { protect } = require('../middleware/auth');
const { pdfLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

router.use(protect);

router.get('/export/csv', exportCSV);

router.route('/')
  .get(getInvoices)
  .post(createInvoice);

router.route('/:id')
  .get(getInvoice)
  .put(updateInvoice)
  .delete(deleteInvoice);

router.get('/:id/pdf', pdfLimiter, downloadPDF);
router.post('/:id/duplicate', duplicateInvoice);
router.patch('/:id/status', updateStatus);
router.post('/:id/email', pdfLimiter, emailInvoice);

module.exports = router;
