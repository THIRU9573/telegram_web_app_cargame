import React, { useState, useEffect ,useContext} from "react";
import { MyContext } from "../../context/Mycontext";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  Card,
  CardMedia,
  CircularProgress,
} from "@mui/material";
import { Telegram } from "@mui/icons-material";
import {
  AllTasks,
  AllAds,
  CompleteTask,
  CompleteAd,
  GetCompletedTasks,
} from "../../ApiConfig";
import { useNavigate } from "react-router-dom";
import coin from "../../assets/coin.png";
import { useUser } from "../../context/UserContext";

export default function TasksPage() {
  const [ads, setAds] = useState([]);
  const [adError, setAdError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTaskType, setSelectedTaskType] = useState("Main Task");
  const [completedTasks, setCompletedTasks] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [activeAdId, setActiveAdId] = useState(null);
  const [adCountdown, setAdCountdown] = useState(0);
  const userId = localStorage.getItem("userId");
  const {data} = useContext(MyContext);
  const { updateUserBalance } = useUser();

  const fetchData = async () => {
    console.log("datainTasks",data);
    
    const upToken = localStorage.getItem("upToken");
    if (!upToken) {
      setError("Unauthorized: No authentication token found.");
      setLoading(false);
      return;
    }

    try {
      // First fetch completed tasks
      let completedTaskIds = [];
      try {
          const userId = localStorage.getItem("userId");
        const completedTasksResponse = await axios.get(`${GetCompletedTasks}/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("upToken")}` },
        });
        completedTaskIds = completedTasksResponse.data.completedTasks?.map(task => task.taskId) || [];
      } catch (error) {
        // If no completed tasks found (404) or other error, continue with empty array
        console.log("No completed tasks found or error fetching completed tasks");
        completedTaskIds = [];
      }

      // Then fetch all tasks
      const tasksResponse = await axios.get(`${AllTasks}/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("upToken")}` },
      });

      // Mark tasks as completed based on the completed tasks data
      const updatedTasks = tasksResponse.data.allTasks.map(task => ({
        ...task,
        status: completedTaskIds.includes(task._id) ? "completed" : task.status
      }));

      setTasks(updatedTasks);

      // Calculate completed tasks for the selected type
      const completed = updatedTasks.filter(
        (task) =>
          task.TaskName === selectedTaskType && task.status === "completed"
      ).length;
      setCompletedTasks(completed);

      // Fetch ads
      const adsResponse = await axios.get(`${AllAds}/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("upToken")}` },
      });

      const adsData = adsResponse.data.data || adsResponse.data.ads || adsResponse.data;
      console.log("adsData",adsData);

      if (Array.isArray(adsData)) {
        // Mark ads as completed if they exist in completed tasks
        const updatedAds = adsData.map(ad => ({
          ...ad,
          status: completedTaskIds.includes(ad._id) ? "completed" : ad.status
        }));
        setAds(updatedAds);
      } else {
        setAdError("Invalid ads data format received from server");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch data.");
      setAdError("Failed to fetch ads");
    } finally {
      setLoading(false);
    }
  };

 const completeTask = async (taskId) => {
    const upToken = localStorage.getItem("upToken");
      const userId = localStorage.getItem("userId");

    const task = tasks.find((t) => t._id === taskId);

    if (!task) return;

    try {
      // Make API call first
      const response = await axios.post(
        `${CompleteTask}/${userId}`,
        {
          taskId: task._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("upToken")}`,
          },
        }
      );

      // Wait for the API response before updating UI
      if (response.data.success || response.status === 200) {
        // Update tasks state with the new status
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t._id === taskId ? { ...t, status: "completed" } : t
          )
        );

        // Update completed tasks count
        setCompletedTasks((prevCount) => {
          const newCount = tasks.filter(
            (t) => 
              (t._id === taskId || t.status === "completed") && 
              t.TaskName === selectedTaskType
          ).length;
          return newCount;
        });

        // Update global balance state
        // await updateUserBalance();

        // Dispatch event for legacy components
        window.dispatchEvent(
          new CustomEvent("pointsUpdated", {
            detail: { points: task.Rewardpoints },
          })
        );

        // Refresh completed tasks from server
        await fetchCompletedTasks();

        return task.Rewardpoints;
      } else {
        throw new Error("Task completion failed");
      }
    } catch (error) {
      console.error("Error completing task:", error);
      // Revert any UI changes if the API call failed
      await fetchCompletedTasks();
      return 0;
    }
  };


  const completeAd = async (adId) => {
      const userId = localStorage.getItem("userId");
    const upToken = localStorage.getItem("upToken");
    const ad = ads.find((a) => a._id === adId);

    if (!ad) return;

    // Immediately update the UI
    setAds((prevAds) =>
      prevAds.map((a) => (a._id === adId ? { ...a, status: "completed" } : a))
    );

    try {
      const response = await axios.post(
        `${CompleteAd}/${userId}`,
        {
          AdId: ad._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("upToken")}`,
          },
        }
      );

      // Update global balance state
      updateUserBalance();

      // Dispatch event for legacy components
      window.dispatchEvent(
        new CustomEvent("pointsUpdated", {
          detail: { points: ad.Rewardpoints },
        })
      );

      return ad.Rewardpoints;
    } catch (error) {
      console.error("Error completing ad:", error);
      // Rollback if API fails
      setAds((prevAds) =>
        prevAds.map((a) => (a._id === adId ? { ...a, status: "pending" } : a))
      );
      return 0;
    }
  };

  const fetchCompletedTasks = async () => {
      const userId = localStorage.getItem("userId");
    const upToken = localStorage.getItem("upToken");
    if (!upToken) {
      setError("Unauthorized: No authentication token found.");
      return;
    }

    try {
      let completedTaskIds = [];
      try {
        const response = await axios.get(`${GetCompletedTasks}/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("upToken")}` },
        });
        const completedTasks = response.data.completedTasks || [];
        completedTaskIds = completedTasks.map((task) => task.taskId);
      } catch (error) {
        // If no completed tasks found (404) or other error, continue with empty array
        console.log("No completed tasks found or error fetching completed tasks");
        completedTaskIds = [];
      }

      // Update both tasks and ads atomically
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) =>
          completedTaskIds.includes(task._id)
            ? { ...task, status: "completed" }
            : task
        );

        // Update completed tasks count
        const completedCount = updatedTasks.filter(
          (task) =>
            completedTaskIds.includes(task._id) &&
            task.TaskName === selectedTaskType
        ).length;
        
        // Update completed tasks count
        setCompletedTasks(completedCount);

        return updatedTasks;
      });

      // Update ads completion status
      setAds((prevAds) => {
        return prevAds.map((ad) =>
          completedTaskIds.includes(ad._id)
            ? { ...ad, status: "completed" }
            : ad
        );
      });

    } catch (error) {
      // Only set error for non-404 errors
      if (error.response?.status !== 404) {
        console.error("Error fetching completed tasks:", error);
        setError(error.response?.data?.message || "Failed to fetch completed tasks.");
      }
    }
  };

  useEffect(() => {
    fetchData();
    fetchCompletedTasks();

    const initialAdTimer = setTimeout(() => {
      if (window.show_8844872 && typeof window.show_8844872 === "function") {
        window
          .show_8844872()
          .catch((e) => console.error("Initial ad error:", e));
      }
    }, 5000);

    return () => clearTimeout(initialAdTimer);
  }, []);

  // Handle task countdown
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && activeTaskId) {
      completeTask(activeTaskId);
      setActiveTaskId(null);

      if (window.show_8844872 && typeof window.show_8844872 === "function") {
        window
          .show_8844872()
          .catch((e) => console.error("Post-task ad error:", e));
      }
    }
    return () => clearTimeout(timer);
  }, [countdown, activeTaskId]);

  // Handle ad countdown
  useEffect(() => {
    let timer;
    if (adCountdown > 0) {
      timer = setTimeout(() => setAdCountdown(adCountdown - 1), 1000);
    } else if (adCountdown === 0 && activeAdId) {
      const ad = ads.find((a) => a._id === activeAdId);
      completeAd(activeAdId).then(() => {});
      setActiveAdId(null);

      if (window.show_8844872 && typeof window.show_8844872 === "function") {
        window
          .show_8844872()
          .catch((e) => console.error("Post-ad ad error:", e));
      }
    }
    return () => clearTimeout(timer);
  }, [adCountdown, activeAdId]);

  // Add new useEffect for page visibility
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        // Refresh tasks and completed tasks when page becomes visible
        await fetchData();
        await fetchCompletedTasks();
        
        if (window.show_8844872 && typeof window.show_8844872 === "function") {
          window
            .show_8844872()
            .catch((e) => console.error("Visibility ad error:", e));
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      const completed = tasks.filter(
        (task) =>
          task.TaskName === selectedTaskType && task.status === "completed"
      ).length;
      setCompletedTasks(completed);
    }
  }, [selectedTaskType, tasks]);

  // Add useEffect for periodic refresh with shorter interval
  useEffect(() => {
    // Initial fetch
    fetchData();

    const refreshInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchCompletedTasks();
      }
    }, 5000); // Refresh every 5 seconds when page is visible

    return () => clearInterval(refreshInterval);
  }, []);

  const filteredTasks = tasks.filter(
    (task) => task.TaskName === selectedTaskType
  );

  const totalTasks = filteredTasks.length;
  const completedCount = filteredTasks.filter(
    (task) => task.status === "completed"
  ).length;
  const progress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  const handleTaskClick = async (task) => {
    if (task.status === "completed") return;

    try {
      if (window.show_8692316 && typeof window.show_8692316 === "function") {
        await window.show_8692316();
      }
      
      // For Main Tasks and String Tasks, complete immediately after ad
      if (task.TaskName === "Main Task" || task.TaskName === "String Task") {
        await completeTask(task._id);
      } else {
        // For Other Tasks, show countdown
        setActiveTaskId(task._id);
        setCountdown(15);
      }
    } catch (error) {
      if (task.TaskName === "Main Task" || task.TaskName === "String Task") {
        await completeTask(task._id);
      } else {
        setActiveTaskId(task._id);
        setCountdown(15);
      }
    }
  };

  const handleAdClick = async (ad) => {
    if (activeAdId || activeTaskId) return;

    try {
      if (window.show_8692316 && typeof window.show_8692316 === "function") {
        await window.show_8692316();
      }
      // Complete the ad first
      await completeAd(ad._id);
      // Then set up the countdown timer
      setActiveAdId(ad._id);
      const timerInSeconds = (ad.AdTimer_InMinutes || 0.5) * 60; // Default to 30 seconds if not provided
      setAdCountdown(Math.floor(timerInSeconds));
    } catch (error) {
      console.error("Error handling ad click:", error);
      // Set up countdown even if there's an error
      setActiveAdId(ad._id);
      const timerInSeconds = (ad.AdTimer_InMinutes || 0.5) * 60;
      setAdCountdown(Math.floor(timerInSeconds));
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        backgroundColor: "#121212",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backdropFilter: "blur(12px)",
        alignItems: "center",
        minHeight: "100vh",
        width: "100vw",
        overflow: "auto",
        padding: { xs: "15px 10px", sm: "20px 15px", md: "40px 20px" },
        boxSizing: "border-box",
        top: 0,
        left: 0,
        flexDirection: "column",
        gap: { xs: "15px", sm: "20px" },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: "600px" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
          margin: 0,
          // padding: 0,
          marginTop: { xs: "40px", sm: "60px" },
          marginBottom: { xs: "70px", md: "80px" },
        }}
      >
        {/* Header and Progress Bar */}
        <Typography
          variant="h4"
          sx={{
            color: "#41B3C8",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: { xs: "1.5rem", sm: "2rem" },
            fontFamily: "Metal Mania",
            margin: 0,
            pt: { xs: 1, sm: 2 },
          }}
        >
          Task Completion {completedTasks}/{totalTasks}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            width: "100%",
             height: { xs: 8, sm: 10 },
            borderRadius: "5px",
            backgroundColor: "#3e3e3e",
            "& .MuiLinearProgress-bar": { backgroundColor: "#41B3C8" },
            margin: 0,
          }}
        />
        {/* Task Type Selector Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: { xs: "8px", sm: "12px" },
            backgroundColor: "#031A27",
            margin: 0,
            width: { xs: "95%", sm: "90%" },
            height: { xs: "60px", sm: "73px" },
            border: "3px solid #074258",
            padding: { xs: "8px", sm: "10px" },
            borderRadius: "10px 3px 10px 3px",
          }}
        >
          <Button
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: "#041821",
              border: "3px solid #0C3648",
              borderRadius: "6px",
              padding: { xs: "8px 5px", sm: "10px 7px" },
              fontFamily: "Inter",
              fontWeight: 600,
                              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
              color: "#3A9FD0",
              gap: "10px",
              "&:hover": {
                backgroundColor: "#094159",
                border: "3px solid #41B3C8",
                borderRadius: "6px",
              },
              py: 1.5,
              margin: 0,
            }}
            onClick={() => setSelectedTaskType("Main Task")}
          >
            MAIN
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: "#041821",
              border: "3px solid #0C3648",
              borderRadius: "6px",
              padding: "10px 7px 10px 7px",
              fontFamily: "Inter",
              fontWeight: 600,
                              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
              color: "#3A9FD0",
              gap: "10px",
              "&:hover": {
                backgroundColor: "#094159",
                border: "3px solid #41B3C8",
                borderRadius: "6px",
              },
              py: 1.5,
              margin: 0,
            }}
            onClick={() => setSelectedTaskType("Other Task")}
          >
            OTHER
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: "#041821",
              border: "3px solid #0C3648",
              borderRadius: "6px",
              // padding: "5px 3px 5px 3px",
              fontFamily: "Inter",
              fontWeight: 600,
                              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
              color: "#3A9FD0",
              gap: 6,
              "&:hover": {
                backgroundColor: "#094159",
                border: "3px solid #41B3C8",
                borderRadius: "6px",
              },
              py: 1.5,
              margin: 0,
            }}
            onClick={() => setSelectedTaskType("String Task")}
          >
            STRING
          </Button>
        </Box>

        {/* Show only the relevant section based on selectedTaskType */}
        {selectedTaskType === "Other Task" ? (
          <Box
            sx={{
              // backgroundColor: "#212121",
              borderRadius: 2,
              width: "100%",
              margin: 0,
              mb: 2,
            }}
          >
            <List
              sx={{
                backgroundColor: "#041821",
                padding: { xs: "8px 5px", sm: "10px 7px" },
                fontFamily: "Inter",
                fontWeight: 600,
                              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                color: "#3A9FD0",
                gap: { xs: "8px", sm: "10px" },
                py: { xs: 1, sm: 1.5 },
                margin: 0,
              }}
            >
              {ads.map((ad, index) => (
                <React.Fragment key={index}>
                  {/* Border Wrapper with less curved clip-path */}
                  <Box
                    sx={{
                      clipPath:
                        "polygon(3% 0%, 97% 0%, 100% 7%, 100% 93%, 97% 100%, 3% 100%, 0% 93%, 0% 7%)",
                      backgroundColor: "#0C3648",
                      padding: "4px",
                      borderRadius: "6px",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "#41B3C8",
                      },
                    }}
                  >
                    {/* Inner Content Box */}
                    <Box
                      sx={{
                        clipPath:
                          "polygon(3% 0%, 97% 0%, 100% 7%, 100% 93%, 97% 100%, 3% 100%, 0% 93%, 0% 7%)",
                        backgroundColor: "#041821",
                        borderRadius: "6px",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#094159",
                        },
                      }}
                    >
                      <ListItem
                        sx={{
                          padding: { xs: "8px 5px", sm: "10px 7px" },
                          fontFamily: "Inter",
                          fontWeight: 600,
                              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                          color: "#3A9FD0",
                          gap: { xs: "8px", sm: "10px" },
                          py: { xs: 1, sm: 1.5 },
                          margin: 0,
                          position: "relative",
                        }}
                        onClick={() => handleAdClick(ad)}
                      >
                        {/* Countdown Overlay */}
                        {activeAdId === ad._id && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: "rgba(0,0,0,0.5)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 1,
                            }}
                          >
                            {/* <CircularProgress
                              variant="determinate"
                              value={
                                ((ad.AdTimer_InMinutes * 60 - adCountdown) /
                                  (ad.AdTimer_InMinutes * 60)) *
                                100
                              }
                              size={{ xs: 50, sm: 60 }}
                              thickness={4}
                              sx={{ color: "#FFC107" }}
                            /> */}
                            <Typography
                              variant="h6"
                              sx={{
                                position: "absolute",
                                color: "white",
                                fontWeight: "bold",
                              }}
                            >
                              {adCountdown}s
                            </Typography>
                          </Box>
                        )}

                        {/* Image Wrapper with Border */}
                        <Box
                          sx={{
                            width: { xs: "50px", sm: "60px" },
                            height: { xs: "50px", sm: "60px" },
                            minWidth: { xs: "50px", sm: "60px" },
                            backgroundColor: "#0C3648",
                            clipPath:
                              "polygon(3% 0%, 97% 0%, 100% 7%, 100% 93%, 97% 100%, 3% 100%, 0% 93%, 0% 7%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            p: "3px",
                          }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              backgroundColor: "#041821",
                              clipPath:
                                "polygon(3% 0%, 97% 0%, 100% 7%, 100% 93%, 97% 100%, 3% 100%, 0% 93%, 0% 7%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                            }}
                          >
                            <CardMedia
                              component="img"
                              alt={ad.AdName}
                              height="80%"
                              image={ad.AdImage}
                              sx={{
                                objectFit: "cover",
                                width: "100%",
                                height: "80%",
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Ad Name */}
                        <Typography
                          variant="body1"
                          sx={{
                            color: "white",
                            fontWeight: "bold",
                            flexGrow: 1,
                            textAlign: "center",
                            zIndex: 0,
                            px: 2,
                          }}
                        >
                          {ad.AdName}
                        </Typography>

                        {/* Points Button */}
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor: "#041821",
                            border: "3px solid #0C3648",
                            borderRadius: "6px",
                            padding: "10px 7px",
                            fontFamily: "Inter",
                            fontWeight: 600,
                              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                            color: "#3A9FD0",
                            gap: "10px",
                            "&:hover": {
                              backgroundColor: "#094159",
                              border: "3px solid #41B3C8",
                            },
                            py: 1.5,
                            margin: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "110px",
                          }}
                        >
                          <img
                            src={coin}
                            alt="coin"
                            style={{ width: "24px", marginRight: "8px" }}
                          />
                          {ad.Rewardpoints}
                        </Button>
                      </ListItem>
                    </Box>
                  </Box>

                  {index !== ads.length - 1 && (
                    <Divider
                      sx={{ backgroundColor: "rgba(255,255,255,0.2)", my: 1 }}
                    />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Box>
        ) : (
          <Box
            sx={{
              // backgroundColor: "#212121",
              borderRadius: 2,
              width: "100%",
              margin: 0,
              mb: 2,
            }}
          >
        

            <List 
            sx={{
                backgroundColor: "#041821",
                padding: { xs: "8px 5px", sm: "10px 7px" },
                fontFamily: "Inter",
                fontWeight: 600,
                              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                color: "#3A9FD0",
                gap: { xs: "8px", sm: "10px" },
                py: { xs: 1, sm: 1.5 },
                margin: 0,
              }}>
              {filteredTasks.map((task, index) => (
                <React.Fragment key={index}>
                  {/* Border Wrapper with less curved clip-path */}
                  <Box
                    sx={{
                      clipPath:
                        "polygon(3% 0%, 97% 0%, 100% 7%, 100% 93%, 97% 100%, 3% 100%, 0% 93%, 0% 7%)",
                      backgroundColor: "#0C3648",
                      padding: "4px",
                      borderRadius: "6px",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "#41B3C8",
                      },
                    }}
                  >
                    {/* Inner Content Box */}
                    <Box
                      sx={{
                        clipPath:
                          "polygon(3% 0%, 97% 0%, 100% 7%, 100% 93%, 97% 100%, 3% 100%, 0% 93%, 0% 7%)",
                        backgroundColor: "#041821",
                        borderRadius: "6px",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#094159",
                        },
                      }}
                    >
                      <ListItem
                        sx={{
                          padding: { xs: "8px 5px", sm: "10px 7px" },
                          fontFamily: "Inter",
                          fontWeight: 600,
                              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                          color: "#3A9FD0",
                          gap: { xs: "8px", sm: "10px" },
                          py: { xs: 1, sm: 1.5 },
                          margin: 0,
                          position: "relative",
                        }}
                        onClick={() =>
                          task.status !== "completed" && handleTaskClick(task)
                        }
                      >
                        {/* Countdown Overlay */}
                        {activeTaskId === task._id && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: "rgba(0,0,0,0.5)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 1,
                            }}
                          >
                            {/* <CircularProgress
                              variant="determinate"
                              value={(15 - countdown) * (100 / 15)}
                              size={60}
                              thickness={4}
                              sx={{ color: "#FFC107" }}
                            /> */}
                            <Typography
                              variant="h6"
                              sx={{
                                position: "absolute",
                                color: "white",
                                fontWeight: "bold",
                              }}
                            >
                              {countdown}s
                            </Typography>
                          </Box>
                        )}

                        {/* Image Wrapper with Border */}
                        <Box
                          sx={{
                            width: { xs: "50px", sm: "60px" },
                            height: { xs: "50px", sm: "60px" },
                            minWidth: { xs: "50px", sm: "60px" },
                            backgroundColor: "#0C3648",
                            clipPath:
                              "polygon(3% 0%, 97% 0%, 100% 7%, 100% 93%, 97% 100%, 3% 100%, 0% 93%, 0% 7%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            p: "3px",
                          }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              backgroundColor: "#041821",
                              clipPath:
                                "polygon(3% 0%, 97% 0%, 100% 7%, 100% 93%, 97% 100%, 3% 100%, 0% 93%, 0% 7%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                            }}
                          >
                            <CardMedia
                              component="img"
                              alt={task.TaskName}
                              height="80%"
                              image={task.TaskImage}
                              sx={{
                                objectFit: "cover",
                                width: "100%",
                                height: "80%",
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Task Name */}
                        <Typography
                          variant="body1"
                          sx={{
                            color: "white",
                            fontWeight: 1000,
                            fontFamily: "Inter",
                              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                            flexGrow: 1,
                            textAlign: "center",
                            zIndex: 0,
                            px: { xs: 1, sm: 2 },
                          }}
                        >
                          {task.TaskName}
                        </Typography>

                        {/* Points Button */}
                        {task.status === "completed" ? (
                          <Box
                            sx={{
                              backgroundColor: "#094159",
                              borderRadius: "6px",
                              padding: { xs: "8px 5px", sm: "10px 7px" },
                              fontFamily: "Inter",
                              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",                              
                              border: "3px solid #41B3C8",
                              animation: "glow 1.5s infinite alternate",
                              minWidth: { xs: "90px", sm: "110px" },
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{ color: "white", fontWeight: "bold" }}
                            >
                              CLAIMED
                            </Typography>
                          </Box>
                        ) : (
                          <Button
                            variant="contained"
                            sx={{
                              backgroundColor: "#041821",
                              border: "3px solid #0C3648",
                              borderRadius: "6px",
                              padding: { xs: "8px 5px", sm: "10px 7px" },
                              fontFamily: "Inter",
                              fontWeight: 600,
                              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                              color: "#3A9FD0",
                              gap: "10px",
                              "&:hover": {
                                backgroundColor: "#094159",
                                border: "3px solid #41B3C8",
                              },
                              py: 1.5,
                              margin: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: { xs: "90px", sm: "110px" },
                            }}
                          >
                            <img
                              src={coin}
                              alt="coin"
                              style={{ width: "24px", marginRight: "8px" }}
                            />
                            {task.Rewardpoints}
                          </Button>
                        )}
                      </ListItem>
                    </Box>
                  </Box>

                  {index !== filteredTasks.length - 1 && (
                    <Divider
                      sx={{ backgroundColor: "rgba(255,255,255,0.2)", my: 1 }}
                    />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </Box>
  );
}
