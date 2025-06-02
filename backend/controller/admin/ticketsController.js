const mongoose = require("mongoose");
const TicketConvertion = require("../../models/TicketConvertion");

const Tickets = async (req, res) => {
  try {
    const { TicketId, TicketQuantity, Status, AmountInToken, DefaultAdminWallet } = req.body;

    if (TicketId) {
      // Update existing document
      const updatedConvertion = await TicketConvertion.findByIdAndUpdate(
        TicketId,
        { TicketQuantity, Status, AmountInToken, DefaultAdminWallet },
        { new: true }
      );

      if (!updatedConvertion) {
        return res.status(404).json({
          success: false,
          message: "TicketConvertion not found for update.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "TicketConvertion updated successfully.",
        data: updatedConvertion,
      });
    } else {
      // Create new document
          await TicketConvertion.updateMany({}, { $set: { Status: "INACTIVE" } });
      

      const convertion = new TicketConvertion({
        TicketQuantity,
        Status,
        AmountInToken,
        DefaultAdminWallet,
      });

      const savedConvertion = await convertion.save();

      return res.status(201).json({
        success: true,
        message: "TicketConvertion added successfully.",
        data: savedConvertion,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create or update TicketConvertion.",
      error: error.message,
    });
  }
};


const getTicketConvertion = async(req,res)=>{
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



module.exports = {Tickets,getTicketConvertion};
