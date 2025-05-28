
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const User = require("../../models/userSchema");
const jwt = require("jsonwebtoken");
const Withdraw = require("../../models/withdrawlSchema")
const RewardSetting = require("../../models/rewardSettingSchema")
// // const withdrawMethod=require("../../models/adminwithdrawmethodsc")
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const AdsData = require("../../models/AdsSchema");
const { findById } = require("../../models/gameHistorySchema");
const CompletedTask = require("../../models/completedTaskSchema")
const CompleteAdData = require('../../models/CompleteAdSchema')
const ClaimHistory = require("../../models/claimHistorySchema")
const ReferralSetting = require("../../models/refferalSettingSchema");
const { count } = require("console");


const Adminsignup = async (req, res) => {
    try {
        const { username, email, password, loginType } = req.body;

        // Validate input fields
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email is already registered" });
        }

        // Hash the password securely

        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create new admin user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            loginType: loginType || "Admin", // Set default to "Admin" if not provided
        });

        // Save the new user
        const savedUser = await newUser.save();

        // Send response (excluding password)
        res.status(201).json({
            message: `${username} your admin registration successfully`,
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                loginType: savedUser.loginType,
            },
        });

    } catch (error) {
        console.error("Failed to create new Admin:", error);
        console.error(error.stack);  // Log the full stack trace for more context

        // Provide more specific error messages based on error type
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Unable to create new admin" });
    }
};


const Adminlogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input fields
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Convert email to lowercase for consistency
        const normalizedEmail = email.toLowerCase();

        // Find user & ensure password is retrieved
        const user = await User.findOne({ email: normalizedEmail }).select("+password");

        console.log("🔍 User Found:", user);

        // If user is not found
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // console.log("🔍 Retrieved Password:", user.password);

        // Check if user has admin access
        if (user.loginType !== "Admin") {
            return res.status(403).json({ message: "Access denied. Not an Admin account." });
        }

        // Check if password field exists
        if (!user.password) {
            console.error("⚠️ Error: Password field is missing in the database.");
            return res.status(500).json({ message: "Server error: Missing user password." });
        }

        // Compare entered password with hashed password
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        console.log(" Password Match Status:", isPasswordValid);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { user: { id: user._id, role: user.loginType } }, // Include role in token
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "24h" }
        );

        // Send success response (excluding password)
        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                ticketBalance: user.ticketBalance,
                loginType: user.loginType, // Include login type
            },
            token,
        });

    } catch (error) {
        console.error("Failed to log in user:", error);
        return res.status(500).json({ message: "Unable to log in", error: error.message });
    }
};


const getAllUsers = async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await User.find(); // Mongoose method to get all users

        // Check if no users were found
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        // Return the list of users in the response
        res.status(200).json({
            message: "All users fetched successfully",
            length: users.length,
            users: users
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Unable to fetch users" });
    }
};


const EditProfile = async (req, res) => {
    try {
        const userId = req.params._id;
        const { username, profilepic } = req.body;

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
            message: "Profile updated successfully",
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


const AdmingetProfile = async (req, res) => {
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
                profilepic: user.profilepic,// Include additional fields as needed
                referralLink: user.referralLink
            },
        });
    } catch (error) {
        console.error("Failed to fetch profile:", error);
        res.status(500).json({ message: "Unable to fetch profile" });
    }
};


const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.loginType !== 'Admin') {
            return res.status(400).json({ message: "This request is for admin users only" });
        }

        console.log(process.env.SMTP_EMAIL);
        console.log(process.env.SMTP_PASS);
        console.log(user.email);

        const sendOtp = user.generateOTP();
        await user.save();
        // console.log(sendOtp);

        // Send reset link via email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to: user.email,
            subject: "Password Reset Request",
            text: `<p>Your OTP code for resetting your password is:<string>${sendOtp}</string></p> `, // Plain text version
            html: `<h2>Password Reset OTP</h2>
            <p>Your OTP code is: <strong>${sendOtp}</strong></p>
            <p>This code is valid for 10 minutes. Do not share it with anyone.</p>
             <p>If you did not request a password reset, please ignore this email.</p>`
        });

        return res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        console.error("❌ Forgot password error:", error);
        return res.status(500).json({ message: "Unable to process request", error: error.message });
    }
}


const resetPassword = async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Log the request body to check its structure
        const { otp, newPassword, confirmPassword, email } = req.body;

        // Check if all fields are provided
        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate if passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Validate OTP
        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Check if OTP is expired
        if (user.otpExpires && new Date() > user.otpExpires) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // Hash and update password
        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        // Clear OTP fields
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();
        return res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        console.error("❌ Reset password error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const changePassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword, confirmPassword } = req.body;

        console.log(req.body);


        // Check if all fields are provided
        if (!email || !oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find user by email
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare old password with stored password
        const isOldPasswordValid = await bcryptjs.compare(oldPassword, user.password);
        console.log("Password Match Status:", isOldPasswordValid);


        if (!isOldPasswordValid) {
            return res.status(401).json({ message: "Invalid old password" });
        }

        // Validate if passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New passwords do not match" });
        }

        // Hash new password
        const hashedPassword = await bcryptjs.hash(newPassword, 10);

        // Update password in database
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({ message: "Password changed successfully" });

    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const withdrawLimits = async (req, res) => {
    const {userId} = req.params._id;
    try {
        const limits = {
            minWithdrawal: 10,
            maxWithdrawal: 500
        };
        res.status(200).json(limits);
    } catch (error) {
        console.error("Error fetching withdrawal limits:", error);
        res.status(500).json({ message: "Failed to fetch withdrawal limits" });
    }
}


const approvewithdraw = async (req, res) => {
    const { requestId } = req.body;

    try {
        // Step 1: Fetch the withdrawal request and populate userId
        const request = await Withdraw.findById(requestId).populate("userId", "username ticketBalance");

        if (!request) {
            return res.status(404).json({ message: "Withdrawal request not found" });
        }

        // Step 2: Ensure the request is still pending
        if (request.status !== "pending") {
            return res.status(400).json({ message: "Withdrawal request is already processed" });
        }

        // Step 3: Check if userId is populated
        const user = request.userId;
        console.log("request11", user);

        if (!user) {
            return res.status(400).json({ message: "User associated with this withdrawal request not found" });
        }

        // Step 4: Log current balance before deduction
        console.log("Current user ticketBalance:", user.ticketBalance);

        // Check user's balance and deduct the amount
        if (user.ticketBalance < request.amount) {
            return res.status(400).json({ message: "Insufficient balance in user's account" });
        }

        // Step 5: Mark the withdrawal request as approved before deducting
        // Mark the withdrawal request as approved first to prevent duplicate deduction
        request.status = "approved";
        await request.save();

        // Step 6: Deduct the amount from the user's balance
        user.ticketBalance -= request.amount;

        // Log balance after deduction to ensure correct calculation
        console.log("User ticketBalance after deduction:", user.ticketBalance);

        // Ensure to fetch the updated user document and save it correctly
        await user.save();

        // Re-fetch the updated user to ensure balance is properly saved
        const updatedUser = await User.findById(user._id);

        res.status(200).json({
            message: "Withdrawal request approved successfully.",
            updatedBalance: updatedUser.ticketBalance, // Use the re-fetched balance to ensure it is correct
        });
    } catch (error) {
        console.error("Error approving withdrawal:", error.message);
        res.status(500).json({ message: "Failed to approve withdrawal request", error: error.message });
    }
};



const rejectwithdraw = async (req, res) => {
    const { requestId, reason } = req.body;

    try {
        // Fetch the withdrawal request
        const request = await Withdraw.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Withdrawal request not found" });
        }

        // Check if the request is still pending
        if (request.status == "approved") {
            return res.status(400).json({ message: "Withdrawal request is already processed" });
        }

        // Mark the request as rejected
        request.status = "rejected";
        request.rejectionReason = reason || "No reason provided";
        await request.save();

        res.status(200).json({
            message: "Withdrawal request rejected successfully.",
            request,
        });
    } catch (error) {
        console.error("Error rejecting withdrawal:", error);
        res.status(500).json({ message: "Failed to reject withdrawal request" });
    }
};


const AdminSetReward = async (req, res) => {
    try {
        const rewardPoints = Number(req.body.rewardPoints); // Reward points from admin
        console.log("rewardPoints", req.body);

        if (isNaN(rewardPoints) || rewardPoints <= 0) {
            return res.status(400).json({ message: "Invalid reward points" });
        }

        // Mark all existing rewards as inactive
        await RewardSetting.updateMany({}, { $set: { status: "inactive" } });

        // Create a new active reward setting
        const newRewardSetting = new RewardSetting({
            points: rewardPoints,
            status: "active",
        });
        await newRewardSetting.save();

        return res.status(201).json({ message: "Daily Reward points updated successfully!", newRewardSetting });

    } catch (error) {
        console.error("❌ Error in setting/rewarding points:", error);
        //console.error(error.stack);
        res.status(500).json({ message: "Unable to set/edit reward points", error: error.message });
    }
};


const GetAllDailyReward = async (req, res) => {
    try {
        // Fetch the reward setting
        const rewardSetting = await RewardSetting.find();

        if (!rewardSetting) {
            return res.status(404).json({ message: "No reward settings found" });
        }

        return res.status(200).json({
            message: "All Reward settings (Overall Daily rewards) fetched successfully",
            count: rewardSetting.length,
            data: rewardSetting,
            rewardPoints: rewardSetting.points
        });

    } catch (error) {
        console.error(" Error fetching reward settings:", error);
        res.status(500).json({ message: "Unable to fetch reward settings", error });
    }
};


const getAllWithdrawStatus = async (req, res) => {
    try {
        // Fetch withdrawal requests for the user
        const withdrawals = await Withdraw.find();

        if (!withdrawals || withdrawals.length === 0) {
            return res.status(404).json({ message: "No withdrawal requests found for this user" });
        }

        return res.status(200).json({
            message: "All Withdrawal status fetched successfully",
            count: withdrawals.length,
            withdrawals,
        });

    } catch (error) {
        console.error("Error fetching withdrawal status:", error);
        res.status(500).json({ message: "Unable to fetch withdrawal status", error });
    }
};


//Add sinle Ad
const addAd = async (req, res) => {
    try {
        const { AdName, AdSDK, AdImage, Rewardpoints, AdCount, AdTimer_InMinutes, AddedBy, Status, AdId } = req.body;
        console.log(req.body);

        // Ensure AddedBy is provided
        if (!AddedBy) {
            return res.status(400).json({ success: false, message: "AddedBy (Admin ID) is required" });
        }

        // Find the user by AddedBy ID
        const user = await User.findById(AddedBy);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if the user is an admin
        if (user.loginType !== "Admin") {
            return res.status(403).json({ success: false, message: "Only admins can add or update ads" });
        }

        // Validate required fields for the ad
        if (!AdName || !AdSDK || !AdImage || !Rewardpoints || !AdCount || !AdTimer_InMinutes || !Status) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }

        // If AdId is provided, attempt to update the ad
        if (AdId) {
            // Find the ad by AdId and update it 
            const updatedAd = await AdsData.findByIdAndUpdate(
                AdId,
                { AdName, AdSDK, AdImage, Rewardpoints, AdCount, AdTimer_InMinutes, AddedBy, Status },
                { new: true } // This returns the updated document
            );

            if (!updatedAd) {
                return res.status(404).json({ success: false, message: "AD not found to update" });
            }

            return res.status(200).json({
                success: true,
                message: "AD updated successfully.",
                data: updatedAd
            });
        }

        // If AdId is not provided, create a new ad
        const newAd = new AdsData({
            AdName,
            AdSDK,
            AdImage,
            Rewardpoints,
            AdCount,
            AdTimer_InMinutes,
            AddedBy,
            Status
        });

        // Save the new ad to the database
        const savedAd = await newAd.save();

        return res.status(201).json({
            success: true,
            message: "Ad added successfully.",
            data: savedAd
        });

    } catch (error) {
        console.error("Error in adding or updating ad:", error);
        return res.status(500).json({ success: false, message: "Unable to add or update ad" });
    }
};


//getAllAds
const getAds = async (req, res) => {
    try {
        const { AdId } = req.params;  // Extract AdId from params

        if (AdId) {
            // If AdId is provided, find the single ad
            const ad = await AdsData.findById(AdId);

            if (!ad) {
                return res.status(404).json({ success: false, message: "AD not found" });
            }

            return res.status(200).json({
                success: true,
                message: "AD found successfully",
                data: ad
            });
        }

        // If AdId is not provided, return all ads
        const ads = await AdsData.find();

        return res.status(200).json({
            success: true,
            total_no_of_ads: ads.length,
            message: "All ADs fetched successfully",
            data: ads
        });

    } catch (error) {
        console.error("Error fetching ads:", error);
        return res.status(500).json({ success: false, message: "Unable to fetch ads" });
    }
};


const AdminLogout = async (req, res) => {
    try {
        // Instruct frontend to remove the token (since it's stored on the client side)
        return res.status(200).json({ message: "Logout successful" });

    } catch (error) {
        console.error("❌ Logout failed:", error);
        return res.status(500).json({ message: "Unable to log out", error: error.message });
    }
};


const getCompletedTasksByUser = async (req, res) => {
    try {
        const userId = req.params._id;  // Get userId from request params

        if (userId) {
            // Fetch tasks for the specific user and populate 'userId' with 'username'
            const completedTasks = await CompletedTask.find({ userId })

            // If no tasks found for the user, return a 404
            if (!completedTasks || completedTasks.length === 0) {
                return res.status(404).json({ message: "No completed tasks found for this user" });
            }

            // Return tasks along with the count of completed tasks
            return res.status(200).json({
                message: "Completed tasks for this user retrieved successfully",
                completedTasks,
                taskCount: completedTasks.length,
            });
        } else {
            // If no userId is provided in the params, fetch tasks for all users
            const completedTasks = await CompletedTask.find()


            // If no tasks found for all users, return a 404
            if (!completedTasks || completedTasks.length === 0) {
                return res.status(404).json({ message: "No completed tasks found" });
            }

            // Return all completed tasks
            return res.status(200).json({
                message: "All completed tasks retrieved successfully",
                taskCount: completedTasks.length,
                completedTasks,
            });
        }
    } catch (error) {
        console.error("Error fetching completed tasks:", error);
        res.status(500).json({
            message: "Failed to retrieve completed tasks",
            error: error.message,
        });
    }
};


const getCompletedAdsByUser = async (req, res) => {
    try {
        const userId = req.params._id; // Get userId from params
        console.log("UserId from params:", userId); // Debug log to verify if userId is passed correctly

        if (userId) {
            // If userId is provided, fetch completed ads for that specific user
            const completedAds = await CompleteAdData.find({ userId })

            console.log("Completed ADs for this user:", completedAds);  // Debug log to check the result

            if (!completedAds || completedAds.length === 0) {
                return res.status(404).json({ message: "No completed ADs found for this user" });
            }
            return res.status(200).json({
                message: `Completed ADs for userId - ${userId}`,
                taskCount: completedAds.length,
                completedAds,
            });
        } else {
            // If userId is not provided, fetch completed ads for all users
            const completedAds = await CompleteAdData.find()

            if (!completedAds || completedAds.length === 0) {
                return res.status(404).json({ message: "No completed ADs found" });
            }

            return res.status(200).json({
                message: "All completed ADs retrieved successfully",
                tasksCount: completedAds.length,
                completedAds,
            });
        }
    } catch (error) {
        console.error("Error fetching completed ads:", error);
        return res.status(500).json({
            message: "Unable to retrieve completed ads",
            error: error.message,
        });
    }
};


const getAllClaimHistory = async (req, res) => {
    try {
        // Fetch all claim history data from the ClaimHistory collection
        const claims = await ClaimHistory.find()
            .sort({ claimedAt: -1 })  // Sort by claimedAt to show newest claims first
            .exec();

        if (!claims || claims.length === 0) {
            return res.status(404).json({ success: false, message: "No claim history found for any users" });
        }

        // Calculate total claim bonus (sum of all rewardPoints) for all users
        const totalClaimBonus = await ClaimHistory.aggregate([
            { $group: { _id: null, totalBonus: { $sum: "$rewardPoints" } } }
        ]);

        const claimBonus = totalClaimBonus.length > 0 ? totalClaimBonus[0].totalBonus : 0;

        res.status(200).json({
            success: true,
            total_Cliams: claims.length,
            claims,
            totalClaimBonus: claimBonus, // Sum of all rewardPoints for all users
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error", error: err.message });
    }
};


const Usernotification = async (req, res) => {
    const { Notification } = req.body;

    if (!Notification) {
        return res.status(404).json({
            status: "Failed",
            message: "Notification not found.",
        });
    }

    // Send an immediate response to speed up API response time
    res.status(200).json({
        status: "Success",
        message: "Notifications are being sent successfully...",
    });

    const botKey = `7522857397:AAHpO_EwyEq73HfDXvAxNYMvujXMJfp7Hv0`;

    // Function to send the notification to all users
    const sendNotificationToAllUsers = async () => {
        try {
            // Fetch all users
            const users = await User.find({}).select({ chatId: 1 }); // Get all users' chatIds

            for (let i = 0; i < users.length; i++) {
                const chatId = users[i].chatId;
                const sendMessageUrl = `https://api.telegram.org/bot${botKey}/sendMessage`;

                console.log(chatId, "chatId");

                try {
                    const response = await axios.get(sendMessageUrl, {
                        params: {
                            chat_id: chatId,
                            text: Notification,
                        },
                    });

                    if (response.data.ok) {
                        console.log(`Notification sent to user ${chatId}`);
                    } else {
                        console.error(`Failed to send notification to user ${chatId}:`, response.data);
                    }
                } catch (error) {
                    console.error(`Error sending notification to user ${chatId}:`, error.message);
                }
            }

            console.log("All notifications sent successfully.");
        } catch (error) {
            console.error("Error fetching users or sending notifications:", error.message);
        }
    };

    // Call the function to send notifications to all users
    sendNotificationToAllUsers();
};


const AdminSetReferralReward = async (req, res) => {
    try {
        const { id } = req.params;
        const referralAmount = Number(req.body.referralAmount);

        if (isNaN(referralAmount) || referralAmount <= 0) {
            return res.status(400).json({ message: "Invalid referral amount" });
        }

        if (id) {
            // Update existing referral reward by id
            const updatedReferralSetting = await ReferralSetting.findByIdAndUpdate(
                id,
                {
                    referralAmount,
                    updatedAt: new Date(),
                    Status: "active",
                },
                { new: true }
            );

            if (!updatedReferralSetting) {
                return res.status(404).json({ message: "Referral reward setting not found" });
            }

            // Deactivate all other referral rewards except this one
            await ReferralSetting.updateMany(
                { _id: { $ne: id } },
                { $set: { Status: "inactive" } }
            );

            return res.status(200).json({
                message: "Referral reward updated successfully!",
                referralSetting: updatedReferralSetting,
            });
        } else {
            // Create new referral reward
            await ReferralSetting.updateMany({}, { $set: { Status: "inactive" } });

            const newReferralSetting = new ReferralSetting({
                referralAmount,
                Status: "active",
                updatedAt: new Date(),
            });

            await newReferralSetting.save();

            return res.status(201).json({
                message: "Referral reward created successfully!",
                referralSetting: newReferralSetting,
            });
        }
    } catch (error) {
        console.error("Error in upserting referral reward:", error);
        return res.status(500).json({
            message: "Failed to upsert referral reward",
            error: error.message,
        });
    }
};


const AdminGetReferralReward = async (req, res) => {
    try {
        const { id } = req.params;
        if (id) {
            // Get specific referral reward by id
            const referralSetting = await ReferralSetting.findById(id);

            if (!referralSetting) {
                return res.status(404).json({ message: "Referral reward not found" });
            }

            return res.status(200).json({ message: "Specific referralSetting fetched succesfully", referralSetting });
        } else {
            // Get all referral rewards
            const referralSettings = await ReferralSetting.find({});

            return res.status(200).json(
                {
                    message: "All referralSettings fetched succesfully",
                    count: referralSettings.length
                    , referralSettings
                });
        }
    } catch (error) {
        console.error("❌ Error fetching referral rewards:", error);
        return res.status(500).json({
            message: "Failed to fetch referral rewards",
            error: error.message,
        });
    }
};


module.exports = { Adminsignup, Usernotification, AdminGetReferralReward, Adminlogin, getAllUsers, EditProfile, AdmingetProfile, forgotPassword, resetPassword, changePassword, approvewithdraw, withdrawLimits, rejectwithdraw, AdminSetReward, GetAllDailyReward, getAllWithdrawStatus, AdminLogout, addAd, getAds, getCompletedTasksByUser, getCompletedAdsByUser, getAllClaimHistory, AdminSetReferralReward, AdminGetReferralReward };