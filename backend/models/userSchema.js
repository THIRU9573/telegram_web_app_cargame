const express = require("express");
const mongoose = require('mongoose');
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const { type } = require("os");


const userSchema = mongoose.Schema({
    username: {
        type: String,
        // required : true,
    },
    chatId: { type: Number, unique: true, sparse: true },
    
    profilepic: {
        type: String,
        required: false
    },
    // userpoints: {
    //     type: Number,
    //     default: 0
    //     // required : true
    // },
    ticketBalance: {
        type: Number,
        default: 0,
    },
    referalId : {
        type : String,
        default : ""
    },
    email: {
        type: String,
       // required : [ true," Email is must be provided"],
        trim: true,
        //unique : [true,"Email must be unique"],
        minLength: [5, "Email must have 5 characters"],
        lowercase: true,
        sparse: true,  // This fixes the null duplicate issue
    },
    password: {
        type: String,
        // required : [true,"Password is must be provided"],
        trim: true,
        select: false,
    },
    loginType: { type: String, enum: ["Admin", "SubAdmin", "user"], required: false },

  referrals: { type: [mongoose.Schema.Types.ObjectId], ref: 'Referral' }, // Array of Referral objects
    referralLink: { type: String, unique: true, sparse: true }, // THIS IS IMPORTANT

    DailyReward: {
        type: Date,  // This will track the date when the user last claimed the daily reward
        default: null,
    },

    otp: { type: String, default: "" },
    otpExpires: { type: Date },

    totalGames: { type: Number, default: 0 },    // Track total coin tosses played

    firstName: {
        type: String
    },
    lastName: {
        type: String
    }, 
    withdrawOtp: {
        type: String,
    },
    emailotp2FA: {
        type: Number,
    },
    otpVerified: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ["Active", "Block", "Delete"], default: "Active"
    },
    bannerPic: {
        type: String,
    },
    wallet: {
        type: String,
        default: "",
    },
    // private_key: {
    //     type: String,
    // },
    bio: {
        type: String,
    },
    // socialId: {
    //     type: String,
    // },
    // socialType: {
    //     type: String,
    // },
    // lockedBalance: {
    //     type: Number,
    //     default: 0,
    // },
    // lockedAmount: {
    //     type: Number,
    //     default: 0,
    // },
    // secretGoogle: {
    //     type: String,
    // },
    // base64: {
    //     type: String,
    // },
    referralCode: { type: Number },

    referrerId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    adsRewardEndtime: {
        type: Date,
        timestamps: true,
    },
    adsRewardEndtime2: {
        type: Date,
        timestamps: true,
    },
    //google2FA: { type: Boolean, default: false },
    //email2FA: { type: Boolean, default: false },
    //permissions: [],
    changeUserName: { type: Boolean, default: true },
    changeFirstName: { type: Boolean, default: true },
    changeLastName: { type: Boolean, default: true },
    // gameSound: {
    //     type: Boolean,
    //     default: true,
    // },

    // gameMusic: {
    //     type: Boolean,
    //     default: true,
    // },
    Stats: {
    type: [String],
    enum: ["WON", "LOSE", "QUIT", "PENDING", "COMPLETED"],
    default: [],
  },
}, {
    timestamps: true
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    next(); // Password is already hashed in signup, don't hash again!
});

userSchema.methods.generateOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    this.otp = otp;
    this.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    return otp;
};

module.exports = mongoose.model("User", userSchema);
