const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        // taskId: {
        //     type: String,
        //     required: false
        // },
        TaskName: {
            type: String,
            required: true,
        },
        Status: { type: String, enum: ["active", "inactive", "pending", "completed", "Disabled"], default: "active" },
        Rewardpoints: {
            type: Number,
            default: 0,
        },
        // InitialBalance: { type: Number, default: null },
        // FinalBalance: { type: Number, default: null },
        Subtask: { type: String, default: null },
        Description: { type: String, default: null },
        Sitelink: { type: String, default: null },
        TaskImage: { type: String, default: null },
        Siteimg: { type: String, default: null },
    }, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtual: true },
    toObject: { virtual: true },
}
);

module.exports = mongoose.model("Task", taskSchema);
