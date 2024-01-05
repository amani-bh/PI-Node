const mongoose = require("mongoose");
const Location = require("./Location.model");

const userSchema = new mongoose.Schema({
  firstname: String,
  //Add by ZEIDI:
  trackBot: {
    type: Boolean,
    default: false,
  },
  lastname: String,
  picture: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["SUPER_ADMIN", "ADMIN", "CLIENT", "SUBSCRIBER", "DELIVERY_MAN"],
    default: "CLIENT",
  },
  badge: {
    type: String,
    enum: ["DIAMOND", "GOLD", "SILVER"],
    default: "SILVER",
  },
  status: {
    type: String,
    enum: ["VERIFIED", "DESACTIVATED", "NOT_VERFIED"],
    default: "NOT_VERFIED",
  },
  phone_number: Number,
  address: {
    type: String,
  },
  location: Location,
  solde: {
    type: Number,
    default: 0,
  },
  reset_token: { type: String, default: "" },
  verify_token: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  activeProducts_count: {
    type: Number,
    default: 0,
  },
  productsSold_count: {
    type: Number,
    default: 0,
  },
  lastActivity: {
    type: Date,
    default: null,
  },
  followings: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  followers: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  picture: [String],
  // add by zeidi
  hazard: { type: Boolean, default: false },
  // add by zeidi

  dateHazard: { type: Date },

  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  privateKey: {
    type: String,
    required: true,
  },
  publicKey: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("User", userSchema);
