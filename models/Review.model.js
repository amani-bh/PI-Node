const mongoose = require('mongoose');
var schema = new mongoose.Schema({
    review : String,
    date : Date,
    is_deleted:Boolean,
    client:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    product:{type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
})

module.exports = mongoose.model('Review', schema);;