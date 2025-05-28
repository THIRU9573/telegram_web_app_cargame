const mongoose = require('mongoose')


const boosterSchema = new mongoose.Schema({
  BoosterId: { type: mongoose.Types.ObjectId },

  BoosterName: { type: String, required: true },

  BoosterImage: { type: String, required: true },

  Price: { type: Number, required: true },

  Description: { type: String, required: true },

  BoosterDuration: { type: Number, required: true },

  RewardMultiplier: { type: Number, required: true },

  BoosterStatus: { type: String, enum: ["active", "inactive", "pending", "completed",], default: "active" },
  ///////
  Booster_Multiplier: {
    type: Number
  },
  Timer_InMinutes: {
    type: Number,
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model("Booster", boosterSchema);