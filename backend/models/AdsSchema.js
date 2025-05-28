const mongoose = require("mongoose");

const AdsSchema = new mongoose.Schema({
    AdName: { type: String, default: null },
    AdSDK: { type: String, default: null },
    AdImage: { type: String, default: null },
    Rewardpoints: { type: Number, default: 0 },
    AdCount: {
        type: Number,
        default: 0,
    },
    AdTimer_InMinutes: {
        type: Number,
        default: 60,
    },
    AddedBy: {
        type: mongoose.Types.ObjectId,
        ref: "user"
    },
    Status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE", "DELETE"],
        //default: taskStatus.ACTIVE
    },
    claimedAt: { type: Date, default: null },  // Added to track when the ad was claimed

},
    {
        timestamps: true,
        toJSON: { virtual: true },
        toObject: { virtual: true },
    });

const AdsData = mongoose.model("Ads_Data", AdsSchema);
module.exports = AdsData;