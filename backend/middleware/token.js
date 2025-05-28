const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema"); 

const STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const ERROR_MESSAGE = {
  FORBIDDEN: "You do not have permission to access this resource.",   //403
  UNAUTHORIZED: "Invalid or expired token.",
  NOT_FOUND: "User not found.",
  INTERNAL_SERVER_ERROR: "Something went wrong. Please try again later.",
};

// Middleware to validate the JWT token
const util = require("util");
const verifyToken = util.promisify(jwt.verify);

const validateToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(STATUS_CODE.FORBIDDEN).json({ error: ERROR_MESSAGE.FORBIDDEN });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = await verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("decoded log in validtoken",decoded)
  } catch (err) {
            console.log(`➡️ Incoming request: ${req.method} ${req.originalUrl}`);
    return res.status(STATUS_CODE.UNAUTHORIZED).json({ error: "Invalid Token" });
  }

  const user = await User.findById(decoded.user?.id);
  if (!user) return res.status(STATUS_CODE.NOT_FOUND).json({ error: ERROR_MESSAGE.NOT_FOUND });

  req.user = user;
  next();
});

// Middleware to check if user is an Admin
const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.loginType === "Admin") {
      next();
    } else {
        console.log(`➡️ Incoming request: ${req.method} ${req.originalUrl}`);
      const error = new Error(ERROR_MESSAGE.FORBIDDEN);
      error.statusCode = STATUS_CODE.FORBIDDEN;
      throw error;
    }
  } catch (err) {
    const statusCode = err.statusCode || STATUS_CODE.INTERNAL_SERVER_ERROR;
    const errorMessage = err.message || ERROR_MESSAGE.INTERNAL_SERVER_ERROR;
    res.status(statusCode).json({ error: errorMessage });
  }
});


const isuser = asyncHandler(async (req, res, next) => {
  try {
    console.log("Decoded User from req.user:", req.user);
    console.log("Route param _id:", req.params._id);

    if (req.user.loginType !== "user") {
        console.log(`➡️ Incoming request: ${req.method} ${req.originalUrl}`);
      const error = new Error(ERROR_MESSAGE.FORBIDDEN);
      error.statusCode = STATUS_CODE.FORBIDDEN;
      throw error;
    }

    // Extract MongoDB ObjectId from JWT payload
    const userId = req.user.id || (req.user._id && req.user._id.toString());
    const paramId = req.params._id;

    if (paramId === userId) {
      next();
    } else {
        console.log(`➡️ Incoming request: ${req.method} ${req.originalUrl}`);
      const error = new Error(ERROR_MESSAGE.FORBIDDEN);
      error.statusCode = STATUS_CODE.FORBIDDEN;
      throw error;
    }
  } catch (err) {
      console.log(`➡️ Incoming request: ${req.method} ${req.originalUrl}`);
    const statusCode = err.statusCode || STATUS_CODE.INTERNAL_SERVER_ERROR;
    const errorMessage = err.message || ERROR_MESSAGE.INTERNAL_SERVER_ERROR;
    res.status(statusCode).json({ error: errorMessage });
  }
});



module.exports = { validateToken, isAdmin, isuser };