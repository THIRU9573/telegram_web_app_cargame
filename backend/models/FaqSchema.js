const mongoose = require("mongoose");

const options = {
    collection: "faq",
    timestamps: true
};

const faqSchema = new Schema(
    {
        question: { type: String },
        answer: { type: String },
        image: { type: String },
        url: { type: String },
        screenName: { type: String },
        status: { type: String, default: status.ACTIVE }
    },
    options
);

module.exports = Mongoose.model("faq", faqSchema);
