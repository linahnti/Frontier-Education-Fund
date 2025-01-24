const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  transactionId: { type: String, unique: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Donation', donationSchema);
