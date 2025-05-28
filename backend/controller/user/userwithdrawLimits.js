const mongoose = require("mongoose");
const withdrawLimits = require("../../models/WithdrawalLimitsSchema");


const getUserWithdrawalLimits = async (req, res) => {
    const userId = req.params._id;
  try {
    const limits = await withdrawLimits.find();

    return res.status(200).json({
      success: true,
      message: "Withdrawal limits fetched successfully.",
      data: limits,
    });
  } catch (error) {
    console.error("Error fetching withdrawal limits:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch withdrawal limits",
    });
  }
};


module.exports = {getUserWithdrawalLimits};