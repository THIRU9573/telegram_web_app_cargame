const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
// const dotenv = require("dotenv")
const User = require("../../models/userSchema");
const Referral = require("../../models/refererSchema");
const jwt = require("jsonwebtoken");
const Withdraw = require("../../models/withdrawlSchema")
const RewardSetting = require("../../models/rewardSettingSchema"); // Ensure the correct path
const { faker } = require('@faker-js/faker');
const ClaimHistory = require("../../models/claimHistorySchema")
const BoosterTransaction = require("../../models/boostertransactionSchema")
const AdsData = require("../../models/AdsSchema");
const CompleteAdData = require('../../models/CompleteAdSchema');
const ReferralSetting = require('../../models/refferalSettingSchema')



async function getActiveReferralAmount() {
    const setting = await ReferralSetting.findOne({ Status: "active" }).sort({ updatedAt: -1 });
    console.log(setting, "setting");

    if (!setting) throw new Error("No active referral setting found");
    return setting.referralAmount;
}

const getDisplayName = (user) => {
    if (!user) return "Unknown";
    return user.username || `User_${user._id.toString().slice(-4)}`;
};

// const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key"; // make sure to use env var for prod

const login = async (req, res) => {
  const { chatId, username, profilepic, referalId } = req.body;

  if (!chatId) {
    return res.status(400).json({ message: "Please provide chatId" });
  }

  try {
    const generateToken = (user) => {
      return jwt.sign(
        { user: { id: user._id } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "24h" }
      );
    };

    let user = await User.findOne({ chatId });
    let isNewUser = false;

    if (!user) {
      // Handle referral user if refererId is provided
      let refererUser = null;
      if (referalId) {
        refererUser = await User.findOne({ chatId: referalId });
        if (!refererUser) {
          return res.status(400).json({ message: "Invalid referral ID provided" });
        }
      }

      // Get initial ticket amount for signup
      const amount = await getActiveReferralAmount();

      // Generate referral link for new user
      const referralLink = `https://t.me/teststringrace_bot/play?start=${chatId}`;

      // Create new user
      const newUser = new User({
        chatId,
        username,
        profilepic,
        // ticketBalance: amount,
        referrerId: refererUser ? refererUser._id : null,
        referralLink,
        loginType: "user",
      });

      user = await newUser.save();
      isNewUser = true;
      console.log("User created");

      // 5️⃣ Referral reward logic
      if (refererUser) {
        const existingReferral = await Referral.findOne({
          referredUser: user._id,
          referringUser: refererUser._id,
        });

        const initialBalance = refererUser.ticketBalance;
        refererUser.ticketBalance += amount; // Add the reward to the referrer's balance
        const finalBalance = refererUser.ticketBalance;

        const newReferral = new Referral({
          referredUser: user._id,
          referringUser: refererUser._id,
          referralamount: amount,
          initialBalance,
          finalBalance,
          createdAt: new Date(),
        });

        await newReferral.save();

        // Add the referral to the referrer's referrals array and update the referrer
        await User.findByIdAndUpdate(
          refererUser._id,
          { $addToSet: { referrals : newReferral.toObject() } },
          { new: true }
        );

        await refererUser.save();
      }
    } else {
      console.log("User logged in");
    }

    const token = generateToken(user);

    // Build consistent user object to send back
    const userResponse = {
      id: user._id,
      username: user.username,
      profilepic: user.profilepic,
      ticketBalance: user.ticketBalance,
      referrerId: user.referrerId,
      loginType: user.loginType,
      referralLink: user.referralLink,
    };

    return res.status(200).json({
      message: isNewUser
        ? `Welcome ${username}! Your account is created.`
        : "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Failed to log in user:", error);
    return res.status(500).json({ message: "Unable to log in", error: error.message });
  }
};


const updateProfile = async (req, res) => {
    try {
        const userId = req.params._id;
        const { username, email, profilepic } = req.body;

        if (!userId) {
            return res.status(404).json({ message: "User ID is required" });
        }

        // Fetch the user from the database using the findById method
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the user fields
        if (username) user.username = username;
        if (profilepic) user.profilepic = profilepic;

        // Save the updated user
        await user.save();

        res.status(200).json({
            message: `Your Profile updated successfully ${username}...`,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                ticketBalance: user.ticketBalance,
                loginType: user.loginType,
                profilepic: user.profilepic // Include updated fields as needed
            },
        });
    } catch (error) {
        console.error("Failed to update profile:", error);
        res.status(500).json({ message: "Unable to update profile" });
    }
};


const getProfile = async (req, res) => {
    try {
        // The `req.user` is populated by the `validateToken` middleware
        const userId = req.params._id;

        if (!userId) {
            return res.status(404).json({ message: "User ID is required" });
        }

        // Fetch the user from the database using the findById method
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile fetched successfully",
            Note: "Please enter a valid TON wallet address to receive your payment. The withdrawal process will take 1 to 24 hours",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                ticketBalance: user.ticketBalance,
                loginType: user.loginType,
                referralLink: user.referralLink,
                Stats: user.Stats,
                profilepic: user.profilepic,// Include additional fields as needed
            },
            // user
        });
    } catch (error) {
        console.error("Failed to fetch profile:", error);
        res.status(500).json({ message: "Unable to fetch profile" });
    }
};


// Submit a withdrawal request
const withdrawrequest = async (req, res) => {
    const userId = req.params._id;
    const { amount } = req.body;

    try {
        // Validate the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check user balance
        if (user.ticketBalance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        console.log("UserId:", userId);
        console.log("Amount to withdraw:", amount);
        console.log("Current balance before withdrawal:", user.ticketBalance);

        // Create the withdrawal request with "pending" status
        const request = new Withdraw({
            userId,
            amount,
            username: user.username,
            status: "pending", // Set status to pending initially
        });

        // Save the request
        const savedRequest = await request.save();
        console.log("Withdrawal request saved:", savedRequest);

        res.status(200).json({
            message: "Withdrawal request submitted successfully.",
            request: savedRequest, // Return the saved request
        });
    } catch (error) {
        console.error("Error creating withdrawal request:", error);
        res.status(500).json({ message: "Failed to create withdrawal request", error: error.message });
    }
};


//get withdraw status for user
const getWithdrawStatus = async (req, res) => {
    try {
        const userId = req.params; // Extract userId from URL params

        // Validate userId
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Fetch withdrawal requests for the user
        const withdrawals = await Withdraw.find({ userId });

        if (!withdrawals || withdrawals.length === 0) {
            return res.status(404).json({ message: "No withdrawal requests found for this user" });
        }

        return res.status(200).json({
            message: "Withdrawal status fetched successfully",
            withdrawals,
            count: withdrawals.length
        });

    } catch (error) {
        console.error("❌ Error fetching withdrawal status:", error);
        res.status(500).json({ message: "Unable to fetch withdrawal status", error });
    }
};


//userClaimreward
const UserClaimReward = async (req, res) => {
    try {
        const userId = req.params._id;
        console.log(`Fetching user with ID: ${userId}`);
        console.log(`Fetching user with ID`, req.params._id)

        // Fetch reward settings
        const rewardSetting = await RewardSetting.findOne({ status: "active" });
        if (!rewardSetting) {
            return res.status(400).json({ message: "Reward system is not configured by the admin." });
        }

        // Ensure reward points are valid
        const rewardPoints = rewardSetting.points;
        if (!rewardPoints || isNaN(rewardPoints)) {
            console.error("Error: rewardPoints is undefined or NaN.");
            return res.status(500).json({ message: "Reward system misconfigured: Invalid reward points." });
        }

        // Fetch the correct user from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Ensure `ticketBalance` has a valid default value
        if (typeof user.ticketBalance !== "number" || isNaN(user.ticketBalance)) {
            user.ticketBalance = 0; // Reset to 0 if invalid
        }

        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000; // 86400000 ms

        // Ensure `DailyReward` is checked correctly
        const lastRewardTime = user.DailyReward ? new Date(user.DailyReward).getTime() : 0;
        const timePassed = now - lastRewardTime;

        // Check if 24 hours have passed
        if (!user.DailyReward || timePassed >= twentyFourHours) {
            console.log("User is eligible for a reward. Granting now...");

            // Store initial and final balances
            const initialBalance = user.ticketBalance;

            user.ticketBalance += rewardPoints; // Guaranteed to be a valid number
            user.DailyReward = now; // Update timestamp only for this user

            await user.save();
            console.log("Reward successfully saved!");

            const finalBalance = user.ticketBalance;

            // Save claim history
            const newClaim = new ClaimHistory({
                userId: user._id,
                username: user.username, // Ensure username is passed correctly
                rewardPoints: rewardPoints,
                claimedAt: new Date(),
                initialBalance: initialBalance, // Store initial balance
                finalBalance: finalBalance,     // Store final balance
                status: "claimed"  // Set status to claimed
            });

            await newClaim.save();
            console.log("Claim history successfully saved!");

            return res.status(200).json({
                message: `Your Daily Reward claimed successfully...`,
                data: {
                    userId: user._id,
                    username: user.username,
                    status: "claimed",  // Status of the claim
                    rewardPoints: rewardPoints,
                    initialBalance: initialBalance, // Return initial balance
                    finalBalance: finalBalance,     // Return final balance
                    claimedAt: newClaim.claimedAt,
                    id: newClaim._id
                }
            });
        }

        // Calculate time remaining
        const timeRemaining = twentyFourHours - timePassed;
        console.log(`User needs to wait. Time remaining: ${Math.ceil(timeRemaining / (60 * 1000))} minutes.`);

        return res.status(400).json({
            message: `⏳ You can claim your reward in ${Math.ceil(timeRemaining / (60 * 1000))} minutes.`,
        });

    } catch (error) {
        console.error("Error in claiming reward:", error);
        return res.status(500).json({ message: "Internal server error. Please try again later." });
    }
};


const getclaimhistory = async (req, res) => {
    try {
        const userId = req.params.id; // Extract userId correctly

        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid userId" });
        }

        // Fetch claim history for the specified user with pagination
        const claims = await ClaimHistory.find({ userId }) // Ensures we only fetch this user's data

        const totalclaimBonus = await ClaimHistory.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } }, // ✅ Ensure ObjectId format
            { $group: { _id: null, totalBonus: { $sum: "$rewardPoints" } } }
        ]);

        const claimBonus = totalclaimBonus.length > 0 ? totalclaimBonus[0].totalBonus : 0;

        res.status(200).json({
            success: true,
            // total,
            claims,
            totalclaimBonus: claimBonus, // Corrected total claim bonus calculation
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


const GetDailyReward = async (req, res) => {
    try {
        // Fetch the reward setting
        const rewardSetting = await RewardSetting.findOne();

        if (!rewardSetting) {
            return res.status(404).json({ message: "No reward settings found" });
        }

        return res.status(200).json({
            message: "Reward settings fetched successfully",
            rewardPoints: rewardSetting.points
        });

    } catch (error) {
        console.error(" Error fetching reward settings:", error);
        res.status(500).json({ message: "Unable to fetch reward settings", error });
    }
};


const getreferralHistory = async (req, res) => {
    try {
        const { _id: userId } = req.params;          // same naming style as your route
        const filter = userId ? { referringUser: userId } : {};

        // 🚀 1-liner: pull the refs, join the User collection, keep it lean
        const referrals = await Referral.find(filter)
            .sort({ createdAt: -1 })
            .populate({ path: 'referredUser', select: 'username firstName lastName email chatId' })
            .populate({ path: 'referringUser', select: 'username firstName lastName email chatId' })
            .lean();   // --> converts to plain JS objects, faster mapping

        // Shape the payload for the front-end
        const cleaned = referrals.map(r => ({
            _id: r._id,
            referredUser: r.referredUser?._id,
            referringUser: r.referringUser?._id,

            // 🌟 Username priority: username > full name > email > chatId
            referredUserName: r.referredUser?.username
                || `${r.referredUser?.firstName || ''} ${r.referredUser?.lastName || ''}`.trim()
                || r.referredUser?.chatId
                || 'Unknown',

            referringUserName: r.referringUser?.username
                || `${r.referringUser?.firstName || ''} ${r.referringUser?.lastName || ''}`.trim()
                || r.referringUser?.chatId
                || 'Unknown',

            referralamount: r.referralamount,
            initialBalance: r.initialBalance ?? 0,
            finalBalance: r.finalBalance ?? 0,
            initiated: r.initiated,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
        }));

        res.json({ success: true, count: cleaned.length, data: cleaned });
    } catch (err) {
        console.error('Error fetching referrals:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


//userSignupbulk(faker-M)
const usersignup = async (req, res) => {
    try {
        const { username, email, password, loginType, bulkInsert } = req.body;

        // Bulk insert users if requested
        if (bulkInsert) {
            console.log('🚀 Bulk inserting 100000 users...');

            const hashedPassword = await bcryptjs.hash('Users@123', 10); // Pre-hash password once
            const users = Array.from({ length: 100000 }).map(() => ({
                username: faker.person.firstName(),
                email: faker.internet.email(),
                password: hashedPassword,
                loginType: "user",
            }));

            // 🔥 SUPER FAST INSERT: insertMany with { ordered: false }
            await User.create(users);

            console.log('✅ Successfully inserted 100000 users');
            return res.status(201).json({ message: "100000 users inserted successfully" });
        }

        // Normal single user signup
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email is already registered" });
        }

        const hashedPasswordSingle = await bcryptjs.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPasswordSingle, loginType: loginType || "user" });

        const savedUser = await newUser.save();

        res.status(201).json({
            message: "Registered successfully",
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                loginType: savedUser.loginType,
            },
        });

    } catch (error) {
        console.error("❌ Failed to create new user:", error);
        res.status(500).json({ message: "Unable to create new user" });
    }
};


const getuserboosterTransactions = async (req, res) => {
    const userId = req.params.userId
    console.log(userId);

    try {
        const boosterTransactions = await BoosterTransaction.find({ userId: userId });
        console.log(boosterTransactions);

        return res.status(200).json({
            message: " BoosterTransaction feteched successfully",
            data: boosterTransactions
        })

    } catch (error) {
        return res.status(404).json({
            message: "unable to fetch  BoosterTransaction ",
            error: error
        })
    }
}


const getuserads = async(req,res) =>{
    try {
        const userId = req.params._id

        // If AdId is not provided, return all ads
        const ads = await AdsData.find();

        return res.status(200).json({
            success: true,
            total_no_of_ads: ads.length,
            message: "All ads fetched successfully",
            data: ads
        });

    } catch (error) {
        console.error("Error fetching ads:", error);
        return res.status(500).json({ success: false, message: "Unable to fetch ads" });
    }
};



const UserGetReferralReward = async (req, res) => {
  try {
    const userId = req.params._id;

      // Get all referral rewards
      const referralSettings = await ReferralSetting.find({});

      return res.status(200).json(
        { message: "All referralSettings fetched succesfully",
        count: referralSettings.length
        ,referralSettings });
    }
   catch (error) {
    console.error(" Error fetching referral rewards:", error);
    return res.status(500).json({
      message: "Failed to fetch referral rewards",
      error: error.message,
    })
};
}





module.exports = { getreferralHistory, login, getProfile, updateProfile, UserGetReferralReward,getuserboosterTransactions, withdrawrequest, getWithdrawStatus, UserClaimReward, getclaimhistory, GetDailyReward, usersignup, getuserads }
