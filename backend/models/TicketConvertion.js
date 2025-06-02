const mongoose = require("mongoose");

const ticketConvertionSchema = new mongoose.Schema({
      TicketQuantity : {
        type: Number,
        default:0
      },
   Status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "INACTIVE",  // keep inactive by default until enabled
  },
  AmountInToken: {
    type:Number,
    default:0
  },
  DefaultAdminWallet:{
    type:String,
    default:""
  },
  
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtual: true },
    toObject: { virtual: true },
});


module.exports = mongoose.model("TicketConvertion",ticketConvertionSchema);