const mongoose = require("mongoose");

const withdrawalSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
        hash: {
      type: String,
    },
    username: {
      type: String,
      default: null,
    },
    walletAddress: {
      type: String,
    },
    token: {
      type: String,
      enum: ["SOL", "TON"], // Status of the withdrawal
      default: "TON",
    },
    amount: {
      type: Number,
      required: [true, "Withdrawal amount is required"],
      // min: [10, "Withdrawal amount must be at least 10"],
    },
    USDT_Amount: {
      type: Number,
      required: [true, "Withdrawal amount is required"],
    },
    charge: {
      type: Number,
      required: true,
    },
    After_Charge: {
      type: Number,
      required: true,
    },
    //     transactionType: {
    //   type: String,
    //   enum: ["BUY", "DEPOSIT", "WITHDRAW"],
    // },
    Fee_tokens: {
      type: Number,
    },
  Token_Amount: {
      type: Number,
    },
       symbol: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected",'transferred'], // Status of the withdrawal
      default: "pending",
    },
    rejectionReason: { type: String, required: false },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);
module.exports = mongoose.model("Withdraw", withdrawalSchema);
