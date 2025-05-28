const mongoose = require("mongoose");


const options = {
    collection: "contactus",
    timestamps: true
};

const contactUsschema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        message: { type: String },
        firstName: { type: String },
        email: { type: String },
        status: { type: String, default: status.ACTIVE },
        reply:{type:Boolean,default:false},
        replyMsg:{type:String,},
        lastName: { type: String },
    },
    options
);

module.exports = mongoose.model("contactus", contactUsschema);
