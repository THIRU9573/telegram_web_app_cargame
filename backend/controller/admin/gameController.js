const mongoose = require("mongoose");
const User = require("../../models/userSchema");
const GameHistory = require("../../models/gameHistorySchema")
const GameController = require("../../models/GameSchema")

const Totalgamehistory = async (req, res) => {
  try {

    const historyRecords = await GameHistory.find().sort({ initiated: -1 });

    if (!historyRecords.length) {
      return res.status(200).json({ message: "No game history found", history: [] });
    }

    return res.status(200).json({
      message: "Game history retrieved successfully",
      length: historyRecords.length,
      history: historyRecords
    });

  } catch (error) {
    console.error(" Error fetching game history:", error);
    return res.status(500).json({ message: "Unable to get Game history" });
  }
};


//creat or update game
const createOrUpdateGame = async (req, res) => {
  try {
    const gameId = req.params._id;
    console.log('gameId:', gameId);
    const {
      gameTitle,
      levelPrice,
      rules,
      withdrawalRules,
      disclaimer,
      min,
      max,
      status,
      level,
      lives,
      adwatchesleft,
      adSDK
    } = req.body;

    let game;

    if (!gameId) {
      // No gameId? Create new game
      game = new GameController({
        gameTitle,
        levelPrice: levelPrice ?? 1.5,
        rules: rules ?? [],
        withdrawalRules: withdrawalRules ?? [],
        disclaimer: disclaimer ?? '',
        min: min ?? 10,
        max: max ?? 30,
        status: status ?? 'ACTIVE',
        level: level ?? [],
        lives,
        adwatchesleft,
        adSDK: adSDK ?? [],
      });

      await game.save();

      return res.status(201).json({ message: 'Game created successfully', game });
    } else {
      // gameId exists? Update existing game
      game = await GameController.findById(gameId);
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }

      // Update fields
      game.gameTitle = gameTitle ?? game.gameTitle;
      game.levelPrice = levelPrice ?? game.levelPrice;
      game.rules = rules ?? game.rules;
      game.withdrawalRules = withdrawalRules ?? game.withdrawalRules;
      game.disclaimer = disclaimer ?? game.disclaimer;
      game.min = min ?? game.min;
      game.max = max ?? game.max;
      game.status = status ?? game.status;
      game.level = level ?? game.level;
      game.lives = lives ?? game.lives;
      game.adwatchesleft = adwatchesleft ?? game.adwatchesleft;
      game.adSDK = adSDK ?? game.adSDK;

      await game.save();

      return res.status(200).json({ message: 'Game updated successfully', game });
    }
  } catch (err) {
    console.error('createOrUpdateGame error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


//get alllevls
const getAllGames = async (req, res) => {
  try {
    // Step 1: Fetch all games from the database
    const allGames = await GameController.find();

    // Step 2: Check if no games were found
    if (!allGames || allGames.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No games found"
      });
    }

    // Step 3: Respond with the games data
    return res.status(200).json({
      success: true,
      message: "All Games fetched successfully.",
      no_of_games: allGames.length,  // Total number of games found
      data: allGames // List of games with their number of levels
    });

  } catch (error) {
    console.error("Error in fetching the games:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch games"
    });
  }
};


//getSingleGameDetails
const getSingleGame = async (req, res) => {
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


module.exports = { Totalgamehistory, getAllGames, getSingleGame, createOrUpdateGame }


