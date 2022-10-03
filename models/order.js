const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  uId: {
    type: String,
    required: true,
  },
  oId: {
    type: String,
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
    type: String,
  },
  oDate: {
    required: true,
    type: Date,
  }
});

module.exports = mongoose.model("Order", orderSchema);
