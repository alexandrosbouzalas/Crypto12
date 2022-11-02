const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  uId: {
    type: Number,
    required: true,
  },
  oId: {
    type: Number,
    required: true,
    unique: true,
  },
  cId: {
    // Coin ID
    required: true,
    type: String,
  },
  cAmount: {
    required: true,
    type: Number,
  },
  oCurrency: {
    required: true,
    type: String,
  },
  placedAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Order", orderSchema);
