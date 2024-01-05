const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  first: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  second: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  lastActivity: {
    type: Date,
  },

 
});

module.exports = mongoose.model("Chat", chatSchema);
