const mongoose = require("mongoose");

const ClaimHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, default: null },
  rewardPoints: { type: Number, required: true },
  claimedAt: { type: Date, default: Date.now },
  initialBalance: {
    type: Number, default: null
  },
  finalBalance: {
    type: Number, default: null
  },

  Status: {
    type: String
  },
  initialBalance: {
    type: Number, default: null
  },
  finalBalance: {
    type: Number, default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model("ClaimHistory", ClaimHistorySchema);