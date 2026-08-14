const mongoose = require('mongoose');
const { getStateCode } = require('../utils/stateCodeMap');

const fileSchema = new mongoose.Schema({
  data: String,
  contentType: String,
  fileName: String
}, { _id: false });

const businessProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, required: true },
  ownerName: { type: String },
  gstNumber: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  state: { type: String },
  stateCode: { type: String },
  pincode: { type: String },
  logo: fileSchema,
  signature: fileSchema,
  defaultTemplate: { type: String, default: 'classic' },
  defaultCurrency: { type: String, default: 'INR' }
}, { timestamps: true });

businessProfileSchema.pre('save', function (next) {
  if (this.state) {
    this.stateCode = getStateCode(this.state) || this.stateCode;
  }
  next();
});

businessProfileSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update && update.state) {
    if (update.$set) {
      update.$set.stateCode = getStateCode(update.state) || update.$set.stateCode;
    } else {
      update.stateCode = getStateCode(update.state) || update.stateCode;
    }
  }
  next();
});

module.exports = mongoose.model('BusinessProfile', businessProfileSchema);
