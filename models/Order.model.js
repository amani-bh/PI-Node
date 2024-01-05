//declaration : 
const mongoose = require ('mongoose')
const location = require ('./Location.model')
//Schema :
const Route = mongoose.Schema({
   date:Date,
   description:String,
   shippedDate:Date,
   telephone:String,
   firstName:String,
   article:Number,
   items:{type: mongoose.Schema.Types.ObjectId, ref: 'cards'},
   locationClient:location,
   status:String,
   delID:{type: mongoose.Schema.Types.ObjectId, ref: 'user'},
   clientID:{type: mongoose.Schema.Types.ObjectId, ref: 'user'},
   activation : {
      type:Boolean,
      default:false,
   },
   cost:Number ,
   load:{
      type:Number,
      default:1
   },
   loadTracker:{
      type:Number,
      default:0
   },
   products:[]
})

//exporting :

module.exports = mongoose.model('order',Route)