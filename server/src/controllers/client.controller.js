const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const getClients = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search || '';

  const query = { user: req.user._id };
  if (search) {
    query.$or = [
      { clientName: { $regex: search, $options: 'i' } },
      { companyName: { $regex: search, $options: 'i' } }
    ];
  }

  const totalItems = await Client.countDocuments(query);
  const clients = await Client.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const totalPages = Math.ceil(totalItems / limit);

  res.status(200).json(new ApiResponse(200, {
    clients,
    meta: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  }, 'Clients retrieved'));
});

const getClient = asyncHandler(async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id, user: req.user._id });
  if (!client) throw new ApiError(404, 'Client not found');
  res.status(200).json(new ApiResponse(200, client, 'Client retrieved'));
});

const createClient = asyncHandler(async (req, res) => {
  const client = await Client.create({ ...req.body, user: req.user._id });
  res.status(201).json(new ApiResponse(201, client, 'Client created successfully'));
});

const updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!client) throw new ApiError(404, 'Client not found');
  res.status(200).json(new ApiResponse(200, client, 'Client updated successfully'));
});

const deleteClient = asyncHandler(async (req, res) => {
  const invoicesCount = await Invoice.countDocuments({ client: req.params.id, user: req.user._id });
  if (invoicesCount > 0) {
    throw new ApiError(400, 'Cannot delete client with existing invoices');
  }

  const client = await Client.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!client) throw new ApiError(404, 'Client not found');

  res.status(200).json(new ApiResponse(200, null, 'Client deleted successfully'));
});

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
};
