import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Avatar,
  CircularProgress,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  UpdateUserProfile,
  UserProfile,
  WithdrawRequest,
  GetWithdrawHistory,
  WithdrawLimits,
} from "../../ApiConfig";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import profileimg from "../../assets/profileimg.png";
import bg1 from "../../assets/bg1.png";
import coin from "../../assets/coin.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [withdraw, setWithdraw] = useState(false);
  const [choosenetwork, setChoosenetwork] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletid, setWalletId] = useState("");
  const [dialogView, setDialogView] = useState("withdraw");
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [minWithdrawal, setMinWithdrawal] = useState(null);
  const [maxWithdrawal, setMaxWithdrawal] = useState(null);
  const navigate = useNavigate();
  const { updateUserBalance } = useUser();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem("userId");
      console.log("Fetching profile for userId:", userId);

      if (!userId) {
        console.error("No userId found in localStorage");
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("stringToken");
        // const headers = {
        //   Authorization: `Bearer ${token}`,
        // };

        // console.log("Request headers:", headers);
        console.log("Making profile API request...");
        const response = await axios.get(`${UserProfile}/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Profile API response:", response.data);

        if (!response.data.user) {
          console.error("No user data in response");
          setError("Invalid profile data received");
          return;
        }

        setProfile(response.data.user);
        console.log("Profile state set:", response.data.user);
      } catch (err) {
        console.error("Profile fetch error:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setError(err.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const fetchWithdrawLimits = async () => {
    try {
      console.log("Fetching withdraw limits for userId:", userId);
      const response = await axios.get(`${WithdrawLimits}/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("stringToken")}`,
        },
      });
console.log("Fetching withdraw limits",response);

      setMinWithdrawal(response.data.data[0].minWithdrawal);
      setMaxWithdrawal(response.data.data[0].maxWithdrawal);
    } catch (error) {
      console.error("Failed to fetch withdraw Limits:", {
        error: error,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
  };

  const handleWithdraw = async () => {
    try {
      console.log("Starting withdrawal process...");
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("User not logged in");
        toast.error("User not logged in.");
        return;
      }

      // Validate inputs
      if (!withdrawAmount) {
        console.error("Missing amount field");
        toast.error("Please enter amount");
        return;
      }

      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount)) {
        console.error("Invalid amount:", withdrawAmount);
        toast.error("Please enter a valid amount");
        return;
      }

      if (amount < minWithdrawal || amount > maxWithdrawal) {
        console.error(
          `Amount must be between ${minWithdrawal} and ${maxWithdrawal}`
        );
        toast.error(
          `Amount must be between ${minWithdrawal} and ${maxWithdrawal}`
        );
        return;
      }

      if (profile.ticketBalance < amount) {
        console.error("Insufficient balance:", {
          balance: profile.ticketBalance,
          amount,
        });
        toast.error("Insufficient balance");
        return;
      }

      console.log("Making withdrawal API call...");
      const response = await axios.post(
        `${WithdrawRequest}/${userId}`,
        {
          amount: amount,
          network: choosenetwork || "SOL",
          walletAddress: walletid || "random-wallet-id-12345",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("stringToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Withdrawal response:", response);

      if (response.data.message) {
        console.log("Withdrawal successful:", response.data.message);
        toast.success("Withdrawal request sent successfully!");
        setWithdraw(false);
        setChoosenetwork("");
        setWithdrawAmount("");
        setWalletId("");

        // Refresh profile data and update global balance
        const profileResponse = await axios.get(`${UserProfile}/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("stringToken")}`,
          },
        });
        console.log("Updated profile data:", profileResponse.data);
        setProfile(profileResponse.data.user);
        updateUserBalance(); // Update global balance state
      } else {
        console.error("Unexpected response format:", response.data);
        toast.error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Withdrawal failed:", {
        error: error,
        response: error.response,
        message: error.message,
      });
      toast.error(
        error.response?.data?.message || "Failed to send withdrawal request"
      );
    }
  };

  const handleSaveUsername = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await axios.post(
        `${UpdateUserProfile}/${userId}`,
        { username: editedUsername },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("stringToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.user) {
        setProfile(response.data.user);
        setOpenEdit(false);
      }
    } catch (error) {
      console.error("Failed to update username:", error);
      alert("Failed to update username. Please try again.");
    }
  };

  const fetchWithdrawHistory = async () => {
    try {
      if (!userId) {
        toast.error("User not logged in.");
        return;
      }

      console.log("Fetching withdraw history for userId:", userId);
      const response = await axios.get(`${GetWithdrawHistory}/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("stringToken")}`,
        },
      });

      console.log("Withdraw history API response:", response.data);

      // Check if response has the expected structure
      if (response.data && response.data.withdrawals) {
        console.log("Setting withdraw history:", response.data.withdrawals);
        setWithdrawHistory(response.data.withdrawals);
      } else {
        console.warn("Unexpected API response structure:", response.data);
        setWithdrawHistory([]);
      }
    } catch (error) {
      console.error("Failed to fetch withdraw history:", {
        error: error,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(
        error.response?.data?.message || "Failed to fetch withdraw history"
      );
      setWithdrawHistory([]);
    }
  };

  if (loading) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress sx={{ color: "#fff" }} />
        <Typography sx={{ color: "#fff", mt: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={styles.errorContainer}>
        <Typography sx={{ color: "red" }}>{error}</Typography>
      </Box>
    );
  }

  // Add null check for profile
  if (!profile) {
    return (
      <Box sx={styles.errorContainer}>
        <Typography sx={{ color: "red" }}>
          Profile data not available
        </Typography>
      </Box>
    );
  }

  // Add null check for Stats property
  const stats = profile.Stats || [];
  const wonCount = stats.filter((result) => result === "WON").length;

  return (
    <Box sx={styles.mainContainer}>
      {/* Profile Header */}
      <Box sx={styles.profileHeader}>
        <Avatar
          src={window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url}
          alt="Profile"
          sx={profileimg}
        />
        <Typography variant="h6" sx={styles.username}>
          {profile.username}
        </Typography>
        <CreateOutlinedIcon
          onClick={() => {
            setEditedUsername(profile.username);
            setOpenEdit(true);
          }}
        />
      </Box>

      {/* Stats Section */}
      <Typography variant="body2" sx={styles.sectionTitle}>
        STATS
      </Typography>

      <Box sx={styles.statsContainer}>
        <Card sx={styles.statCard}>
          <Typography sx={styles.statText}>RACES PLAYED :</Typography>
          <Typography sx={styles.statValue}>{stats.length}</Typography>
        </Card>
        <Card sx={styles.statCard}>
          <Typography sx={styles.statText}>WINS :</Typography>
          <Typography sx={styles.statValue}>{wonCount}</Typography>
        </Card>
        <Typography sx={styles.walletTitle}>WALLET</Typography>
        <Card sx={styles.statCard}>
          <Typography sx={styles.statValue}>
            {profile.ticketBalance || 0}
          </Typography>
          <img src={coin} alt="coin" style={styles.coinIcon} />
        </Card>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, pb: "100px" }}>
        <Button
          variant="outlined"
          sx={styles.actionButton}
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate("/referralhistory")}
        >
          Referral History
        </Button>

        <Box sx={styles.buttonGroup}>
          <Button variant="contained" sx={styles.depositButton}>
            DEPOSIT
          </Button>
          <Button
            variant="contained"
            sx={styles.withdrawButton}
            onClick={() => {
              setWithdraw(true);
              fetchWithdrawLimits();
            }}
          >
            Withdraw
          </Button>
        </Box>
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        PaperProps={{
          sx: {
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            width: "90%",
            maxWidth: "400px",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "white",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.5rem",
            background: "rgba(0, 0, 0, 0.2)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          Edit Profile
        </DialogTitle>
        <DialogContent sx={{ padding: "20px" }}>
          <Box sx={{ marginTop: "16px" }}>
            <Typography
              variant="body1"
              sx={{
                color: "white",
                marginBottom: "8px",
                fontWeight: "500",
              }}
            >
              Enter Username
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={editedUsername}
              onChange={(e) => setEditedUsername(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "white",
                  "& fieldset": {
                    border: "none",
                  },
                },
                "& .MuiInputBase-input": {
                  padding: "12px 14px",
                },
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            padding: "16px 24px",
            background: "rgba(0, 0, 0, 0.2)",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => setOpenEdit(false)}
            sx={{
              color: "white",
              borderRadius: "8px",
              padding: "8px 16px",
              background: "rgba(255, 0, 0, 0.2)",
              "&:hover": {
                background: "rgba(255, 0, 0, 0.3)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveUsername}
            sx={{
              color: "white",
              borderRadius: "8px",
              padding: "8px 16px",
              background: "rgba(0, 255, 0, 0.2)",
              "&:hover": {
                background: "rgba(0, 255, 0, 0.3)",
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog
        open={withdraw}
        onClose={() => {
          setWithdraw(false);
          setDialogView("withdraw");
        }}
        PaperProps={{
          sx: {
            background: "rgba(0, 15, 63, 0.3)",
            backdropFilter: "blur(12px)",
            borderRadius: "20px",
            border: "1px solid rgba(0, 255, 255, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 31, 63, 0.3)",
            width: "90%",
            maxWidth: "350px",
            maxHeight: "85vh",
            margin: "20px auto",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#00ffff",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.2rem",
            background: "rgba(0, 31, 63, 0.5)",
            borderBottom: "1px solid rgba(0, 255, 255, 0.2)",
            padding: "12px",
          }}
        >
          Withdraw Funds
        </DialogTitle>

        {/* View Toggle Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            p: 2,
            background: "rgba(0, 31, 63, 0.3)",
          }}
        >
          <Button
            onClick={() => setDialogView("withdraw")}
            sx={{
              color:
                dialogView === "withdraw"
                  ? "#00ffff"
                  : "rgba(255, 255, 255, 0.7)",
              background:
                dialogView === "withdraw"
                  ? "rgba(0, 255, 255, 0.1)"
                  : "transparent",
              border: "1px solid rgba(0, 255, 255, 0.3)",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "0.875rem",
              "&:hover": {
                background: "rgba(0, 255, 255, 0.2)",
              },
            }}
          >
            Withdraw
          </Button>
          <Button
            onClick={() => {
              setDialogView("history");
              fetchWithdrawHistory();
            }}
            sx={{
              color:
                dialogView === "history"
                  ? "#00ffff"
                  : "rgba(255, 255, 255, 0.7)",
              background:
                dialogView === "history"
                  ? "rgba(0, 255, 255, 0.1)"
                  : "transparent",
              border: "1px solid rgba(0, 255, 255, 0.3)",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "0.875rem",
              "&:hover": {
                background: "rgba(0, 255, 255, 0.2)",
              },
            }}
          >
            History
          </Button>
        </Box>

        <DialogContent sx={{ padding: "15px" }}>
          {dialogView === "withdraw" ? (
            <>
              <Box sx={{ marginBottom: "15px" }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#00ffff",
                    marginBottom: "4px",
                    fontWeight: "500",
                  }}
                >
                  Network
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={choosenetwork}
                    onChange={(e) => setChoosenetwork(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        border: "1px solid rgba(0, 255, 255, 0.3)",
                        color: "white",
                        height: "40px",
                        "& fieldset": {
                          border: "none",
                        },
                      },
                      "& .MuiSelect-select": {
                        padding: "8px 14px",
                        color: "white !important",
                      },
                      backgroundColor: "rgba(0, 31, 63, 0.3)",
                      borderRadius: "8px",
                      "& .MuiSvgIcon-root": {
                        color: "#00ffff",
                      },
                      "& .MuiInputBase-input": {
                        color: "white !important",
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: "rgba(0, 15, 63, 0.95)",
                          backdropFilter: "blur(12px)",
                          "& .MuiMenuItem-root": {
                            color: "white",
                            "&:hover": {
                              backgroundColor: "rgba(0, 255, 255, 0.1)",
                            },
                            "&.Mui-selected": {
                              backgroundColor: "rgba(0, 255, 255, 0.2)",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "rgba(0, 255, 255, 0.3)",
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="SOL">SOL</MenuItem>
                    <MenuItem value="ETH">ETH</MenuItem>
                    <MenuItem value="USDT">USDT (TRC20)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ marginBottom: "15px" }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#00ffff",
                    marginBottom: "4px",
                    fontWeight: "500",
                  }}
                >
                  Amount
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      border: "1px solid rgba(0, 255, 255, 0.3)",
                      color: "white",
                      height: "40px",
                      "& fieldset": {
                        border: "none",
                      },
                    },
                    "& .MuiInputBase-input": {
                      padding: "8px 14px",
                    },
                    backgroundColor: "rgba(0, 31, 63, 0.3)",
                    borderRadius: "8px",
                  }}
                />
              </Box>

              <Box sx={{ marginBottom: "12px" }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#00ffff",
                    marginBottom: "4px",
                    fontWeight: "500",
                  }}
                >
                  Wallet ID
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={walletid}
                  onChange={(e) => setWalletId(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      border: "1px solid rgba(0, 255, 255, 0.3)",
                      color: "white",
                      height: "40px",
                      "& fieldset": {
                        border: "none",
                      },
                    },
                    "& .MuiInputBase-input": {
                      padding: "8px 14px",
                    },
                    backgroundColor: "rgba(0, 31, 63, 0.3)",
                    borderRadius: "8px",
                  }}
                />
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "12px",
                  textAlign: "center",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Platform charge 25%
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255, 0, 0, 0.8)",
                  fontSize: "12px",
                  textAlign: "center",
                  display: "block",
                }}
              >
                Min:{" "}
                {minWithdrawal !== null ? `${minWithdrawal}$` : "Loading..."}{" "}
                Max:{" "}
                {maxWithdrawal !== null ? `${maxWithdrawal}$` : "Loading..."}
              </Typography>
            </>
          ) : (
            <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "0.5fr 1fr 1fr 1fr",
                  gap: 1,
                  mb: 1,
                  px: 1,
                }}
              >
                <Typography sx={{ color: "#00ffff", fontWeight: "bold" }}>
                  S.No
                </Typography>
                <Typography sx={{ color: "#00ffff", fontWeight: "bold" }}>
                  Date
                </Typography>
                <Typography sx={{ color: "#00ffff", fontWeight: "bold" }}>
                  Amount
                </Typography>
                <Typography sx={{ color: "#00ffff", fontWeight: "bold" }}>
                  Status
                </Typography>
              </Box>
              {Array.isArray(withdrawHistory) && withdrawHistory.length > 0 ? (
                withdrawHistory.map((item, index) => (
                  <Box
                    key={item._id || index}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "0.5fr 1fr 1fr 1fr",
                      gap: 1,
                      p: 1,
                      borderBottom: "1px solid rgba(0, 255, 255, 0.1)",
                      "&:hover": {
                        background: "rgba(0, 255, 255, 0.05)",
                      },
                    }}
                  >
                    <Typography sx={{ color: "white", fontSize: "12px" }}>
                      {index + 1}
                    </Typography>
                    <Typography sx={{ color: "white", fontSize: "12px" }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography sx={{ color: "white", fontSize: "12px" }}>
                      {item.amount}
                    </Typography>
                    <Typography
                      sx={{
                        color:
                          item.status === "completed"
                            ? "#ffffff"
                            : item.status === "pending"
                              ? "#ffffff"
                              : "#ffffff",
                        textTransform: "capitalize",
                        fontSize: "12px",
                      }}
                    >
                      {item.status}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography sx={{ color: "white", textAlign: "center", py: 2 }}>
                  No withdraw history found
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            padding: "12px",
            background: "rgba(0, 31, 63, 0.5)",
            borderTop: "1px solid rgba(0, 255, 255, 0.2)",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => {
              setWithdraw(false);
              setDialogView("withdraw");
            }}
            sx={{
              color: "#00ffff",
              borderRadius: "6px",
              padding: "6px 12px",
              background: "rgba(255, 0, 0, 0.2)",
              border: "1px solid rgba(255, 0, 0, 0.3)",
              fontSize: "0.875rem",
              "&:hover": {
                background: "rgba(255, 0, 0, 0.3)",
              },
            }}
          >
            Close
          </Button>
          {dialogView === "withdraw" && (
            <Button
              onClick={handleWithdraw}
              sx={{
                color: "#00ffff",
                borderRadius: "6px",
                padding: "6px 12px",
                background: "rgba(0, 255, 0, 0.2)",
                border: "1px solid rgba(0, 255, 0, 0.3)",
                fontSize: "0.875rem",
                "&:hover": {
                  background: "rgba(0, 255, 0, 0.3)",
                },
              }}
            >
              Withdraw
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </Box>
  );
};

const styles = {
  loadingContainer: {
    display: "flex",
    background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bg1}) no-repeat center center`,
    backdropFilter: "blur(12px)",
    alignItems: "center",
    minHeight: "100vh",
    width: "100vw",
    overflow: "auto",
    padding: { xs: "20px 10px", md: "40px 20px" },
    boxSizing: "border-box",
    position: "fixed",
    top: 0,
    left: 0,
    flexDirection: "column",
    justifyContent: "center",
  },
  errorContainer: {
    background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bg1}) no-repeat center center`,
    height: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    color: "white",
  },
  mainContainer: {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bg1}) no-repeat center center`,
    backgroundAttachment: "fixed",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    color: "#fff",
    padding: { xs: "20px 10px", md: "40px 20px" },
    boxSizing: "border-box",
    overflowY: "auto",
    paddingBottom: "100px", // Add padding at the bottom for footer
  },
  profileHeader: {
    mb: 3,
    marginTop: { xs: "60px", md: "80px" },
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    gap: 1,
  },
  avatar: {
    width: 65,
    height: 65,
  },
  username: {
    color: "#58E9F8",
    fontWeight: "400",
    fontSize: "1.25rem",
    fontFamily: "Metal Mania",
    mb: 2,
  },
  sectionTitle: {
    fontWeight: "400",
    marginBottom: { xs: "20px", md: "30px" },
    fontSize: "1.30rem",
    fontFamily: "Inter",
    textAlign: "center",
    mb: 2,
  },
  statsContainer: {
    height: "200px",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  statCard: {
    width: { xs: "94%", sm: "365px" },
    height: "73px",
    backgroundColor: "#031A27",
    padding: "10px",
    color: "#CFDADF",
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
    borderRadius: "10px 3px 10px 3px",
    border: "2px solid #074258",
  },
  statText: {
    fontSize: { xs: "1rem", sm: "1.25rem" },
    fontFamily: "Inter",
    fontWeight: "600",
    marginLeft: "10px",
  },
  statValue: {
    fontSize: { xs: "1rem", sm: "1.25rem" },
    padding: "10px",
    fontFamily: "Inter",
    fontWeight: "600",
    marginRight: "10px",
  },
  walletTitle: {
    width: { xs: "100%", sm: "143px" },
    height: "42px",
    fontSize: "1.30rem",
    fontFamily: "Inter",
    fontWeight: "600",
    display: "flex",
    justifyContent: "center",
  },
  coinIcon: {
    padding: "30px",
    width: "24px",
    height: "24px",
  },
  actionButton: {
    backgroundColor: "#03415D",
    fontWeight: "600",
    fontSize: { xs: "1rem", sm: "1.30rem" },
    color: "white",
    margin: "10px",
    border: "4px solid #29A4BF",
    "&:hover": {
      backgroundColor: "#1976d2",
    },
    width: "95%",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: { xs: "row", sm: "row" },
    alignItems: "center",
    gap: "10px",
  },
  depositButton: {
    backgroundColor: "#03415D",
    fontWeight: "600",
    fontSize: { xs: "1rem", sm: "1.30rem" },
    color: "white",
    margin: "10px",
    border: "4px solid #29A4BF",
    "&:hover": {
      backgroundColor: "#1976d2",
    },
    width: { xs: "100%", sm: "45%" },
  },
  withdrawButton: {
    backgroundColor: "#03415D",
    fontWeight: "600",
    fontSize: { xs: "1rem", sm: "1.30rem" },
    color: "white",
    margin: "10px",
    border: "4px solid #29A4BF",
    "&:hover": {
      backgroundColor: "#1976d2",
    },
    width: { xs: "100%", sm: "45%" },
  },
};

export default ProfilePage;
