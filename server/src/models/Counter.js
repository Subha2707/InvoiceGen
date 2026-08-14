const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true },
  sequence: { type: Number, default: 0 }
});

counterSchema.index({ user: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Counter', counterSchema);
