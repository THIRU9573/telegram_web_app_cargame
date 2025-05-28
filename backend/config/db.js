const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

const connectToDb = async () => {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error("MongoDB URI is missing in .env file");
        }

        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("Database connected successfully");
    } catch (error) {
        console.error(" Database connection failed:", error);
    }
};

// ✅ Handle connection events for debugging
// mongoose.connection.on("connected", () => console.log(" MongoDB connected"));
mongoose.connection.on("error", (err) => console.error(" MongoDB error:", err));
mongoose.connection.on("disconnected", () => {
    console.log(" MongoDB disconnected. Retrying in 5 seconds...");
    setTimeout(connectToDb, 5000);
});

module.exports = connectToDb;
