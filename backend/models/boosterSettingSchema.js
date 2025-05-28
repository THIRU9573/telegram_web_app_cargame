const mongoose =require('mongoose')


const boosterSettingSchema = new mongoose.Schema({
    BoostersettingId : { type : mongoose.Types.ObjectId},

    BoosterWalletAddress : {type : String, required : true},

    BoosterContent : {type : String , required : true}, 

    BoosterNote1 : {type : String , required : true},

    BoosterNote2 :  {type : String , required : true},

    Status  : { type: String, enum: ["active", "inactive","pending", "completed", ], default: "active" },


})

module.exports = mongoose.model("BoosterSetting",boosterSettingSchema)