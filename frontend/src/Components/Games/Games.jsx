import React, { useState, useEffect, useCallback,useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../../context/Mycontext";
import {
  Box,
  Typography,
  Grid,
  Card,
  Dialog,
  DialogContent,
  Button,
} from "@mui/material";
// import { ToastContainer, toast } from "react-toastify";
import toast, { Toaster } from "react-hot-toast";
import banner from "../../assets/banner.png";
import reward from "../../assets/reward1.png";
import { DailyReward, UserLogin } from "../../ApiConfig";
import axios from "axios";

function Games() {
  console.log("Games component mounted", new Date().toISOString());

  const navigate = useNavigate();

  // Auth state
  const [isLoginLoading, setIsLoginLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Reward state
  const [open, setOpen] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [activeRewardPoints, setActiveRewardPoints] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isEligibleForReward, setIsEligibleForReward] = useState(true);
const { data, setData } = useContext(MyContext);

  const games = [{ id: 1, title: "String Racing", players: "1M+ players" }];

  const url = window.location.href;
  const urlObj = new URL(url);
  console.log("url", url);
  console.log("urlObj", urlObj);

  // Get Telegram user info
  // const first_name = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name;
  // const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  // const photo_url = window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url;
  // const referalId = urlObj.searchParams.get("tgWebAppStartParam");

  // console.log("referalId", referalId);

  // console.log("Telegram User Info:", { first_name, id, photo_url });
  // console.log("Window Telegram Object:", window.Telegram);

  // Uncomment for testing
  const first_name = "Vamsi Boyana";
  const id = 129999911;
  const photo_url =
    "https://t.me/i/userpic/320/iz6lI6dEqbVuiGYhAu0L_-K3a0th5f5WsCOeHD4UsUg.svg";
  const referalId = 31232423
  console.log("referalId", referalId);

  // Add global error handlers
  useEffect(() => {
    const handleError = (event) => {
      console.error("Window Error:", event.error);
    };

    const handleUnhandledRejection = (event) => {
      console.error("Unhandled Promise Rejection:", event.reason);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  useEffect(() => {
    const inputs = document.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        setTimeout(() => {
          input.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300); // Delay slightly to wait for keyboard
      });
    });
  }, []);

  // Handle login
  const handleLogin = useCallback(async () => {
    console.log("Starting login process...");
    try {
      const response = await axios.post(UserLogin, {
        chatId: id,
        username: first_name,
        profilepic: photo_url,
        // referalId: referalId,
      });

      console.log("Login API Responseeeee:", response);
      console.log("Response Data:", response.data);
      console.log("Response Status:", response.status);

      if (response.status === 200) {
        const receivedToken = response.data.token;
        setData(receivedToken)
        console.log("Received Token:", receivedToken);
        localStorage.setItem("upToken", receivedToken);
        localStorage.setItem("userId", response.data.user.id);

        // Store initial balance
        const initialBalance = response.data.user.points || 0;
        // localStorage.setItem("userBalance", initialBalance.toString());

        // Create and dispatch login success event with balance
        const loginEvent = new CustomEvent("userLoggedIn", {
          detail: {
            points: initialBalance,
            totalPoints: initialBalance,
          },
        });

        // Dispatch events to ensure instant update
        window.dispatchEvent(loginEvent);

        // Force a re-render by dispatching a storage event
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "userBalance",
            newValue: initialBalance.toString(),
            oldValue: "0",
            storageArea: localStorage,
          })
        );

        // Additional event dispatch after a small delay
        setTimeout(() => {
          window.dispatchEvent(loginEvent);
        }, 5);

        setIsAuthenticated(true);
        setIsLoginLoading(false);
        // toast.success("Login successful!");
        console.log("Login successful, state updated");
      } else {
        console.error("Unexpected login status:", response.status);
        toast.error("Unexpected login response");
        setIsLoginLoading(false);
      }
    } catch (error) {
      localStorage.clear();
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Login failed. Please try again.");
      localStorage.clear();
      setIsLoginLoading(false);
    }
  }, [first_name, id, photo_url, referalId]);

  // Check authentication on mount
  useEffect(() => {
    console.log("Checking authentication on mount...");
    const storedToken = data;
    // const storedToken = localStorage.getItem("upToken");
    console.log("Stored token:", storedToken ? "exists" : "not found");

    if (storedToken) {
      console.log("Using stored token for authentication");
      setIsAuthenticated(true);
      setIsLoginLoading(false);
    } else {
      console.log("No stored token found, initiating login");
      handleLogin();
    }
  }, [handleLogin]);

  // Navigation
  const handlePlayNow = () => {
    console.log("Play Now clicked, auth status:", isAuthenticated);
    if (!isAuthenticated) {
      toast.error("Please wait while logging in...");
      return;
    }
    navigate("/gameinfo");
  };

  // Daily reward handlers
  const handleDailyRewardClick = () => {
    console.log("Daily Reward clicked, auth status:", isAuthenticated);
    if (!isAuthenticated) {
      toast.error("Please wait while logging in...");
      return;
    }
    setOpen(true);
  };

  const handleClaimReward = async () => {
    console.log("Claiming reward, auth status:", isAuthenticated);
    if (!isAuthenticated) {
      toast.error("Please wait while logging in...");
      return;
    }
    if (rewardClaimed) {
      toast.info("You already claimed today's reward!");
      return;
    }
    try {
      const userId = localStorage.getItem("userId");
      console.log("context",data);
      
      const token = data;
      console.log("Claiming reward for user:", userId);

      const response = await axios.post(
        `${DailyReward}/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${data}` } }
      );
      console.log("Reward claim response:", response.data);

      if (response.data) {
        if (response.data.message && response.data.message.includes("⏳")) {
          // Handle time remaining case
          const minutesRemaining = parseInt(response.data.message.match(/\d+/)[0]);
          setTimeRemaining(minutesRemaining);
          setIsEligibleForReward(false);
          toast.error(response.data.message);
          return;
        }

        const pointsEarned = response.data.data?.rewardPoints || 0;
        setActiveRewardPoints(pointsEarned);
        toast.success("Reward claimed successfully!");
        setRewardClaimed(true);
        setIsEligibleForReward(false);

        // Get the current balance from the API response or localStorage
        const currentBalance =
          response.data.data?.finalBalance ||
          parseInt(localStorage.getItem("userBalance") || "0");
        const newBalance = currentBalance + pointsEarned;

        // Create and dispatch the points update event
        const pointsUpdateEvent = new CustomEvent("pointsUpdated", {
          detail: {
            points: newBalance,
            totalPoints: newBalance,
          },
        });

        // Dispatch the event multiple times to ensure it's caught
        window.dispatchEvent(pointsUpdateEvent);

        // Force a re-render by dispatching a storage event
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "userBalance",
            newValue: newBalance.toString(),
            oldValue: currentBalance.toString(),
            storageArea: localStorage,
          })
        );

        // Additional event dispatch after a small delay
        setTimeout(() => {
          window.dispatchEvent(pointsUpdateEvent);
        }, 5);
      }
      setOpen(false);
    } catch (error) {
      console.error("Reward claim error:", error.response || error);
      const msg = error.response?.data?.message || "Failed to claim reward";
      if (msg.includes("⏳")) {
        const minutesRemaining = parseInt(msg.match(/\d+/)[0]);
        setTimeRemaining(minutesRemaining);
        setIsEligibleForReward(false);
      }
      toast.error(msg);
      setOpen(false);
    }
  };

  const handleDialogClose = () => setOpen(false);

  // Loading state
  if (isLoginLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: 2,
          backgroundColor: "#121212",
        }}
      >
        {[...Array(3)].map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: "primary.main",
              animation: "bounce 1.4s infinite ease-in-out",
              animationDelay: `${i * 0.16}s`,
              "@keyframes bounce": {
                "0%, 100%": {
                  transform: "translateY(0)",
                },
                "50%": {
                  transform: "translateY(-20px)",
                },
              },
            }}
          />
        ))}
      </Box>
    );
  }

  // Main UI
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
        padding: { xs: "20px 10px", md: "40px 20px" },
        boxSizing: "border-box",
        top: 0,
        left: 0,
        position: "fixed",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* Daily Reward Header */}
      <Card
        sx={{
          padding: "5px",
          backgroundColor: "#041821",
          borderRadius: "16px",
          boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
          backdropFilter: "blur(10px)",
          justifyContent: "space-between",
          textAlign: "center",
          width: { xs: "92%", sm: "92%", md: "92%" },
          height: "50px",
          display: "flex",
          marginTop: { xs: "80px", md: "80px" },
          cursor: "pointer",
        }}
        onClick={handleDailyRewardClick}
      >
        <img
          src={reward}
          alt="reward"
          style={{ width: "50px", height: "auto", marginLeft: "40px" }}
        />
        <Typography
          variant="h6"
          sx={{
            color: "white",
            marginTop: "7px",
            marginRight: "100px",
            fontFamily: "Inter",
            fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
            fontWeight: "bold",
            textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
          }}
        >
          Daily Reward
        </Typography>
      </Card>

      {/* Games Grid */}
      <Grid
        container
        spacing={4}
        sx={{
          maxWidth: "1400px",
          marginBottom: "80px",
          padding: { xs: "10px", md: "20px" },
        }}
      >
        {games.map((game) => (
          <Grid item xs={12} sm={6} md={4} key={game.id}>
            <Box
              sx={{
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                fontFamily: "Inter",
                height: "300px",
                "&:hover": {
                  transform: "translateY(-10px)",
                  boxShadow: "0 15px 30px rgba(0,0,0,0.4)",
                },
                cursor: "pointer",
              }}
              onClick={handlePlayNow}
            >
              <Box
                component="img"
                src={banner}
                alt={game.title}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "brightness(0.7)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "20px",
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    marginBottom: "5px",
                    textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
                  }}
                >
                  {game.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                  }}
                >
                  {game.players}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Daily Reward Dialog */}
      <Dialog
        open={open}
        onClose={handleDialogClose}
        PaperProps={{
          sx: {
            backgroundColor: "#041821",
            color: "white",
            minWidth: "300px",
          },
        }}
      >
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              p: 2,
            }}
          >
            <img
              src={reward}
              alt="Daily Reward"
              style={{ width: "100px", height: "auto" }}
            />
            <Typography variant="h6" sx={{ textAlign: "center" }}>
              {rewardClaimed
                ? `Congratulations! You earned ${activeRewardPoints} points!`
                : isEligibleForReward
                ? "Claim your daily reward!"
                : `Please wait ${timeRemaining} minutes to claim your next reward`}
            </Typography>
            {!rewardClaimed && isEligibleForReward && (
              <Button
                onClick={handleClaimReward}
                variant="contained"
                sx={{
                  backgroundColor: "#041821",
                  border: "3px solid #0C3648",
                  borderRadius: "6px",
                  padding: "10px 20px",
                  fontFamily: "Inter",
                  fontWeight: 400,
                  fontSize: "16px",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#094159",
                    border: "3px solid #41B3C8",
                  },
                }}
              >
                Claim Reward
              </Button>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Games;
