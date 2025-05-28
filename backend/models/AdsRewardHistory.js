const mongoose = require("mongoose");

const AdsRewardHistorySchema = new mongoose.Schema(
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        index: true,
      },
      AdId:{
        type: mongoose.Schema.Types.ObjectId,
        index: true,
      },
      NextAd_Time:{
        type: Date
        
      },
      Rewardpoints: {
        type: Number,
        default: 0,
      },
      InitialBalance:{
        type:Number, default:null
      },
      FinalBalance:{
        type:Number, default:null
      }
    },
    {
      timestamps: true,
      toJSON: { virtual: true },
      toObject: { virtual: true },
    }
  );


  const AdsrewardHistory = mongoose.model(
    "Ads_Reward History",
    AdsRewardHistorySchema
  );
  module.exports = AdsrewardHistory;
  