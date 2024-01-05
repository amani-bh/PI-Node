const mong = require("mongoose");
const route = mong.Schema({
  ref: String,
  message: String,
  date: Date,
  lu: {
    type: Boolean,
    default: false,
  },
  id_LIV:{type: mong.Schema.Types.ObjectId, ref: 'user'}
});

module.exports = mong.model("notifDelivery", route);
