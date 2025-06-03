const mongoose = require("mongoose");
const TicketConvertion = require("./TicketConvertion");

const withdrawalLimitsSchema = mongoose.Schema({
  minWithdrawal: {
    type: Number,
    required: false,
    // default: 10,
  },
  maxWithdrawal: {
    type: Number,
    required: false,
    // default: 500,
  },
  Fee_wallet: {
    type: String,
  },
  Token_Mint: {
    type: String,
  }
  ,
  Withdraw_Note: {
    type: String,
  },
  Percentage_Charge: {
    type: Number,
  },
  Fixed_Charge: {
    type: Number,
  },
  Symbol: {
    type: String,
    required: true
  },
  Fee_wallet: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "DELETE"],
    default: TicketConvertion.ACTIVE,
  },
},
{ timestamps: true });

module.exports = mongoose.model("WithdrawLimits", withdrawalLimitsSchema);
