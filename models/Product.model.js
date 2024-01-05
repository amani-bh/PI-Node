const mongoose = require('mongoose');
const location = require ('./Location.model')
var schema = new mongoose.Schema({
    name : String,
    description : String,
    category:String,
    price:Number,
    picture:[String],
    auction_product:Boolean,
    sold:Boolean,
    like:Number,
    location:location,
    exchange:Boolean,
    is_deleted:Boolean,
    shipped:Boolean,
    createdAt: {
        type: Date,
        default: Date.now
    },
    seller:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    client:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    happy:Number,
    sad:Number,
    amazon_price:String,
    amazon_name:String,
    amazon_picture:String

})


module.exports = mongoose.model('Product', schema);