const express = require('express')
const dotenv = require('dotenv')
const connectToDb = require('./config/db')
const router = require('./routes/authRoutes')
const bot = require("./teleBot/bot");
const cors = require("cors");

const app = express()
dotenv.config()
app.use(cors());

connectToDb()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", router);

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server running successfully on ${process.env.PORT}`);
});

 