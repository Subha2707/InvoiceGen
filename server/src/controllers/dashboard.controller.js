const Invoice = require('../models/Invoice');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getStats = asyncHandler(async (req, res) => {
  const now = new Date();
  
  await Invoice.updateMany(
    { user: req.user._id, status: 'pending', dueDate: { $lt: now } },
    { $set: { status: 'overdue' } }
  );

  const invoices = await Invoice.find({ user: req.user._id });

  let totalRevenue = 0, paidRevenue = 0, pendingRevenue = 0;
  let paidInvoices = 0, pendingInvoices = 0, overdueInvoices = 0;

  invoices.forEach(inv => {
    totalRevenue += inv.grandTotal;
    if (inv.status === 'paid') {
      paidRevenue += inv.grandTotal;
      paidInvoices++;
    } else if (inv.status === 'pending') {
      pendingRevenue += inv.grandTotal;
      pendingInvoices++;
    } else if (inv.status === 'overdue') {
      overdueInvoices++;
    }
  });

  const recentInvoices = await Invoice.find({ user: req.user._id })
    .select('-sellerSnapshot.logo -sellerSnapshot.signature')
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('client', 'clientName');

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 5);
  
  const monthlyData = await Invoice.aggregate([
    { $match: { user: req.user._id, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        revenue: { $sum: '$grandTotal' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.status(200).json(new ApiResponse(200, {
    totalInvoices: invoices.length,
    paidInvoices, pendingInvoices, overdueInvoices,
    totalRevenue, paidRevenue, pendingRevenue,
    recentInvoices,
    monthlyData
  }, 'Dashboard stats retrieved'));
});

module.exports = { getStats };
