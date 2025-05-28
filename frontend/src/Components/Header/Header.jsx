import * as React from "react";
import axios from "axios";
import { UserProfile } from "../../ApiConfig";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useState, useEffect ,useCallback } from "react";
import { useLocation } from "react-router-dom";
import coin from "../../assets/coin.png";
import Tether from "../../assets/Tether.png"

export default function ButtonAppBar() {
  const [ticketBalance, setTicketBalance] = useState(0);
  const [usdtAmount, setUsdtAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(Date.now());
    const location = useLocation();



// define fetchProfile outside useEffect to reuse
  const fetchProfile = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${UserProfile}/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("stringToken")}` },
      });
      const points = response.data.user.ticketBalance;
      setTicketBalance(points);
      setUsdtAmount(points / 10000);
      setError("");
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError(error.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

useEffect(() => {
  const refreshBalance = () => {
    fetchProfile(); // your existing fetchProfile function to get fresh balance
  };

  window.addEventListener("userLoggedIn", refreshBalance);

  return () => {
    window.removeEventListener("userLoggedIn", refreshBalance);
  };
}, [fetchProfile]);

  useEffect(() => {
    const handlePointsUpdate = (event) => {
      if (event.detail?.points) {
        const newPoints = event.detail.points;
        setTicketBalance(prev => {
          const newBalance = prev + newPoints;
          setUsdtAmount(convertPointsToUSDT(newBalance));
          return newBalance;
        });
      } else {
        fetchProfile();
      }
    };

    window.addEventListener('pointsUpdated', handlePointsUpdate);
    return () => window.removeEventListener('pointsUpdated', handlePointsUpdate);
  }, []);

  const convertPointsToUSDT = (points) => {
    return points / 10000;
  };

  // Refresh balance on every route change
  useEffect(() => {
    fetchProfile();
  }, [location.pathname, fetchProfile]);


  return (
    <Box sx={{ width: "100%", position: "fixed", top: 0, zIndex: 1000 }}>
      <AppBar position="static" sx={{ background: "#111023" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", minHeight: "55px" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img src={coin} alt="coin" style={{ width: "15px", marginRight: "8px" }} />
            <Typography variant="body2"
            sx={{
              fontSize : "1rem"
            }}
            >
              {ticketBalance.toLocaleString()} 
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img src={Tether} alt="coin" style={{ width: "18px", marginRight: "8px" }} />
            <Typography variant="body2"
             sx={{
              fontSize : "1rem"
            }}
            >
            {usdtAmount.toFixed(4)} 
          </Typography>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}