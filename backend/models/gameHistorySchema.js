// models/GameHistory.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const gameHistorySchema = new Schema(
  {
   userId: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    username: {
      type: String,
      required: false
    },
    gameTitle: {
      type: String,
      required:false
    },
    gameId: {
      type: mongoose.Types.ObjectId,  // Corrected to ObjectId type
      ref: "GameController",  // Refers to the GameController model
    },
    gameCode: {
      type: Number,
    },
    level: {
      type: Number,
      default: 1,
    },
    prize: {
      type: Number,
      default: 0,
    },
    betAmount: {
      type: Number,
    },
    time: {
      type: Number,
    },
    highestScore: {
      type: Number,
      default: 0,
    },
    playedStatus: {
      type: String,
      enum: ["WON", "LOSE", "QUIT", "PENDING", "COMPLETED"],
    },
    initialbalance: {
      type: Number,
      default: null
    },
    finalbalance: {
      type: Number,
      default: null
    },
    winAmount : {
      type: Number,
      default: 0
    },
    status: { type: String, default: "Active"},
  },
  { timestamps: true }
);

gameHistorySchema.post('save', async function (doc) {
    const finalStatuses = ["WON", "LOSE"];  // only these two count

  if (doc.playedStatus && finalStatuses.includes(doc.playedStatus)&& doc.userId) {
    try {
      await mongoose.model('User').findByIdAndUpdate(
        doc.userId,
        { $push: { Stats: doc.playedStatus } }
      );
    } catch (error) {
      console.error("Error updating User Stats in post-save hook:", error);
    }
  }
});


module.exports = mongoose.model("gameHistory", gameHistorySchema);