const resend = require('../config/resend');

const sendInvoiceEmail = async (toEmail, invoiceData, pdfBase64) => {
  try {
    const { invoiceNumber, sellerSnapshot } = invoiceData;
    const businessName = sellerSnapshot?.businessName || 'Us';

    const { data, error } = await resend.emails.send({
      from: 'InvoiceGen <onboarding@resend.dev>',
      to: [toEmail],
      subject: `Invoice ${invoiceNumber} from ${businessName}`,
      html: `
        <h2>Invoice ${invoiceNumber}</h2>
        <p>Please find attached your invoice from ${businessName}.</p>
        <p>Amount Due: ${invoiceData.grandTotal} ${invoiceData.currency}</p>
        <p>Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}</p>
        <br/>
        <p>Thank you for your business!</p>
      `,
      attachments: [
        {
          filename: `Invoice_${invoiceNumber}.pdf`,
          content: pdfBase64,
          encoding: 'base64'
        }
      ]
    });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
};

module.exports = {
  sendInvoiceEmail
};
