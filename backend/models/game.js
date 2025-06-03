// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const gameControllerSchema = new Schema(
//   {
//     gameTitle: { type: String },
//     gameDetails: { type: String },
//     gamePic: { type: String },
//     category: { type: String },
//     levelPrice: { type: Number, default: 1.5 },
//     level: [{
//       level: { type: Number, required: true }, // The level number (1, 2, 3, etc.)
//       roadspeed: { type: Number, required: true }, // Number of potholes in the level
//       enemyspeed: { type: Number, required: true }, // Number of cars in the level
//       obstaclespawnrate: { type: Number, required: true }, // Speed of the car
//       coinvalue: { type: Number, required: true }, // Value of coins
//       potholerate: { type: Number, required: true }, // Pothole rate
//       coinseriescount: { type: Number, required: true }, // Number of coin series
//       coinseriesspacing: { type: Number, required: true }, // Spacing between coin series
//       coinseriesdistance: { type: Number, required: true }, // Distance between coin series
//       lastpotholedistance: { type: Number, required: true }, // Distance before last pothole
//       leveldistance: { type: Number, required: true }, // Distance to level completion
//       playerspeed: { type: Number, required: true } // Player's speed
//     }],
//     additionalParams: {
//       type: Map,
//       of: String,
//       default: {},
//     },
//     rules: { type: Array },
//     withdrawalRules: { type: Array },
//     disclaimer: { type: String },
//     latest: { type: Boolean, default: false },
//     min: { type: Number, default: 10 },
//     max: { type: Number, default: 30 },
//     status: { type: String }
//   },
//   { timestamps: true },
// );

// module.exports = mongoose.model('GameController', gameControllerSchema);