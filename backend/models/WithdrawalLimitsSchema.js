const mongoose = require("mongoose");

const withdrawalLimitsSchema =  mongoose.Schema({
     minWithdrawal: {
            type: Number,
            required: false,
            default: 10,
        },
        maxWithdrawal: {
            type: Number,
            required: false,
            default: 500,
        },
})

module.exports=mongoose.model("WithdrawLimits",withdrawalLimitsSchema);