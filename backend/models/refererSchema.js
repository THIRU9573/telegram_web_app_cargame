const mongoose = require("mongoose");

const ReferralSchema = new mongoose.Schema(
  {
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referringUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referralamount:{
      type:Number
    },
    InitialBalance:{
      type:Number, default:null
    },
    FinalBalance:{
      type:Number, default:null
    },
    initiated: {
      type: Date, default: null
    }
  },
  { timestamps: true }
);

// Ensure indexes for quick lookup
ReferralSchema.index({ referredUser: 1, referringUser: 1 }, { unique: true });

module.exports = mongoose.model("Referral", ReferralSchema);