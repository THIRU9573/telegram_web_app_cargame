const mongoose = require("mongoose");


var transactionSchema = new Schema(
    {
      userId: {
        type: mongoose.Types.ObjectId,
        ref: "user",
      },
      walletAddress: {
        type: String,
      },
      hash: {
        type: String,
      },
      token: {
        type: String,
      },
      ticketId: {
        type: String,
      },
      amount: {
        type: Number,
      },
      quantity: {
        type: Number,
      },
      Token_Amount: {
        type: Number,
      },
      Symbol: {
        type: String,
      },
      charge: {
        type: Number,
      },
      AfterCharge: {
        type: Number,
      },
      Fee_tokens: {
        type: Number,
      },
      updatedDate: {
        type: Date,
      },
      
      reason: {
        type: String,
      },
      status: {
        type: String,
        enum :["PENDING","REJECT","APPROVE","TRANSFERRED"],
        default: ticketStatus.PENDING,
      },
      transactionType: {
        type: String,
        enum: ["BUY", "DEPOSIT", "WITHDRAW"],
      },
    },
    { timestamps: true }
  );

  module.exports = mongoose.model("transaction", transactionSchema);
