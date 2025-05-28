const mongoose = require("mongoose");

const RewardSettingSchema = new mongoose.Schema({
    points: { type: Number, required: true },
    status: {
        type: String,
        enum: ["active", "inactive"], // Only allows "active" or "inactive"
        default: "active", // New rewards default to inactive unless set otherwise
    },
});

module.exports = mongoose.model("RewardSetting", RewardSettingSchema);