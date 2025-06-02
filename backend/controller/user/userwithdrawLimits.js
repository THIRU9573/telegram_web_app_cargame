const mongoose = require("mongoose");
const withdrawLimits = require("../../models/WithdrawalLimitsSchema");
const TicketConvertion = require("../../models/TicketConvertion");


const getUserWithdrawalLimits = async (req, res) => {
    const userId = req.params._id;
  try {
    const limits = await withdrawLimits.findOne({status:"ACTIVE"});

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



const getUserTicketConvertion = async(req,res)=>{
    const userId = req.params._id;
  try {
    const TicketValue = await TicketConvertion.findOne({Status:"ACTIVE"});
   return res.status(200).json({
      success: true,
      message: "TicketConvertion  fetched successfully.",
      data: TicketValue,
    });
  } catch (error) {
    console.error("Error fetching TicketConvertion :", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch TicketConvertion ",
    });
  }
};


module.exports = {getUserWithdrawalLimits,getUserTicketConvertion};