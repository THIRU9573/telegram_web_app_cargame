
// const mongoose =require('mongoose')


// const boostertransactionSchema = new mongoose.Schema({
//     TransactionId : {type:mongoose.Types.ObjectId},

//     BoosterName : {type : String, required : false},

//     Amount : {type : Number , required : false}, 

//     Charge: {
//         type: Number,
       
//     },
//     TransactionHash: {
//         type: String,
//     },

//     userId : {type : String , required : false},

//     BoosterId : {type : String , required : false},

//     BoosterStart: { 
//         type: Date, 
//         required: false, 
//     },

//     BoosterEnd: { 
//         type: Date, 
//         required: false,     
//     },

//     Status  : { type: String, enum: ["active", "pending", "completed", ], default: "pending" },
//     // Status  : { type: String, enum: ["active", "pending", "completed", ] },


// },{timestamps: true})

// module.exports = mongoose.model("BoosterTransaction",boostertransactionSchema)



const mongoose = require('mongoose');

// Define the schema for BoosterTransaction
const boostertransactionSchema = new mongoose.Schema(
  {
    TransactionId: {
      type: mongoose.Types.ObjectId, // Ensure it's an ObjectId
      required: true, // It would be better to make TransactionId required
      auto: true, // Optional: This automatically generates an ID if not provided
    },

    BoosterName: {
      type: String,
      required: true, // Set to true if this field must be provided
    },

    Amount: {
      type: Number,
      required: true, // Assuming this is required for each transaction
    },

    Charge: {
      type: Number,
      //required: false, // Optional charge, if applicable
    },

    TransactionHash: {
      type: String,
      //required: true, // Transaction hash should probably be required for traceability
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the User model
      ref: 'User', // Adjust this if your User model has a different name
      required: true, // Assuming this is required for each transaction
    },

    BoosterId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Booster model
      ref: 'Booster', // Assuming this references your existing Booster model
      required: true, // Assuming this is required for each transaction
    },

    BoosterStart: {
      type: Date,
      required: false, // Optional: Time when the booster started
    },

    BoosterEnd: {
      type: Date,
      required: false, // Optional: Time when the booster ended
    },

    Status: {
      type: String,
      enum: ['active', 'pending', 'completed'],
      default: 'pending', // Default status to "pending" if not specified
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BoosterTransaction', boostertransactionSchema);
