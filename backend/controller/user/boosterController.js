const express = require("express")
const Booster = require("../../models/boosterSchema");
const BoosterSetting = require("../../models/boosterSettingSchema")
const BoosterTransaction = require("../../models/boostertransactionSchema")

const getAllBoosters = async (req, res) => {
    try {
        const allBoosters = await Booster.find();
        return res.status(200).json({
            message: "all boosters feteched successfully",
            data: allBoosters
        })

    } catch (error) {
        return res.status(404).json({
            message: "unable to fetch all boosters ",
            error: error
        })

    }
}


// API to fetch booster transactions for a specific user
const getBoostersTransactionsByUserId = async (req, res) => {
    try {
        const userId = req.params; // Get userId from URL parameters

        // Convert userId to ObjectId if it is stored as an ObjectId in the database
        const userTransactions = await BoosterTransaction.find({ userId: userId })
        // .populate('BoosterId', 'BoosterName Price') // Populate booster details
        //   .populate('userId', 'username email'); // Populate user details

        // If no transactions found
        if (userTransactions.length === 0) {
            return res.status(404).json({
                message: 'No transactions found for this user',
            });
        }

        // Return the fetched transactions
        return res.status(200).json({
            message: 'Booster transactions fetched successfully',
            total_length: userTransactions.length,
            data: userTransactions,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to fetch booster transactions',
            error: error.message,
        });
    }
};


const getBoosterSetting = async (req, res) => {
    try {
        const Boostersetting = await BoosterSetting.find();
        return res.status(200).json({
            message: " boostersetting feteched successfully",
            data: Boostersetting
        })

    } catch (error) {
        return res.status(404).json({
            message: "unable to fetch  Boostersetting ",
            error: error
        })


    }
}


//my CGPT version
const boostertransaction = async (req, res) => {
    const TransactionId = req.params._id;
    const { userId, BoosterId, Amount, BoosterStart, BoosterEnd } = req.body;

    console.log('Request Body:', req.body);
    console.log('TransactionId:', TransactionId);

    try {
        if (TransactionId) {
            console.log('Updating existing transaction...');
            const existingTransaction = await BoosterTransaction.findById(TransactionId);
            if (!existingTransaction) {
                console.log('Transaction not found.');
                return res.status(404).json({ message: "Transaction not found with the given TransactionId." });
            }

            const booster = await Booster.findById(existingTransaction.BoosterId);
            if (!booster) {
                console.log('Booster not found.');
                return res.status(404).json({ message: "Booster not found with the given BoosterId." });
            }

            const boosterDurationInMs = booster.BoosterDuration * 60000;
            const startTime = new Date(BoosterStart);
            const boosterEndTime = new Date(startTime.getTime() + boosterDurationInMs);

            console.log('Booster Start:', BoosterStart);
            console.log('Booster End:', boosterEndTime);

            existingTransaction.BoosterStart = BoosterStart;
            existingTransaction.BoosterEnd = boosterEndTime;
            existingTransaction.Status = 'active';

            const updatedTransaction = await existingTransaction.save();
            const currentTime = new Date();
            const timeUntilEnd = boosterEndTime.getTime() - currentTime.getTime();

            setTimeout(async () => {
                const transactionToUpdate = await BoosterTransaction.findById(TransactionId);
                if (transactionToUpdate && transactionToUpdate.Status === 'active') {
                    transactionToUpdate.Status = 'completed';
                    await transactionToUpdate.save();
                    console.log(`Booster transaction ${TransactionId} marked as completed.`);
                }
            }, timeUntilEnd);

            return res.status(200).json({
                message: 'Transaction updated with BoosterStart, BoosterEnd, and status set to active.',
                data: updatedTransaction
            });

        } else {
            console.log('Creating new transaction...');
            if (!userId || !BoosterId || !Amount) {
                return res.status(401).json("All fields are mandatory.");
            }

            const booster = await Booster.findById(BoosterId);
            if (!booster) {
                console.log('Booster not found.');
                return res.status(404).json({ message: "Booster not found with the given BoosterId." });
            }

            const newBoosterTransaction = new BoosterTransaction({
                BoosterId,
                userId,
                BoosterName: booster.BoosterName,
                Amount
            });

            const createdTransaction = await newBoosterTransaction.save();
            return res.status(200).json({
                message: "Transaction created successfully.",
                data: createdTransaction
            });
        }
    } catch (error) {
        console.error('Error occurred:', error);
        return res.status(500).json({
            message: "Failed to process the transaction.",
            error: error.message
        });
    }
};


const getboosterTransactions = async (req, res) => {
    try {
        const boosterTransactions = await BoosterTransaction.find();
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

module.exports = { boostertransaction, getboosterTransactions, getBoosterSetting, getAllBoosters, getBoostersTransactionsByUserId } 