const mongoose = require("mongoose");

const CompletedTaskSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    username: { type: String, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // userId: { type: String, required: true },

    TaskName: { type: String, required: true },
    Rewardpoints: { type: Number, required: true },
    Status: { type: String, default: "completed" },
    CompletionTime: { type: Date, default: Date.now },
    InitialBalance: {
        type: Number, default: null
    },
    FinalBalance: {
        type: Number, default: null
    }
});

module.exports = mongoose.model("CompletedTask", CompletedTaskSchema);