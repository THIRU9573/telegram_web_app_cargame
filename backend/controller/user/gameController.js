const mongoose = require("mongoose");
const User = require("../../models/userSchema");
const GameHistory = require("../../models/gameHistorySchema")
const GameController = require("../../models/GameSchema")


const placeBet = async (req, res) => {
  try {
    // Extract userId from the request parameters and gameId, betAmount from the request body
    const userId = req.params._id;
    const { gameId, betAmount, playedStatus, winAmount, gameHistoryId } = req.body;


    // Find user in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const game = await GameController.findById(gameId);
    // if(!game){
    //   return res.status(404).json({success:false,message : "game not found"});
    // }


    // Step 1: Place Bet (Create Game History)**
    if (!gameHistoryId) {
      // Validate required fields for placing a bet
      if (!gameId || !betAmount) {
        return res.status(400).json({ success: false, message: "Missing required fields for placing a bet" });
      }

      if (betAmount <= 0) {
        return res.status(400).json({ success: false, message: "Invalid bet amount" });
      }

      // Check if user has enough balance
      if (user.ticketBalance < betAmount) {
        return res.status(400).json({ success: false, message: "Insufficient balance" });
      }

      // Store initial balance before deduction
      const initialbalance = user.ticketBalance;

      // Deduct bet amount from user
      user.ticketBalance -= betAmount;
      await user.save();

      console.log("Bet placed, Updated user balance is:", user.ticketBalance);

      const username = user.username;

      const gameTitle = game.gameTitle

      // Create game history entry
      const gameHistory = new GameHistory({
        userId,
        username,
        gameTitle,
        initiated: new Date(),
        initialbalance,
        betAmount,
        winAmount: 0,
        playedStatus: "PENDING", // Default value, will be updated later
        finalbalance: user.ticketBalance,
        gameId: game._id, // Store gameId in history
      });

      await gameHistory.save();

      return res.status(200).json({
        success: true,
        message: "Your Bet placed successfully, Waiting for your game result...",
        data: {
          gameHistoryId: gameHistory._id, // Send gameHistoryId for future updates
          gameTitle,
          betAmount,
        },
      });
    }

    // Step 2: Update Game History with Result**
    else {
      // Validate required fields for updating the result
      if (!playedStatus || winAmount === undefined) {
        return res.status(400).json({ success: false, message: "Missing required fields for game result update" });
      }

      // Ensure playedStatus is either "WON" or "LOSE"
      if (!["WON", "LOSE"].includes(playedStatus)) {
        return res.status(400).json({ success: false, message: "Invalid playedStatus value" });
      }

      // Find the game history entry to update
      const gameHistory = await GameHistory.findById(gameHistoryId);
      if (!gameHistory) {
        return res.status(404).json({ success: false, message: "Game history not found" });
      }

      // Find user again (could also be done earlier to avoid redundancy)
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // If the user won, add winnings to their balance
      if (playedStatus === "WON") {
        user.ticketBalance += winAmount;
      }

      // Save updated user balance
      await user.save();

      // Update game history with result
      gameHistory.playedStatus = playedStatus;
      gameHistory.winAmount = winAmount;
      gameHistory.finalbalance = user.ticketBalance;

      await gameHistory.save();

      console.log("Game history updated:", gameHistory);

      return res.status(200).json({
        success: true,
        message: "Game result updated successfully.",
        data: {
          gameTitle: gameHistory.gameTitle,
          betAmount: gameHistory.betAmount,
          winAmount: gameHistory.winAmount,
          finalbalance: user.ticketBalance,
          playedStatus: gameHistory.playedStatus,
        },
      });
    }
  } catch (error) {
    console.error("❌ Error in placeOrUpdateGameHistory:", error);
    return res.status(500).json({ success: false, message: "Unable to process game history", error: error.message });
  }
};


const gameHistory = async (req, res) => {
  try {
    console.log("🔍 Request Params:", req.params);

    const userId = req.params._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    console.log("🔍 Fetching game history for userId:", userId);

    // Ensure userId is in ObjectId format
    const historyRecords = await GameHistory.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ initiated: -1 });

    console.log("🔍 Query Result:", historyRecords);

    if (!historyRecords.length) {
      return res.status(200).json({ message: "No game history found", history: [] });
    }

    return res.status(200).json({
      message: `Game history retrieved successfully for this userId - ${userId}`,
      no_of_times_played_by_user: historyRecords.length,
      history: historyRecords
    });

  } catch (error) {
    console.error("❌ Error fetching game history:", error);
    return res.status(500).json({ message: "Unable to get Game history" });
  }
};


const getUserSingleGame = async (req, res) => {
  try {
    const gameId = req.params;  // gameId from the URL parameters
    console.log("gameId", gameId);


    // Find the game by ID
    const game = await GameController.findById(gameId);
    if (!game) {
      return res.status(404).json({ success: false, message: `Game with ID ${gameId} not found` });
    }

    // Assign gameTitle from the game object
    const gameTitle = game.gameTitle;

    return res.status(200).json({
      success: true,
      message: `${gameTitle} fetched successfully...`,
      data: game
    });

  } catch (error) {
    console.error("Error in fetching level:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch game level" });
  }
};


module.exports = { placeBet,getUserSingleGame, gameHistory }