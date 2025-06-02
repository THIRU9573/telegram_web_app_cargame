import React, { useState, useEffect ,useContext} from "react";
import { MyContext } from "../../context/Mycontext";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
  Pagination,
  Stack,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { GetWithdrawHistory } from "../../ApiConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import bg1 from "../../assets/bg1.png";

const Withdrawhistory = () => {
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const {data} = useContext(MyContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const fetchWithdrawHistory = async () => {
    try {
      console.log("datainWithdrawalHistory",data);
      
        const userId = localStorage.getItem("userId");

      if (!userId) {
        toast.error("User not logged in.");
        return;
      }

      const response = await axios.get(`${GetWithdrawHistory}/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("upToken")}`,
        },
      });

      if (response.data && response.data.withdrawals) {
        setWithdrawHistory(response.data.withdrawals);
        setTotalPages(Math.ceil(response.data.withdrawals.length / 10));
      } else {
        setWithdrawHistory([]);
        setTotalPages(1);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch withdraw history"
      );
      setWithdrawHistory([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawHistory();
  }, []);

  // Calculate paginated data
  const itemsPerPage = 10;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = withdrawHistory.slice(startIndex, endIndex);

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
            Withdraw History
          </Typography>
          <Box sx={{ width: '40px' }} />
        </Box>

        {loading ? (
          <Box sx={styles.loadingContainer}>
            <CircularProgress sx={{ color: "#00ffff" }} />
          </Box>
        ) : (
          <>
            <TableContainer 
              component={Paper} 
              sx={styles.tableContainer}
              elevation={0}
            >
              <Table sx={{ width: '100%' }} aria-label="withdraw history table">
                <TableHead>
                  <TableRow sx={styles.tableHeaderRow}>
                    <TableCell sx={styles.headerCell} align="center">S.No</TableCell>
                    <TableCell sx={styles.headerCell} align="center">Date</TableCell>
                    <TableCell sx={styles.headerCell} align="center">Amount</TableCell>
                    <TableCell sx={styles.headerCell} align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(paginatedData) && paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <TableRow key={item._id || index} sx={styles.tableRow}>
                        <TableCell sx={styles.bodyCell} align="center">{startIndex + index + 1}</TableCell>
                        <TableCell sx={styles.bodyCell} align="center">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell sx={styles.bodyCell} align="center">
                          {item.amount}
                        </TableCell>
                        <TableCell 
                          sx={{
                            ...styles.bodyCell,
                            color: item.status === "completed" 
                              ? "#00ff00" 
                              : item.status === "pending" 
                              ? "#ffff00" 
                              : "#ff0000"
                          }} 
                          align="center"
                        >
                          {item.status}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} sx={styles.noHistoryCell} align="center">
                        No withdraw history found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {withdrawHistory.length > 0 && (
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
          </>
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

export default Withdrawhistory;