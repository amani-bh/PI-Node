const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: false,
  },
  audio: {
    type: String,
    required: false,
  },

  sendedAt: {
    type: Date,
    default: Date.now,
  },
  attachement: {
    type: String,
  },
  like: {
    type: Boolean,
    default: false,
  },
  removed: {
    type: Boolean,
    default: false,
  },
  seen: {
    value: {
      type: Boolean,
      default: false,
    },
    seenAt: {
      type: Date,
      default: null,
    },
  },
});
//crypter message content
messageSchema.pre("save", async function (next) {});
module.exports = mongoose.model("Message", messageSchema);
