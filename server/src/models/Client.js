const mongoose = require('mongoose');
const { getStateCode } = require('../utils/stateCodeMap');

const addressSchema = new mongoose.Schema({
  address: String,
  state: String,
  stateCode: String,
  pincode: String
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  sameAsBilling: { type: Boolean, default: true },
  receiverName: String,
  company: String,
  address: String,
  state: String,
  pincode: String,
  phone: String
}, { _id: false });

const clientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  clientName: { type: String, required: true },
  companyName: { type: String },
  gstNumber: { type: String },
  email: { type: String },
  phone: { type: String },
  billingAddress: addressSchema,
  shippingAddress: shippingAddressSchema
}, { timestamps: true });

clientSchema.pre('save', function (next) {
  if (this.billingAddress && this.billingAddress.state) {
    this.billingAddress.stateCode = getStateCode(this.billingAddress.state) || this.billingAddress.stateCode;
  }
  next();
});

clientSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update && update.billingAddress && update.billingAddress.state) {
    if (update.$set) {
      if (!update.$set.billingAddress) update.$set.billingAddress = {};
      update.$set.billingAddress.stateCode = getStateCode(update.billingAddress.state) || update.$set.billingAddress.stateCode;
    } else {
      update.billingAddress.stateCode = getStateCode(update.billingAddress.state) || update.billingAddress.stateCode;
    }
  }
  next();
});

module.exports = mongoose.model('Client', clientSchema);
