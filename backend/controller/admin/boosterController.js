const express = require("express")
const Booster = require("../../models/boosterSchema");
const BoosterSetting = require("../../models/boosterSettingSchema")
const BoosterTransaction = require("../../models/boostertransactionSchema")

const addBooster = async (req, res) => {
    // const BoosterId = req.params._id;
    const {
        BoosterId,
        BoosterName,
        BoosterImage,
        Price,
        Description,
        BoosterDuration,
        RewardMultiplier,
        BoosterStatus } = req.body

    if (!BoosterName || !BoosterImage || !Price || !Description || !BoosterDuration || !RewardMultiplier || !BoosterStatus) {
        return res.status(401).json("All fields are required")
    }
    try {
        // If updating an existing task
        if (BoosterId) {
            const booster = await Booster.findById(BoosterId);
            if (!booster) {
                return res.status(404).json({ message: "Booster not found" });
            }

            // Directly update fields
            booster.BoosterName = BoosterName || booster.BoosterName;
            booster.BoosterStatus = BoosterStatus || booster.BoosterStatus;
            booster.BoosterImage = BoosterImage || booster.BoosterImage;
            booster.Description = Description || booster.Description;
            booster.BoosterDuration = BoosterDuration || booster.BoosterDuration;
            booster.RewardMultiplier = RewardMultiplier || booster.RewardMultiplier;
            booster.Price = Price || booster.Price
            // Save updated task
            const updatedBooster = await booster.save();
            return res.status(200).json({
                message: "Booster updated successfully",
                task: updatedBooster,
            });
        }

        // If creating a new task
        const booster = new Booster({
            BoosterName,
            BoosterImage,
            Price,
            Description,
            BoosterDuration,
            RewardMultiplier,
            BoosterStatus: BoosterStatus || "active",
        });

        // Save new task
        const createdBooster = await booster.save();

        return res.status(201).json({
            message: "Booster created successfully",
            booster: createdBooster,
        });

    } catch (error) {
        console.error("❌ Error in Addbooster:", error);
        res.status(500).json({ message: "Unable to add or update booster", error });
    }
};


const getAllBoosters = async (req, res) => {
    const BoosterId = req.query.BoosterId
    if (BoosterId) {
        try {
            const booster = await Booster.findById(BoosterId);
            console.log("Booster:", booster);

            if (!booster) {

                return res.status(404).json({
                    message: "Booster not found",
                });
            }
            return res.status(200).json({
                message: "Booster fetched successfully",
                length: booster.length,
                data: booster,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Unable to fetch booster",
                error: error.message,
            });
        }
    }
    else {
        try {
            const allBoosters = await Booster.find();
            console.log("allBoosters", allBoosters);

            return res.status(200).json({
                message: "all boosters feteched successfully",
                length: allBoosters.length,
                data: allBoosters
            })

        } catch (error) {
            return res.status(500).json({
                message: "unable to fetch all boosters ",
                error: error
            })
        }
    }
}


const boosterSetting = async (req, res) => {
    // const BoostersettingId = req.params._id
    const {
        BoostersettingId,
        BoosterWalletAddress,
        BoosterContent,
        BoosterNote1,
        BoosterNote2,
        Status } = req.body;

    // Check required fields
    if (!BoosterWalletAddress || !BoosterContent || !Status) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        if (BoostersettingId) {
            // Check if BoosterSetting exists before updating
            const boosterSetting = await BoosterSetting.findById(BoostersettingId);
            if (!boosterSetting) {
                return res.status(404).json({ message: "BoosterSetting not found" });
            }

            // Update the existing record
            boosterSetting.BoosterWalletAddress = BoosterWalletAddress;
            boosterSetting.BoosterContent = BoosterContent;
            boosterSetting.BoosterNote1 = BoosterNote1;
            boosterSetting.BoosterNote2 = BoosterNote2;
            boosterSetting.Status = Status;

            const updatedBoosterSetting = await boosterSetting.save();

            return res.status(200).json({
                message: "BoosterSetting updated successfully",
                booster: updatedBoosterSetting,
            });
        } else {
            // Create new BoosterSetting (only if ID is NOT provided)
            const boosterSetting = new BoosterSetting({
                BoosterWalletAddress,
                BoosterContent,
                BoosterNote1,
                BoosterNote2,
                Status: Status || "active",
            });

            const createdBoosterSetting = await boosterSetting.save();

            return res.status(201).json({
                message: "BoosterSetting created successfully",
                booster: createdBoosterSetting,
            });
        }
    } catch (error) {
        console.error(" Error in BoosterSetting:", error);
        res.status(500).json({ message: "Unable to add or update BoosterSetting", error });
    }
};


const getBoosterSetting = async (req, res) => {
    try {
        const Boostersetting = await BoosterSetting.find();
        return res.status(200).json({
            message: " boostersetting feteched successfully",
            length: boosterSetting.length,
            data: Boostersetting
        })

    } catch (error) {
        return res.status(404).json({
            message: "unable to fetch  Boostersetting ",
            error: error
        })
    }
}


const getboosterTransactions = async (req, res) => {
    try {
        const boosterTransactions = await BoosterTransaction.find();
        return res.status(200).json({
            message: " BoosterTransaction feteched successfully",
            length: boosterTransactions.length,
            data: boosterTransactions
        })

    } catch (error) {
        return res.status(404).json({
            message: "unable to fetch  BoosterTransaction ",
            error: error
        })
    }
}


module.exports = { addBooster, getAllBoosters, boosterSetting, getBoosterSetting, getboosterTransactions }    
