import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Avatar, Grid } from "@mui/material";
import { Group, ContentCopy } from "@mui/icons-material"; // Using Group icon for 4 people
import coin from "../../assets/coin.png";
import axios from "axios"; // Added axios import which was missing
import { UserProfile, GetReferralReward } from "../../ApiConfig";
import bgimage from "../../assets/bg1.png";
import { toast } from "react-toastify";

export default function InvitePage() {
  const [referralLink, setReferralLink] = useState("");
  const [referralReward, setReferralReward] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  
  // Add necessary state variables for telegram sharing
  // const [botname] = useState("your_bot_name"); // Replace with your actual bot name
  // const [chatId] = useState(userId);
  const [referralNote] = useState("Join me in this exciting game!"); // Customize your referral message
  const [referralTicketBalance, setReferralTicketBalance] = useState("3000"); // Default ticket balance
  const botname = "teststringrace_bot";
  const chatId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;


  // Fetch referral link from API
  useEffect(() => {
    const fetchReferralLink = async () => {
      try {
        const response = await axios.get(`${UserProfile}/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("stringToken")}`,
          },
        });
        console.log(response.data.user.referralLink);
        if (response.status === 200) {
          setReferralLink(response.data.user.referralLink);
          console.log(response.data.user.referralLink);
        }
      } catch (error) {
        console.error("Error fetching referral link:", error);
      }
    };

    const fetchReferralReward = async () => {
      try {
        const referralresponse = await axios.get(`${GetReferralReward}/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("stringToken")}`,
          },
        });
        
        if (referralresponse.status === 200) {
          setReferralReward(referralresponse.data.referralSettings);
          // Update referral ticket balance if available from API
          if (referralresponse.data.referralSettings.length > 0) {
            const activeReferral = referralresponse.data.referralSettings.find(item => item.Status === 'active');
            if (activeReferral) {
              setReferralTicketBalance(activeReferral.referralAmount.toString());
            }
          }
        }
      } catch (error) {
        console.error("Error fetching referral Reward:", error);
      }
    };

    fetchReferralLink();
    fetchReferralReward();
  }, [userId]);

  // Get active referralAmount or default 0
  const activeReferral = referralReward.find(item => item.Status === 'active');
  const activeReferralAmount = activeReferral ? activeReferral.referralAmount : 0;


  // Generate Invite Link for Telegram sharing
  const generateInviteLink = () => {
    // return `https://t.me/share/url?url=${referralLink}`;
    return `https://t.me/share/url?url=https://t.me/${botname}/play?startapp=${chatId}`
  };

  // Handle copy function for copying the referral link
  const handleCopy = () => {
    navigator.clipboard
      .writeText(`https://t.me/${botname}/play?startapp=${chatId}`)
      .then(() => {
        toast.success("Link copied!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy link");
      });
  };

  // Function to handle sharing via Telegram
  const handleShare = () => {
    const inviteLink = generateInviteLink();
    window.open(inviteLink, '_blank');
  };

  return (
    <Box
      sx={{
        position: "relative",
        top: 0,
        left: 0,
        width: "100vw",
        minHeight: "100vh",
        paddingBottom: "100px",
        background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bgimage}) no-repeat center center`,
        backgroundSize: "cover",
        color: "#fff",
        padding: { xs: "20px 10px", md: "40px 20px" },
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      {/* Header: Invite Info */}
      <Typography
        variant="h6"
        sx={{
          color: "#58E9F8",
          fontWeight: "400",
          marginTop: "40px",
          fontSize: "68px",
          fontFamily: "Metal Mania",
          textAlign: "center",
          mb: 2,
        }}
      >
        FRIENDS
      </Typography>

      {/* Invite Friends Message */}
      <Box
        sx={{
          textAlign: "center",
          justifyContent:"center",
          alignItems:"center",
          marginLeft:"20px",
          // padding: 2,
          borderRadius: 2,
          // marginTop: "70px",
          width: "90%",
          mb: 3,
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ color: "white", fontWeight: "bold", fontFamily: "Inter" }}
        >
          Invite Friends!
        </Typography>
        <Typography variant="body1" sx={{ color: "white", mt: 1, fontFamily: "Inter" }}>
          Bring your friends on board and receive Ticket Balance for every new member.
        </Typography>
        <Typography variant="body1" sx={{ color: "white", fontFamily: "Inter", mt: 1 }}>
          Earn {referralTicketBalance} Tether for each invite!
        </Typography>
      </Box>

      {/* Rewards Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: "30px",
          width: "100%",
          mb: 3,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" sx={{ color: "#00e5ff" }}>
            0.006
          </Typography>
          <Typography variant="body2" sx={{ color: "white" }}>
            Tether Earned
          </Typography>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" sx={{ color: "#00e5ff" }}>
            {referralTicketBalance}
          </Typography>
          <Typography variant="body2" sx={{ color: "white" }}>
            Ticket Balance
          </Typography>
        </Box>
      </Box>

      {/* Invite Buttons */}
      <Box sx={{ display: "flex", width: "100%" }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#03415D",
            fontWeight: "600",
            fontSize: "1rem",
            color: "white",
            margin: "10px",
            "&:hover": {
              backgroundColor: "#e91e63",
            },
            width: "45%",
          }}
          startIcon={<Group />}
          onClick={handleShare}
        >
          INVITE
        </Button>

        <Button
          variant="contained"
          sx={{
            backgroundColor: "#03415D",
            fontWeight: "600",
            fontSize: "1rem",
            color: "white",
            margin: "10px",
            border: "4px solid #29A4BF",
            "&:hover": {
              backgroundColor: "#1976d2",
            },
            width: "45%",
          }}
          startIcon={<ContentCopy />}
          onClick={handleCopy}
        >
          SHARE
        </Button>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          margin: "10px",
          padding:"10px"
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontFamily: "Inter",
            fontSize: "17px",
            color: "white",
            fontWeight: "600",
          }}
        >
          REFERRAL REWARDS {activeReferralAmount}
        </Typography>
        <img
          src={coin}
          alt="coin"
          style={{
            marginLeft: "15px",
            height: "25px",
            width: "25px",
          }}
        />
      </Box>
    </Box>
  );
}
