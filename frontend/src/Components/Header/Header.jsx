import * as React from "react";
import { MyContext } from "../../context/Mycontext";
import axios from "axios";
import { UserProfile, TicketConvertion } from "../../ApiConfig";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useState, useEffect, useCallback,useContext } from "react";
import { useLocation } from "react-router-dom";
import coin from "../../assets/coin.png";
import Tether from "../../assets/Tether.png";

export default function ButtonAppBar() {
  const [ticketBalance, setTicketBalance] = useState(0);
  const [usdtAmount, setUsdtAmount] = useState(0);
  const [ticketQuantity, setTicketQuantity] = useState(0);
  const [defaultAdminWallet, setDefaultAdminWallet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const location = useLocation();
      const { data } = useContext(MyContext);


  const fetchTicketConvertion = useCallback(async () => {
     console.log("tokenin Profile",localStorage.getItem("upToken"));
    console.log("userIdin Profile",localStorage.getItem("userId"));
      const userId = localStorage.getItem("userId");
    if (!userId) {
      console.warn("User not logged in — skipping TicketConvertion fetch");
      return;
    }
    try {
      const response = await axios.get(`${TicketConvertion}/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("upToken")}`,
        },
      });
      setUsdtAmount(response.data.data.AmountInToken);
      setTicketQuantity(response.data.data.TicketQuantity);
      //  setDefaultAdminWallet(response.data.data[0].DefaultAdminWallet);
     
      // Update state if needed here
    } catch (error) {
      console.error("Fetch ticket conversion error:", error);
    }
  }, []);

  // define fetchProfile outside useEffect to reuse
  const fetchProfile = useCallback(async () => {
      const userId = localStorage.getItem("userId");
    if (!userId) {
      console.warn("User not logged in — skipping TicketConvertion fetch");
      return;
    }
    console.log(data,"datainHeader");
    
    try {
      const response = await axios.get(`${UserProfile}/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("upToken")}`,
        },
      });
      const points = response.data.user.ticketBalance;

      setTicketBalance(points);
      // setUsdtAmount(points / 10000);
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
      fetchProfile();
      fetchTicketConvertion(); // your existing fetchProfile function to get fresh balance
    };

    window.addEventListener("userLoggedIn", refreshBalance);

    return () => {
      window.removeEventListener("userLoggedIn", refreshBalance);
    };
  }, [fetchProfile, fetchTicketConvertion]);

  useEffect(() => {
    const handlePointsUpdate = (event) => {
      if (event.detail?.points) {
        const newPoints = event.detail.points;
        setTicketBalance((prev) => {
          // const newBalance = prev + newPoints;
          const newBalance = prev + event.detail.points;  // handles + or - points
          setUsdtAmount(convertPointsToUSDT(newBalance));
          return newBalance;
        });
      } else {
        fetchProfile();
        fetchTicketConvertion();
      }
    };

    window.addEventListener("pointsUpdated", handlePointsUpdate);
    return () =>
      window.removeEventListener("pointsUpdated", handlePointsUpdate);
  }, []);

  const convertPointsToUSDT = (points) => {
    return points / 10000;
  };

  // Refresh balance on every route change
  useEffect(() => {
    fetchProfile();
    fetchTicketConvertion();
  }, [location.pathname, fetchProfile, fetchTicketConvertion]);

  return (
    <Box sx={{ width: "100%", position: "fixed", top: 0, zIndex: 1000 }}>
      <AppBar position="static" sx={{ background: "#111023" }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            minHeight: "55px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src={coin}
              alt="coin"
              style={{ width: "15px", marginRight: "8px" }}
            />
            <Typography
              variant="body2"
              sx={{
                fontSize: "1rem",
              }}
            >
              {ticketBalance.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src={Tether}
              alt="coin"
              style={{ width: "18px", marginRight: "8px" }}
            />
            <Typography
              variant="body2"
              sx={{
                fontSize: "1rem",
              }}
            >
              {/* {usdtAmount.toFixed(4)} */}
              {ticketQuantity
                ? ((usdtAmount * ticketBalance) / ticketQuantity).toFixed(4)
                : "N/A"}{" "}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
