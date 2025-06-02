import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import banner from "../../assets/banner.png";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    step: 1,
    title: "Move Car To Avoid Obstacles",
    description: "Touch left or right to dodge enemy cars and potholes",
    borderColor: "#FFA500", // orange
  },
  {
    step: 2,
    title: "Collect Coins To Score Points",
    description: "Drive through coins that appear on the road",
    borderColor: "#8A2BE2", // purple
  },
  {
    step: 3,
    title: "Survive As Long As You Can",
    description: "Avoid all obstacles to keep going and beat high scores",
    borderColor: "#2E8B57", // green
  },
];

function GameInfo() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handlePlayNow = () => {
    // Clear any existing game state from localStorage
    localStorage.removeItem("currentGameHistoryId");
    // Set a flag in localStorage to indicate new game
    localStorage.setItem("isNewGame", "true");
    // Navigate to the game
    navigate("/games/car");
  };

  const handleClose = () => {
    setOpen(false);
    setError("");
  };

  const handlePlayGame = () => {
    if (!amount || parseInt(amount) < 200) {
      setError("Minimum amount to play is 200");
      return;
    }
    if (parseInt(amount) <= 5000) {
      navigate("/games/car");
    } else {
      setError("Insufficient balance");
    }
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    if (error) setError("");
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#121212",
          minHeight: "100vh",
          width: "100vw",
          overflowY: "auto",
          top: 0,
          left: 0,
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Game Banner with relative positioning */}
        <Box
          sx={{
            width: "100%",
            position: "relative",
          }}
        >
          <img
            src={banner}
            alt="Game Banner"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />

          {/* Game Title */}
          <Typography
            variant="h4"
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              top: "20px",
              color: "#41B3C8",
              fontWeight: "bold",
              textAlign: "center",
              fontFamily: "Metal Mania",
              zIndex: 1,
            }}
          >
            String Racing
          </Typography>

          {/* Play Now Button positioned over the banner */}
          <Box
            sx={{
              position: "absolute",
              bottom: "-25px", // Adjust this value to move the button up/down
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
            }}
          >
            <Button
              variant="contained"
              onClick={handlePlayNow}
              sx={{
                backgroundColor: "#041821",
                border: "3px solid #0C3648",
                borderRadius: "20px",
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                color: "#3A9FD0",
                gap: "10px",
                width: "160px",
                "&:hover": {
                  backgroundColor: "#094159",
                  border: "3px solid #41B3C8",
                  borderRadius: "6px",
                },
                py: 1.5,
              }}
            >
              Play Now
            </Button>
          </Box>
        </Box>

        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            color: "white",
            fontWeight: "bold",
            fontSize: { xs: "1.5rem", sm: "1.5rem", md: "1.5rem" },
            fontFamily: "Inter",
            mt: 6, // Increased margin-top to account for the button overlap
            mb: 2,
            textAlign: "center",
            width: "90%",
          }}
        >
          Rules for Playing Game
        </Typography>

        {/* Steps */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom :"80px",
            gap: 2,
            mb: 4,
          }}
        >
          {steps.map((step) => (
            <Box
              key={step.step}
              sx={{
                backgroundColor: "#1f1f1f",
                border: `2px solid ${step.borderColor}`,
                borderRadius: 3,
                p: 1,
                width: "90%",
                position: "relative",
                color: "white",
                boxSizing: "border-box",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: step.borderColor,
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {step.step}
              </Box>
              <Typography
                variant="h6"
                fontWeight="bold"
                align="center"
                mt={2}
                fontFamily="Inter"
                sx={{
                  fontSize: {
                    xs: "1rem", // extra small devices
                    sm: "1.25rem", // small devices
                    md: "1.5rem", // medium and up
                  },
                }}
              >
                {step.title}
              </Typography>
              <Typography
                variant="body2"
                align="center"
                color="#ccc"
                mt={1}
                fontFamily="Inter"
              >
                {step.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

    </>
  );
}

export default GameInfo;
