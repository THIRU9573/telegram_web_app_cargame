const mongoose = require("mongoose");


const DailyRewardSchema = new mongoose.Schema(
    {
        rewardpoints: {
            type: Number,
            default: 0,
        },
        Addedby: {
            type: mongoose.Types.ObjectId,
            ref: "user",
        },

        Status: {
            type: String,
            default: "ACTIVE",
        },
    },
    {
        timestamps: true,
        toJSON: { virtual: true },
        toObject: { virtual: true },
    })

const DailyRewardplan = mongoose.model("daily_reward", DailyRewardSchema);
module.exports = DailyRewardplan;