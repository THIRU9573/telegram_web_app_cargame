import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { GetReferralHistory } from "../../ApiConfig";

const ReferralHistory = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBonus, setTotalBonus] = useState(0);
  const navigate = useNavigate();

  // Fetch referral history data
  useEffect(() => {
    const fetchReferralHistory = async () => {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${GetReferralHistory}/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("stringToken")}`,
          },
        });
        console.log(response.data.data);

        setReferrals(response.data.data);
        setTotalBonus(response.data.totalreferralbonus);
        setTotalPages(Math.ceil(response.data.total / 10)); // Assuming 10 items per page
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load referral history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReferralHistory();
  }, [page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };
  referrals.forEach((item) => {
    console.log(item.referredUserName);
  });

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          backgroundColor: "#121212",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          flexDirection: "column",
        }}
      >
        <Typography color="error">{error}</Typography>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "#121212",
        minHeight: "100vh",
        padding: { xs: "20px 10px", md: "40px 20px" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: "white", mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h5"
          sx={{ color: "white", fontWeight: "bold", fontFamily: "Inter" }}
        >
          Referral History
        </Typography>
      </Box>

      <Typography
        variant="h6"
        sx={{ color: "white", mb: 2, fontFamily: "Inter" }}
      >
        Total Referral Bonus: {totalBonus} Tether
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 3, overflowX: "auto" }}>
        <Table
          sx={{ minWidth: isSmallScreen ? 300 : 650 }}
          aria-label="referral history table"
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#001f3f" }}>
              <TableCell
                sx={{ color: "white", fontWeight: "bold", fontFamily: "Inter" }}
              >
                #
              </TableCell>
              <TableCell
                sx={{ color: "white", fontWeight: "bold", fontFamily: "Inter" ,fontSize:"13px"}}
              >
                Referred User
              </TableCell>
              <TableCell
                sx={{ color: "white", fontWeight: "bold", fontFamily: "Inter",fontSize:"13px" }}
                align="right"
              >
                Referral Amount
              </TableCell>
              <TableCell
                sx={{ color: "white", fontWeight: "bold", fontFamily: "Inter",fontSize:"13px" }}
                align="right"
              >
                Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ backgroundColor: "#121212", color: "white" }}>
            {referrals.map((referral, index) => (
              <TableRow key={referral._id}>
                <TableCell
                  sx={{
                    padding: isSmallScreen ? "8px 4px" : "16px",
                    color: "white",
                    textAlign: "center",
                    fontFamily: "Inter",
                  }}
                >
                  {(page - 1) * 10 + index + 1}
                </TableCell>
                <TableCell
                  sx={{
                    padding: isSmallScreen ? "8px 4px" : "16px",
                    color: "white",
                    textAlign: "center",
                    fontFamily: "Inter",
                  }}
                >
                  {referral.referredUser
                    ? typeof referral.referredUser === "object"
                      ? referral.referredUserName || "Unknown User"
                      : referral.referredUserName || "Unknown User"
                    : "Unknown User"}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    padding: isSmallScreen ? "8px 4px" : "16px",
                    color: "white",
                    textAlign: "center",
                    fontFamily: "Inter",
                  }}
                >
                  {referral.referralamount}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    padding: isSmallScreen ? "8px 4px" : "16px",
                    color: "white",
                    textAlign: "center",
                    fontFamily: "Inter",
                  }}
                >
                  {new Date(referral.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            variant="outlined"
            shape="rounded"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "white",
              },
            }}
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default ReferralHistory;
