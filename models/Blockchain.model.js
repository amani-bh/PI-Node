const mongoose = require("mongoose");
const crypto = require("crypto");

var schema = new mongoose.Schema({
  timestamp: {
    required: true,
    type: Number,
    required: false,
  },
  previousHash: {
    required: true,
    type: String,
  },

  transaction: {
    fromAddress: {
      type: String,
      required: false,
    },
    toAddress: {
      type: String,
      required: false,
    },
    amount: {
      type: Number,
      required: false,
    },
    timestamp: {
      type: Number,
      required: false,
    },
    signature: {
      required: false,
      type: String,
    },
  },
  hash: {
    required: true,
    type: String,
  },
  nonce: {
    required: true,
    type: Number,
  },
});

module.exports = mongoose.model("Blockchain", schema);
