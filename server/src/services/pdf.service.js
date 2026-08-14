'use strict';

const puppeteer = require('puppeteer');
const path = require('path');
const numberToWords = require('../utils/numberToWords');

const VALID_TEMPLATES = ['classic', 'modern', 'elegant', 'corporate', 'bold'];

// Bump this whenever the PDF templates change so existing cached PDFs are rebuilt
// automatically the next time the user downloads an old invoice.
const PDF_SCHEMA_VERSION = 'v3';

const isValidPdfBase64 = (pdfBase64) => {
  if (!pdfBase64 || typeof pdfBase64 !== 'string') return false;
  try {
    const buf = Buffer.from(pdfBase64, 'base64');
    return buf.length > 200 && buf.slice(0, 5).toString('latin1') === '%PDF-';
  } catch {
    return false;
  }
};

// Convert any Buffers (e.g. logo/signature data) to base64 strings,
// and keep the rest of the object JSON-safe.
const sanitizeData = (obj) => {
  if (Buffer.isBuffer(obj)) return obj.toString('base64');
  if (Array.isArray(obj)) return obj.map(sanitizeData);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj)) out[k] = sanitizeData(obj[k]);
    return out;
  }
  return obj;
};

let browserInstance = null;

const getBrowser = async () => {
  if (!browserInstance || !browserInstance.connected) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
  return browserInstance;
};

const warmUp = async () => {
  try {
    await getBrowser();
    console.log('PDF browser ready');
  } catch (error) {
    console.error('PDF browser warmup failed:', error.message);
  }
};

const generateInvoicePDF = async (invoiceData, templateName = 'classic') => {
  let page = null;
  try {
    const template = VALID_TEMPLATES.includes(templateName) ? templateName : 'classic';

    // Load the JS template function (no EJS dependency)
    const renderTemplate = require(path.join(__dirname, '../templates', `${template}.js`));
    const htmlContent = renderTemplate(sanitizeData(invoiceData), numberToWords);

    const browser = await getBrowser();
    page = await browser.newPage();

    // Set content and wait for fonts / images to settle
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }, // handled by @page in CSS
    });

    await page.close();
    page = null;

    // pdfBuffer is a Uint8Array in newer Puppeteer — ensure it's a proper Buffer
    return Buffer.from(pdfBuffer).toString('base64');
  } catch (error) {
    console.error('PDF Generation Error:', error);
    if (page) {
      try { await page.close(); } catch {}
    }
    try {
      if (browserInstance) { await browserInstance.close(); }
    } catch {}
    browserInstance = null;
    throw new Error('Failed to generate PDF: ' + error.message);
  }
};

module.exports = {
  getBrowser,
  warmUp,
  generateInvoicePDF,
  PDF_SCHEMA_VERSION,
  isValidPdfBase64,
};