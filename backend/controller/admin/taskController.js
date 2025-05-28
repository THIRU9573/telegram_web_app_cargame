const User = require("../../models/userSchema"); // Import the Task model
const Task = require("../../models/taskSchema"); // Import the User model (if needed)

const Addtask = async (req, res) => {
    const {
        taskId,
        TaskName,
        Status,
        Rewardpoints,
        TaskImage,
        Description,
        Sitelink,
        Subtask,
        Siteimg
    } = req.body;

    try {
        if (taskId) {
            const task = await Task.findById(taskId);
            console.log(task);

            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }

            // Directly update fields
            task.TaskName = TaskName || task.TaskName;
            task.Status = Status || task.Status;
            task.Rewardpoints = Rewardpoints || task.Rewardpoints;
            task.TaskImage = TaskImage || task.TaskImage;
            task.Description = Description || task.Description;
            task.Sitelink = Sitelink || task.Sitelink;
            task.Subtask = Subtask || task.Subtask;
            task.Siteimg = Siteimg || task.Siteimg;

            // Save updated task
            const updatedTask = await task.save();
            return res.status(200).json({
                message: "Task updated successfully",
                task: updatedTask,
            });
        }

        // Save new task
        const createdTask = await Task.create(req.body);

        return res.status(201).json({
            message: "Task created successfully",
            task: createdTask,
        });

    } catch (error) {
        console.error("❌ Error in Addtask:", error);
        res.status(500).json({ message: "Unable to add or update task", error });
    }
};


// Get Task by ID or All Tasks for a User
const Tasks = async (req, res) => {
    const taskId = req.params.id; // Use query parameters for GET requests

    try {
        // If taskId is provided, fetch the specific task
        if (taskId) {
            const task = await Task.findById(taskId)
            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }

            return res.status(200).json({
                message: "Task fetched successfully",
                task,
            });
        }

        // If neither taskId nor userId is provided, return all tasks
        const allTasks = await Task.find();

        if (!allTasks || allTasks.length === 0) {
            return res.status(404).json({ message: "No tasks found" });
        }

        return res.status(200).json({
            message: "All tasks fetched successfully",
            length: allTasks.length,
            allTasks,
        });
    } catch (error) {
        console.error("Error in getTask:", error);
        res.status(500).json({ message: "Unable to fetch tasks", error });
    }
};


module.exports = { Addtask, Tasks };