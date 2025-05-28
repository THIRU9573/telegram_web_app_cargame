import React from "react";
import {Card,CardContent,Typography,Button,Grid,Box,} from "@mui/material";
import RocketIcon from "@mui/icons-material/RocketLaunch"; // MUI icon for rocket

const boosters = [
  {
    name: "Bounce Boost",
    duration: "3 mins",
    multiplier: "x2",
    price: "0.078 ($0.3)",
  },
  {
    name: "Power Puffs",
    duration: "30 mins",
    multiplier: "x2",
    price: "0.142 ($0.55)",
  },
  { name: "Energy Elixir", duration: "TBA", multiplier: "TBA", price: "TBA" },
  { name: "Turbo Tonic", duration: "TBA", multiplier: "TBA", price: "TBA" },
];

const Boosters = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        background:
          "linear-gradient(to bottom right, #aa076b, #61045f)",
        backdropFilter: "blur(12px)",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        textAlign: "center",
        flexDirection: "column",
        
      }}
    >
      {/* Header */}
      <Typography
        variant="h4"
        sx={{ color: "#00ffcc", fontWeight: "bold", mb: 2 }}
      >
        BOOSTERS
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, fontSize: "16px", color: "#ddd" }}
      >
        Utilize these to amplify your rewards while they remain active.
      </Typography>

      {/* Cards Grid - 2 Cards Per Row Always */}
      <Grid container spacing={2} justifyContent="center">
        {boosters.map((booster, index) => (
          <Grid item xs={6} sm={6} md={6} lg={6} key={index}>
            {" "}
            {/* ✅ 2 Cards per Row */}
            <Card
              sx={{
                position: "relative", 
                background: "linear-gradient(to bottom, #222, #111)",
                borderRadius: 3,
                padding: 2,
                boxShadow: "0 0 15px #00ffcc",
                textAlign: "center",
                overflow: "visible", 
                marginBottom: "30px"
              }}
            >
              {/* 🚀 Absolute Positioned Rocket Icon */}
              <Box
                sx={{
                  position: "absolute",
                  top: "-25px", 
                  left: "50%",
                  borderRadius: "10%",
                  boxShadow: "0 0 15px #00ffcc",
                  transform: "translateX(-50%)", 
                  zIndex: 10, 
                }}
              >
                <RocketIcon
                  sx={{
                    fontSize: 50,
                    color: "#ffcc00",
                    border: "2px solid #ffcc00",
                    borderRadius: "10%", // ✅ Circular background
                    backgroundColor: "#222",
                    padding: "8px",
                  }}
                />
              </Box>

              <CardContent sx={{ paddingTop: "40px" }}>
                {/* 🔹 Adjusted padding to prevent overlap */}
                <Typography
                  variant="h6"
                  sx={{ color: "#ffcc00", fontWeight: "bold", fontSize: 10 }}
                >
                  {booster.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#00ffcc", fontSize: 10 }}
                >
                  Duration: {booster.duration}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#ff6666", fontSize: 10 }}
                >
                  Multiplier: {booster.multiplier}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#66ccff", mt: 1, fontSize: 10 }}
                >
                  💎 {booster.price}
                </Typography>
                {/* Button */}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#ffcc00",
                      color: "#000",
                      fontWeight: "bold",
                      fontSize: 10,
                      minWidth: "130px",
                      boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.2)",
                      borderRadius: "20px",
                      "&:hover": { backgroundColor: "#ffaa00" },
                    }}
                  >
                    Coming Soon
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Boosters;
