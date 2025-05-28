const mongoose = require("mongoose");

var WithdrawSettingSchema = new Schema(
    {
      
      Fee_wallet: {
        type: String,
      },
      Token_Mint:{
        type: String,
      },
      Min_Withdraw: {
        type: Number,
      },
      Max_Withdraw: {
        type: Number,
      },
      Withdraw_Note:{
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
      },
      status: {
          type: String,
          enum: ["ACTIVE", "INACTIVE", "DELETE"],
          default: ticketStatus.ACTIVE,
      },
    },
    { timestamps: true }
  );
  

  module.exports = mongoose.model("WithdrawSetting", WithdrawSettingSchema);
