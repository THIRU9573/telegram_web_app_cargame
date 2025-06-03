import React, { useState, useEffect, useContext } from "react";
import { MyContext } from "../../context/Mycontext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Pagination,
  Stack,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  Container,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { GetReferralHistory } from "../../ApiConfig";
import bg1 from "../../assets/bg1.png";

const ReferralHistory = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBonus, setTotalBonus] = useState(0);
  const { data } = useContext(MyContext);
  const navigate = useNavigate();

  // Fetch referral history data
  useEffect(() => {
    const fetchReferralHistory = async () => {
      console.log("datainReferalHistory", data);
      
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${GetReferralHistory}/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("upToken")}`,
          },
        });
        console.log(response.data.data);

        // Sort referrals by date in descending order (newest first)
        const sortedReferrals = response.data.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        setReferrals(sortedReferrals);
        setTotalBonus(response.data.totalreferralbonus);
        setTotalPages(Math.ceil(response.data.data.length / 10));
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load referral history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReferralHistory();
  }, []);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Calculate paginated data
  const itemsPerPage = 10;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = referrals.slice(startIndex, endIndex);

  if (loading) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress sx={{ color: "#00ffff" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={styles.mainContainer}>
        <Container maxWidth="lg" sx={{ paddingTop: '20px', width: '100%', padding: { xs: '10px', md: '20px' } }}>
          <Typography color="error">{error}</Typography>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={styles.mainContainer}>
      <Container maxWidth="lg" sx={{ paddingTop: '20px', width: '100%', padding: { xs: '10px', md: '20px' } }}>
        <Box sx={styles.header}>
          <IconButton 
            onClick={() => navigate("/profile")} 
            sx={styles.backButton}
          >
            <ArrowBackIcon sx={{ color: '#00ffff' }} />
          </IconButton>
          <Typography variant="h5" sx={styles.title}>
            Referral History
          </Typography>
          <Box sx={{ width: '40px' }} />
        </Box>

        <Typography variant="h6" sx={styles.totalBonus}>
          Total Referral Bonus: {totalBonus} Tether
        </Typography>

        <TableContainer component={Paper} sx={styles.tableContainer} elevation={0}>
          <Table sx={{ width: '100%' }} aria-label="referral history table">
            <TableHead>
              <TableRow sx={styles.tableHeaderRow}>
                <TableCell sx={styles.headerCell} align="center">#</TableCell>
                <TableCell sx={styles.headerCell} align="center">Referred User</TableCell>
                <TableCell sx={styles.headerCell} align="center">Referral Amount</TableCell>
                <TableCell sx={styles.headerCell} align="center">Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(paginatedData) && paginatedData.length > 0 ? (
                paginatedData.map((referral, index) => (
                  <TableRow key={referral._id} sx={styles.tableRow}>
                    <TableCell sx={styles.bodyCell} align="center">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell sx={styles.bodyCell} align="center">
                      {referral.referredUser
                        ? typeof referral.referredUser === "object"
                          ? referral.referredUserName || "Unknown User"
                          : referral.referredUserName || "Unknown User"
                        : "Unknown User"}
                    </TableCell>
                    <TableCell sx={styles.bodyCell} align="center">
                      {referral.referralamount}
                    </TableCell>
                    <TableCell sx={styles.bodyCell} align="center">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} sx={styles.noHistoryCell} align="center">
                    No referral history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {referrals.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                variant="outlined"
                shape="rounded"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "white",
                    borderColor: "#00ffff",
                    "&.Mui-selected": {
                      backgroundColor: "#041821",
                      color: "white",
                      borderColor: "#00ffff",
                      "&:hover": {
                        backgroundColor: "#041821",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "rgba(0, 255, 255, 0.08)",
                      borderColor: "#00ffff",
                    },
                  },
                  "& .MuiPaginationItem-ellipsis": {
                    color: "white",
                  },
                }}
              />
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

const styles = {
  mainContainer: {
    background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bg1}) no-repeat center center`,
    backgroundSize: "cover",
    minHeight: "100vh",
    color: "#fff",
    width: "100%",
    overflowX: "hidden",
    display: "flex",
    alignItems: "flex-start",
    paddingTop: "80px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    position: "relative",
    width: "100%",
    "@media (max-width: 600px)": {
      padding: "0 10px",
    },
  },
  title: {
    color: "#00ffff",
    fontWeight: "bold",
    textAlign: "center",
    flexGrow: 1,
    "@media (max-width: 600px)": {
      fontSize: "1.2rem",
    },
  },
  backButton: {
    color: "#00ffff",
    border: "1px solid #00ffff",
    borderRadius: "50%",
    padding: "8px",
    "&:hover": {
      backgroundColor: "rgba(0, 255, 255, 0.1)",
    },
    "@media (max-width: 600px)": {
      padding: "6px",
    },
  },
  totalBonus: {
    color: "#00ffff",
    marginBottom: "20px",
    fontFamily: "Inter",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
    width: "100%",
  },
  tableContainer: {
    backgroundColor: "rgba(0, 15, 63, 0.3)",
    backdropFilter: "blur(12px)",
    borderRadius: "12px",
    border: "1px solid rgba(0, 255, 255, 0.2)",
    borderLeft: "none",
    borderRight: "none",
    overflow: "hidden",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    "&::-webkit-scrollbar": {
      display: "none"
    },
    msOverflowStyle: "none",
    scrollbarWidth: "none",
    width: "100%"
  },
  tableHeaderRow: {
    backgroundColor: "rgba(0, 31, 63, 0.5)",
    backdropFilter: "blur(4px)",
  },
  headerCell: {
    color: "#00ffff",
    fontWeight: "bold",
    fontSize: "13px",
    fontFamily: "Inter",
    padding: "16px",
    textAlign: "center",
    "@media (max-width: 600px)": {
      padding: "8px 4px",
      fontSize: "12px",
    },
  },
  tableRow: {
    "&:hover": {
      backgroundColor: "rgba(0, 255, 255, 0.05)",
    },
  },
  bodyCell: {
    color: "white",
    fontSize: "13px",
    fontFamily: "Inter",
    padding: "16px",
    textAlign: "center",
    "@media (max-width: 600px)": {
      padding: "8px 4px",
      fontSize: "12px",
    },
  },
  noHistoryCell: {
    color: "white",
    textAlign: "center",
    padding: "20px",
    fontFamily: "Inter",
  },
};

export default ReferralHistory;
