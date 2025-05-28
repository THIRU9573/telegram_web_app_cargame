const mongoose = require("mongoose");
const withdrawLimits = require("../../models/WithdrawalLimitsSchema");

const updateOrCreateWithdrawLimits = async (req, res) => {
  try {
    const limitId = req.params._id;
    const { minWithdrawal, maxWithdrawal } = req.body;

    if (limitId) {
      const updatedLimits = await withdrawLimits.findByIdAndUpdate(
        limitId,
        { minWithdrawal, maxWithdrawal },
        { new: true } // return updated doc
      );

      if (!updatedLimits) {
        return res.status(404).json({
          success: false,
          message: "Withdrawal limits not found to update",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Withdrawal limits updated successfully.",
        data: updatedLimits,
      });
    }

    // If no ID, create new limits
    const newLimits = new withdrawLimits({
      minWithdrawal,
      maxWithdrawal,
    });

    const savedLimits = await newLimits.save();

    return res.status(201).json({
      success: true,
      message: "Withdrawal limits added successfully.",
      data: savedLimits,
    });
  } catch (error) {
    console.error("Error in adding or updating withdrawal limits:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to add or update withdrawal limits",
    });
  }
};

const getWithdrawalLimits = async (req, res) => {
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

module.exports = { updateOrCreateWithdrawLimits, getWithdrawalLimits,};
