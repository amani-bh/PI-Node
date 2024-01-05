const mongoose = require("mongoose");

var schema = new mongoose.Schema({
    title : String,
    dateStart : Date,
    dateEnd:Date,
    description:String,
    costOfParticipation:Number,
    category: {
        type: String,
        enum: ["AUCTION", "DONATION"],
        default: "AUCTION"
      },
      status:{
        type: String,
        enum: ["START", "IN_PROGRESS,FINISH"],
        default: "START"
      },
      is_activated:{
        type:Boolean,
        default:true
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
    startPrice:Number,
    finalPrice:Number,
    product:{type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
    bids:[{
        user:{
            type:mongoose.Schema.Types.ObjectId,ref:'User',
        },
        date: {
            type: Date,
            default: Date.now,
          },
        value:{
          type:Number,
          default:0
        }
        }

    ],
    numberOfParticipants:Number,
    listOfParticipants:[{ type: mongoose.Types.ObjectId, ref: 'User' }],
})



module.exports =  mongoose.model('Event', schema);;