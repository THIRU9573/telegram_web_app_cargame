const mongoose = require("mongoose");

const CompletedAdsSchema = new mongoose.Schema({
    AdName: { type: String, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
   // AdSDK: { type: String, default: null },
    AdImage: { type: String, default: null },
    Rewardpoints: { type: Number, default: 0 },
    AdCount: {
        type: Number,
        default: 0,
    },
    AdTimer_InMinutes: {
        type: Number,
        default: 0,
    },
    AddedBy: {
        type: mongoose.Types.ObjectId,
        ref: "user" // Reference to the user who added the ad
    },
    Status: {
        type: String,
        enum: ["Completed"],
    },
    username: {
        type: String,
        default: null
    },
    // CompletedBy is added to track who completed the ad
    CompletedBy: {
        type: mongoose.Types.ObjectId,
        ref: "user", // Reference to the user who completed the ad
        default: null
    },
    // CompletedAt is added to track when the ad was completed
    CompletedAt: {
        type: Date,
        default: null
    },
    InitialBalance: {
        type: Number, default: 0
    },
    FinalBalance: {
        type: Number, default: 0
    },
  CompletionTime: { type: Date, default: Date.now },
  AdId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdsData', required: true },  // Ensure this is a reference

},
    {
        timestamps: true, // Automatically includes createdAt and updatedAt
        toJSON: { virtual: true },
        toObject: { virtual: true },
    });

module.exports = mongoose.model("CompleteAdData", CompletedAdsSchema);
