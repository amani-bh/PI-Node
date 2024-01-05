const mongoose = require("mongoose");
const location = require("./Location.model");

const exchangeSchema = new mongoose.Schema({
  userReciever: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userSender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  productReciever: {
    _id: String,
    name: String,
    description: String,
    category: String,
    price: Number,
    picture: [String],
    paid: {
      type: Boolean,
      default: false,
    },
    auction_product: Boolean,
    sold: Boolean,
    like: Number,
    location: location,
    exchange: Boolean,
    is_deleted: Boolean,
    shipped: Boolean,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  productSender: {
    _id: String,
    name: String,
    description: String,
    category: String,
    price: Number,
    picture: [String],
    paid: {
      type: Boolean,
      default: false,
    },
    auction_product: Boolean,
    sold: Boolean,
    like: Number,
    location: location,
    exchange: Boolean,
    is_deleted: Boolean,
    shipped: Boolean,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },

  date: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
  },

  confirm: {
    value: {
      type: Boolean,
      default: null,
    },
    confirmAt: {
      type: Date,
      default: null,
    },
  },
  status: {
    type: String,
    enum: ["ACTIVE", "DELETED", "DELIVRED","DECLINED","CONFIRMED"],
    default: "ACTIVE",
  },
});

module.exports = mongoose.model("Exchange", exchangeSchema);
