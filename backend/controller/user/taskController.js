const mongoose = require("mongoose");
const Task = require("../../models/taskSchema");
const User = require("../../models/userSchema");
const CompletedTask = require("../../models/completedTaskSchema");
const AdsData = require("../../models/AdsSchema");
const CompleteAdData = require("../../models/CompleteAdSchema");

// Get Task by ID or All Tasks for a User
const getUserTask = async (req, res) => {
  const userId = req.params._id
  try {
    const allTasks = await Task.find();

    if (!allTasks || allTasks.length === 0) {
      return res.status(404).json({ message: "No tasks found" });
    }

    return res.status(200).json({
      message: "All tasks fetched successfully",
      allTasks,
      length: allTasks.length,
    });
  } catch (error) {
    console.error("Error in getUserTask:", error);
    res.status(500).json({ message: "Unable to fetch tasks", error });
  }
};


const CompleteUserTask = async (req, res) => {
  const userId = req.params._id; // userId from the request body
  const { taskId } = req.body; // taskId from the URL parameters

  try {
    if (!taskId || !userId) {
      return res.status(404).json({ message: "required taskId and userId" });
    }

    // Step 1: Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Step 2: Check if the user has already completed this task
    const existingCompletion = await CompletedTask.findOne({ taskId, userId });
    if (existingCompletion) {
      return res
        .status(400)
        .json({ message: "Task already completed by this user" });
    }

    // Step 3: Get the user details
    const user = await User.findById(userId); // Fetch the user by userId
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 4: Store the initial balance of the user
    const InitialBalance = user.ticketBalance;

    // Step 5: Add RewardPoints to the user's `ticketBalance`
    const pointsToAdd = task.Rewardpoints;
    await User.findByIdAndUpdate(userId, {
      $inc: { ticketBalance: pointsToAdd },
    });
    // Step 6: Get the updated user details (final balance)
    const updatedUser = await User.findById(userId);

    // Step 7: Save task completion record in a separate collection
    const completedTask = new CompletedTask({
      taskId,
      userId,
      username: user.username,
      TaskName: task.TaskName, // Assuming task has a TaskName field
      Rewardpoints: pointsToAdd,
      Status: "completed", // Task completion status
      CompletionTime: new Date(),
      InitialBalance, // Add initial balance here
      FinalBalance: updatedUser.ticketBalance, // Add final balance here
    });

    // Debugging log
    console.log("Saving completed task:", completedTask);

    // Save the completed task record in the database
    await completedTask.save();

    // Step 8: Send a successful response with initial and final balance
    return res.status(200).json({
      message: "Task completed successfully, Points added to user account....",
      taskId,
      userId,
      username: user.username,
      TaskName: task.TaskName,
      Rewardpoints: pointsToAdd,
      InitialBalance, // Add initial balance here
      FinalBalance: updatedUser.ticketBalance, // Add final balance here
      Status: "completed",
      CompletionTime: new Date(),
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error in CompleteTask:", error);

    // Send failure response with the error message
    return res.status(500).json({
      message: "Unable to complete task",
      error: error.message, // Send the specific error message to the client
    });
  }
};

const getUserCompletedTasks = async (req, res) => {
  const userId = req.params._id; // Accept userId or taskId as filters
  try {
    // Fetch completed tasks with optional filters
    const completedTasks = await CompletedTask.find({ userId });

    if (!completedTasks || completedTasks.length === 0) {
      return res.status(404).json({ message: "No completed tasks found" });
    }

    const totaltaskbonus = await CompletedTask.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalBonus: { $sum: "$Rewardpoints" } } },
    ]);

    const tasksBonus =
      totaltaskbonus.length > 0 ? totaltaskbonus[0].totalBonus : 0;

    return res.status(200).json({
      message: "Completed tasks fetched successfully",
      count: completedTasks.length,
      completedTasks,
      totaltaskbonus: tasksBonus,
    });
  } catch (error) {
    console.error("❌ Error in getCompletedTasks:", error);
    res.status(500).json({ message: "Unable to fetch completed tasks", error });
  }
};

const getUserTasksWithStatus = async (req, res) => {
  const userId = req.params._id; // Accept userId from request params

  try {
    // Fetch all tasks
    const allTasks = await Task.find();

    if (!allTasks || allTasks.length === 0) {
      return res.status(404).json({ message: "No tasks found" });
    }

    // Fetch all completed tasks for the user
    const completedTasks = await CompletedTask.find({ userId });

    // Create a Set of completed task IDs for fast lookup
    const completedTaskIds = new Set(
      completedTasks.map((task) => task.taskId.toString())
    );

    // Map all tasks and check if they are completed
    const userTasksWithStatus = allTasks.map((task) => ({
      TaskId: task._id,
      TaskName: task.TaskName,
      TaskImage: task.TaskImage,
      Rewardpoints: task.Rewardpoints,
      status: completedTaskIds.has(task._id.toString())
        ? "completed"
        : "pending",
    }));

    return res.status(200).json({
      message: "User tasks fetched successfully",
      allTasks: userTasksWithStatus,
      count: userTasksWithStatus.length,
    });
  } catch (error) {
    console.error("Error in getUserTasksWithStatus:", error);
    res.status(500).json({ message: "Unable to fetch tasks", error });
  }
};

const CompleteUserAd = async (req, res) => {
  // Destructure properties from req.body safely
  const userId = req.params._id;
  const AdId = req.body.AdId; // Default to empty object if req.body is undefined

  // Check if userId or adId is missing in the request body
  if (!userId || !AdId) {
    return res.status(400).json({ message: "userId and adId are required." });
  }
  console.log(AdId, userId);

  try {
    // Check if the ad exists
    const ad = await AdsData.findById(AdId);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    // // Check if the user has already completed this ad
    // const existingCompletion = await CompleteAdData.findOne({ AdId, userId });
    // if (existingCompletion) {
    //   return res
    //     .status(400)
    //     .json({ message: "Ad already completed by this user" });
    // }

    // Check if enough time has passed since the last claim
    if (ad.claimedAt) {
      const timeDifference = Date.now() - new Date(ad.claimedAt).getTime();
      const timeLimit = ad.AdTimer_InMinutes * 60 * 1000; // Convert time limit to milliseconds

      if (timeDifference < timeLimit) {
        const timeLeft = Math.ceil((timeLimit - timeDifference) / 1000 / 60); // Remaining time in minutes
        return res
          .status(400)
          .json({
            message: `You can claim this ad in next ${timeLeft} minutes.`,
          });
      }
    }

    // Use rewardPoints from the request, or fallback to ad.Rewardpoints
    const pointsToAdd = ad.Rewardpoints;
    console.log("pointsToAdd", pointsToAdd);

    // Fetch the user's current balance (initial balance)
    const user = await User.findById(userId); // Fetch user details
    console.log("user", user, user.ticketBalance);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const InitialBalance = user.ticketBalance;

    // Add rewardPoints (reward points) to the user's balance
    await User.findByIdAndUpdate(userId, {
      $inc: { ticketBalance: pointsToAdd },
    });

    // Fetch the updated user balance (final balance)
    const updatedUser = await User.findById(userId);
    const FinalBalance = updatedUser.ticketBalance;

    // Save ad completion record in the CompletedAd collection
    const completedAd = new CompleteAdData({
      AdId,
      userId,
      username: user.username, // Add username
      AdName: ad.AdName,
      Rewardpoints: pointsToAdd, // Use rewardPoints or ad.Rewardpoints
      InitialBalance,
      FinalBalance,
      Status: "Completed", // Status of the completion
      CompletionTime: new Date(),
    });

    // Debugging log
    console.log("Saving completed ad:", completedAd);

    // Save the completed ad data to the database
    await completedAd.save();

    // Update the ad's AdCount and set the claimedAt timestamp
    ad.AdCount += 1;
    ad.claimedAt = new Date(); // Set the claim time

    // Save the updated ad
    await ad.save();

    // Send a successful response back to the client
    return res.status(200).json({
      message: "Ad completed successfully, points added!",
      AdId,
      userId,
      username: user.username, // Include username
      Rewardpoints: pointsToAdd, // Return the reward points added
      InitialBalance, // Include initial balance
      FinalBalance, // Include final balance
      Status: "Completed",
      CompletionTime: new Date(),
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error in CompleteAd:", error);

    // Send a failure response
    return res
      .status(500)
      .json({ message: "Unable to complete ad", error: error.message });
  }
};

module.exports = {
  getUserTask,
  CompleteUserTask,
  getUserCompletedTasks,
  getUserTasksWithStatus,
  CompleteUserAd,
};
