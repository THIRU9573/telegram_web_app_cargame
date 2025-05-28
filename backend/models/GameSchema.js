const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the level schema separately
const levelSchema = new Schema({
  level: { type: String, required: true },
  roadspeed: { type: String, required: true },
  enemyspeed: { type: String, required: true },
  obstaclespawnrate: { type: String, required: true },
  coinvalue: { type: String, required: true },
  potholerate: { type: String, required: true },
  coinseriescount: { type: String, required: true },
  coinseriesspacing: { type: String, required: true },
  coinseriesdistance: { type: String, required: true },
  lastpotholedistance: { type: String, required: true },
  leveldistance: { type: String, required: true },
  adwatchesleft: { type: Number, required: true },
    lives: { type: Number, required: false },

  // playerspeed: { type: String, required: true },
});


//Ads SDK's
const adsdkSchema = new Schema({
  adSDK :{
    type : String,
    required : true
  }
})

// Define the main game schema
const gameControllerSchema = new Schema(
  {
    gameTitle: { type: String },
    gameDetails: { type: String },
    gamePic: { type: String },
    category: { type: String },
    levelPrice: { type: Number, default: 1.5 },
    level: { type: [levelSchema], default: [] }, // Reference to the level schema
    adwatchesleft: { type: Number, required: true },
    adSDK : {type : [adsdkSchema], default:[]},
    lives: { type: Number, required: false },
    additionalParams: {
      type: Map,
      of: String,
      default: {},
    },
    rules: { type: Array },
    withdrawalRules: { type: Array },
    disclaimer: { type: String },
    latest: { type: Boolean, default: false },
    min: { type: Number, default: 10 },
    max: { type: Number, default: 30 },
    status: { type: String },
  },
  { timestamps: true }
);

// Create and export the game model
module.exports = mongoose.model("GameController", gameControllerSchema);
