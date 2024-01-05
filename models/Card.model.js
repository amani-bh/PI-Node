const mongoose = require('mongoose');
const location = require ('./Location.model')
var schema = new mongoose.Schema({
    total : Number,
    is_deleted:Boolean,
    date : Date,
    //products : [{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}],
    products:[
    {
    name : String,
    description : String,
    category:String,
    price:Number,
    picture:[String],
    paid:{
        type:Boolean,
        default:false
    },
    auction_product:Boolean,
    sold:Boolean,
    like:Number,
    location:location,
    exchange:Boolean,
    is_deleted:Boolean,
    shipped:Boolean,
    seller:{type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}],

    client:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
})

module.exports = mongoose.model('Card', schema);;