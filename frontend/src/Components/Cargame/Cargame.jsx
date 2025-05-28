import { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  TextField,
  Typography,
  DialogContent,
  DialogActions,
} from "@mui/material";
import player from "../../assets/player.png";
import enemycar1 from "../../assets/enemycar1.png";
import enemycar2 from "../../assets/enemycar2.png";
import enemycar3 from "../../assets/enemycar3.png";
import enemycar4 from "../../assets/enemycar4.png";
import enemycar5 from "../../assets/enemycar5.png";
import road from "../../assets/road.png";
import cardrive from "../../assets/cardrive.mp3";
import crash from "../../assets/crash.mp3";
import splash from "../../assets/splash.mp3";
import coin from "../../assets/coin.mp3";
import pothole from "../../assets/pothole.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GameControlles, PlaceBet, UserProfile } from "../../ApiConfig";
import bg1 from "../../assets/bg1.png";

export default function Cargame() {
  // Game constants
  const CANVAS_WIDTH = 420;
  const CANVAS_HEIGHT = 1000;
  const LANE_COUNT = 4;
  const ROAD_X_START = 40; // Left road boundary
  const ROAD_X_END = CANVAS_WIDTH - 40; // Right road boundary
  const LANE_WIDTH = (ROAD_X_END - ROAD_X_START) / LANE_COUNT; // Lane width within road boundaries
  const PLAYER_CAR_HEIGHT = 80;
  const PLAYER_CAR_WIDTH = 60;
  const OBSTACLE_CAR_HEIGHT = 80;
  const OBSTACLE_CAR_WIDTH = 50;
  const COIN_RADIUS = 15;
  const POTHOLE_WIDTH = 60;
  const POTHOLE_HEIGHT = 20;

  // const ROAD_SPEED = 5;
  // const ENEMY_SPEED = 2; // Speed for obstacle cars moving down
  // const OBSTACLE_SPAWN_RATE = 0.003;
  // const COIN_SPAWN_RATE = 0.01;
  // const COIN_VALUE = 10;
  // const POTHOLE_RATE = 10;
  // const COIN_SERIES_COUNT = 10;
  // const COIN_SERIES_SPACING = 50;
  // const COIN_SERIES_DISTANCE = 30;
  // const LAST_POTHOLE_DISTANCE = 150; // Tracks the distance when last pothole was spawned
  // const LEVEL_DISTANCE = 200; // Distance needed to level up (adjust as needed)
  const [showInitialScreen, setShowInitialScreen] = useState(true);
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [lifeLeft, setLifeLeft] = useState(3); // Initialize life left
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [explosionActive, setExplosionActive] = useState(false);
  const [explosionPosition, setExplosionPosition] = useState({ x: 0, y: 0 });
  const potholesRef = useRef([]);
  const audioRef = useRef(null); // Audio reference when game starts
  const crashAudioRef = useRef(null); // For crash sound
  const coinAudioRef = useRef(null); // For coin collection sound
  const splashAudioRef = useRef(null); //for splash out sound
  const explosionParticlesRef = useRef([]);
  const explosionCanvasRef = useRef(null);
  const waterCanvasRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState();
  const currentScoreRef = useRef(0);
  const gameHistoryIdRef = useRef(null);
  const currentGameStateRef = useRef(null);

  //GameControlles States
  const [stage, setStage] = useState(0);
  const [roadSpeed, setRoadSpeed] = useState(5);
  const [enemySpeed, setEnemySpeed] = useState(2);
  const [obstacleSpawnRate, setObstacleSpawnRate] = useState(0.01);
  const [coinValue, setCoinValue] = useState(10);
  const [potholeRate, setPotholeRate] = useState(10);
  const [coinSeriesCount, setCoinSeriesCount] = useState(10);
  const [coinSeriesSpacing, setCoinSeriesSpacing] = useState(50);
  const [coinSeriesDistance, setCoinSeriesDistance] = useState(20);
  const [lastPotholeDistance, setLastPotholeDistance] = useState(150);
  const [levelDistance, setLevelDistance] = useState(20);
  const [currentLevel, setCurrentLevel] = useState(0);

  const [splashActive, setSplashActive] = useState(false);
  const [splashPosition, setSplashPosition] = useState({ x: 0, y: 0 });
  const splashParticlesRef = useRef([]);
  const [adSDKFunctions, setAdSDKFunctions] = useState([]);

  //BetPopup
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [betAmount, setBetAmount] = useState(0);
  const [gameId, setGameId] = useState("682c52efdc400a61db731520");
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [adWatchesLeft, setAdWatchesLeft] = useState(1);
  const [ticketBalance, setTicketBalance] = useState(0);
  const [minBet, setMinBet] = useState(200);
  const [maxBet, setMaxBet] = useState(500);

  // Update the score ref whenever the score state changes
  useEffect(() => {
    currentScoreRef.current = score;
  }, [score]);

  //hearth Symbol render
  const renderHearts = (count) => {
    return Array.from({ length: count }).map((_, index) => (
      <span
        key={index}
        style={{
          color: "red",
          marginRight: "4px",
          fontSize: "18px",
        }}
      >
        ♥
      </span>
    ));
  };

  //Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem("userId"); // ✅ Fetch stored user ID

      if (!userId) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${UserProfile}/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("stringToken")}`,
          },
        });
        console.log("TicketBalance", response.data.user.ticketBalance);

        setTicketBalance(response.data.user.ticketBalance);
        // console.log(response.data.user);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear localStorage when the page is refreshed or closed
      currentGameStateRef.current = null; // Clear the ref
      // localStorage.removeItem("gameState");
      localStorage.removeItem("currentGameHistoryId"); // Add any other items you want to clear
    };

    // Attach the event listener when the component mounts
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handlePlayNow = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError("");
    navigate("/gameinfo");
  };

  const placebet = async () => {
    const stringToken = localStorage.getItem("stringToken");
    if (!stringToken) {
      setError("Unauthorized: No authentication token found.");
      setLoading(false);
      return;
    }
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("Unauthorized: No authentication token found.");
      setLoading(false);
      return;
    }
    console.log(`${PlaceBet}`);

    try {
      const response = await axios.post(
        `${PlaceBet}/${userId}`,
        {
          gameId,
          betAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${stringToken}`,
            "Content-Type": "application/json", // ✅ Ensure correct content type
          },
        }
      );
      setMessage(response.data.message);
      // Store the historyId in the ref
      gameHistoryIdRef.current = response.data.data.gameHistoryId;
      // Also store in localStorage as a backup
      localStorage.setItem("currentGameHistoryId", gameHistoryIdRef.current);
      startGameLoop();
    } catch (error) {
      console.error("Error posting PlaceBet:", error);
    } finally {
      setLoading(false);
    }
  };

  //updateGame Result
  const updateGameResult = async (playedStatus) => {
    const gameHistoryId = gameHistoryIdRef.current;
    const winAmount = currentScoreRef.current;
    console.log(
      "updateGameResult called with:",
      gameHistoryId,
      playedStatus,
      winAmount
    );

    // Make sure winAmount is a number and use the current score ref as a fallback
    const finalWinAmount = Number(winAmount) || currentScoreRef.current;

    console.log(
      "gameHistoryId :",
      gameHistoryId,
      "playedStatus :",
      playedStatus,
      "winAmount :",
      finalWinAmount
    );
    const stringToken = localStorage.getItem("stringToken");
    if (!stringToken) {
      setError("Unauthorized: No authentication token found.");
      setLoading(false);
      return;
    }
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("Unauthorized: No authentication token found.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${PlaceBet}/${userId}`,
        {
          gameHistoryId,
          playedStatus,
          winAmount: finalWinAmount, // Ensure we're sending the correct value
        },
        {
          headers: {
            Authorization: `Bearer ${stringToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMessage(response.data);
      console.log("API response:", response.data);
    } catch (error) {
      console.error("Error posting PlaceBet:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGameLose = () => {
    // Store current game state before pausing

    const currentGameState = {
      score: currentScoreRef.current,
      lives: lifeLeft,
      stage: currentLevel, // current stage/level
      totalDistance: gameStateRef.current.totalDistance, // total distance traveled
      adWatchesLeft: adWatchesLeft, // Save the remaining ad watches
    };
    currentGameStateRef.current = currentGameState;
  };

  const handlePlayGame = () => {
    const bet = Number(betAmount);

    if (!bet || isNaN(bet)) {
      setError("Please enter a valid amount");
      return;
    }

    if (bet < minBet) {
      setError(`Minimum bet amount is ${minBet}`);
      return;
    }

    if (bet > maxBet) {
      setError(`Maximum bet amount is ${maxBet}`);
      return;
    }

    if (bet > ticketBalance) {
      setError("Insufficient balance");
      return;
    }

    // If all validations pass
    startGame();
  };

  // const handleAmountChange = (event) => {
  //   const bet = event.target.value;

  //   // Ensure the value is correctly captured as string
  //   setBetAmount(bet);

  //   // setBetAmount(e.target.value);

  //   if (error) setError("");
  // };

  // Fetch the game settings
  const handleAmountChange = (event) => {
    const value = event.target.value;
    setBetAmount(value);

    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  useEffect(() => {
    const fetchLevelData = async () => {
      const stringToken = localStorage.getItem("stringToken");
      if (!stringToken) {
        setError("Unauthorized: No authentication token found.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${GameControlles}/${gameId}`, {
          headers: { Authorization: `Bearer ${stringToken}` },
        });
        console.log("API Response1", response.data.data.level);
        console.log("API Response2", response.data.data.adSDK);

        setCategoryData(response.data.data.level);
        setMinBet(response.data.data.min || 200);
        setMaxBet(response.data.data.max || 500);
        console.log(response.data.data.min, response.data.data.max);
        console.log(
          "AdswatchesLeft",
          response.data.data.level[0].adWatchesLeft
        );
        setAdWatchesLeft(response.data.data.level[0].adWatchesLeft);
        // Store the adSDK functions if they exist
        if (
          response.data.data.adSDK &&
          Array.isArray(response.data.data.adSDK)
        ) {
          const adFunctions = response.data.data.adSDK.map(
            (item) => item.adSDK
          );
          setAdSDKFunctions(adFunctions);
          console.log("Loaded adSDK functions:", adFunctions);
        }
        if (
          response.data.data &&
          response.data.data.level.length > 0 &&
          response.data.data.level
        ) {
          console.log("Updated level data:", response.data.data.level);
        } else {
          console.log("Level data is missing or undefined.");
        }
        // setGameSettings(response.data.data);
      } catch (error) {
        console.error("Error fetching GameControlles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLevelData();
  }, []);

  // Optional: Log categoryData when it changes so you can verify that it's updated
  useEffect(() => {
    console.log("Updated level data:", categoryData);
  }, [categoryData]);

  useEffect(() => {
    if (categoryData && stage >= 0 && stage < categoryData.length) {
      const currentLevelData = categoryData[stage];

      console.log("Current Level Data:", currentLevelData); // Log for debugging
      // console.log("levelDatalength", categoryData.length);

      // Set the multiplier for the current level
      const roadSpeed = Number.parseFloat(currentLevelData.roadspeed);
      setRoadSpeed(roadSpeed || 5);

      // Set the enemySpeed for the current level
      const enemySpeed = Number.parseFloat(currentLevelData.enemyspeed);
      setEnemySpeed(enemySpeed || 5);

      // Set the obstacleSpawnRate for the current level
      const obstacleSpawnRate = Number.parseFloat(
        currentLevelData.obstaclespawnrate
      );
      setObstacleSpawnRate(obstacleSpawnRate || 0.1);

      // Set the coinValue for the current level
      const coinValue = Number.parseFloat(currentLevelData.coinvalue);
      setCoinValue(coinValue || 0.1);

      // Set the potholeRate for the current level
      const potholeRate = Number.parseFloat(currentLevelData.potholerate);
      setPotholeRate(potholeRate || 0.1);

      // Set the coinSeriesCount for the current level
      const coinSeriesCount = Number.parseFloat(
        currentLevelData.coinseriescount
      );
      setCoinSeriesCount(coinSeriesCount || 0.1);

      // Set the coinSeriesSpacing for the current level
      const coinSeriesSpacing = Number.parseFloat(
        currentLevelData.coinseriesspacing
      );
      setCoinSeriesSpacing(coinSeriesSpacing || 0.1);

      // Set the coinSeriesDistance for the current level
      const coinSeriesDistance = Number.parseFloat(
        currentLevelData.coinseriesdistance
      );
      setCoinSeriesDistance(coinSeriesDistance || 0.1);

      // Set the lastPotholeDistance for the current level
      const lastPotholeDistance = Number.parseFloat(
        currentLevelData.lastpotholedistance
      );
      setLastPotholeDistance(lastPotholeDistance || 0.1);

      // Set the levelDistance for the current level
      const levelDistance = Number.parseFloat(currentLevelData.leveldistance);
      setLevelDistance(levelDistance || 0.1);

      // Set the currentLevel for the current level
      const currentLevel = Number.parseFloat(currentLevelData.level);
      setCurrentLevel(currentLevel || 0.1);
    }
  }, [stage, categoryData]); // Re-run when the level or levelData changes

  const coinSeriesRef = useRef({
    active: false,
    count: 0,
    lane: 0,
    currentY: 0,
    lastSeriesY: -coinSeriesDistance, // Tracks the distance when last series was spawned
    lastPotholeDistance: -lastPotholeDistance, // Tracks the distance when last pothole was spawned
  });

  const gameStateRef = useRef({
    playerCar: {
      x: CANVAS_WIDTH / 2 - PLAYER_CAR_WIDTH / 2,
      y: CANVAS_HEIGHT - PLAYER_CAR_HEIGHT - 20,
      width: PLAYER_CAR_WIDTH,
      height: PLAYER_CAR_HEIGHT,
      lane: Math.floor(LANE_COUNT / 2),
      color: "#3498db",
      speed: 0,
      image: null,
    },
    obstacleCars: [],
    coins: [],
    roadOffset: 0,
    totalDistance: 0, // Tracks total distance traveled
    animationFrameId: 0,
    lastTimestamp: 0,
    gameRunning: false,
    enemyImages: [],
    roadImage: null, // For road.png
    Lives: 3, // Initialize lives
  });

  // Initialize audio when component mounts
  useEffect(() => {
    // Initialize audio elements directly with their sources
    audioRef.current = new Audio(cardrive);
    audioRef.current.loop = true;
    audioRef.current.preload = "auto";

    crashAudioRef.current = new Audio(crash);
    crashAudioRef.current.preload = "auto";

    splashAudioRef.current = new Audio(splash);
    splashAudioRef.current.preload = "auto";

    coinAudioRef.current = new Audio(coin);
    coinAudioRef.current.preload = "auto";

    return () => {
      // Clean up crash audio when component unmounts
      [audioRef.current, crashAudioRef.current, coinAudioRef.current].forEach(
        (audio) => {
          if (audio) {
            audio.pause();
            audio.src = "";
          }
        }
      );

      //clean up splash audio when component unmount
      [
        audioRef.current,
        splashAudioRef.current,
        splashAudioRef.current,
      ].forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Load images for player car
    const playerImage = new Image();
    playerImage.src = player;
    playerImage.onload = () => {
      gameStateRef.current.playerCar.image = playerImage;
      drawInitialGame(ctx); // Draw initial game after player image loads
    };

    // Load enemy car images
    const enemyImages = [
      new Image(),
      new Image(),
      new Image(),
      new Image(),
      new Image(),
    ];
    enemyImages[0].src = enemycar1;
    enemyImages[1].src = enemycar2;
    enemyImages[2].src = enemycar3;
    enemyImages[3].src = enemycar4;
    enemyImages[4].src = enemycar5;
    gameStateRef.current.enemyImages = enemyImages;

    // Load road image
    const roadImage = new Image();
    roadImage.src = road;
    roadImage.onload = () => {
      gameStateRef.current.roadImage = roadImage;
      drawInitialGame(ctx); // Draw initial game after road image loads
    };

    // Load pothole image
    const potholeImage = new Image();
    potholeImage.src = pothole;
    gameStateRef.current.potholeImage = potholeImage;

    // Function to draw initial game state (before game starts)
    const drawInitialGame = (ctx) => {
      if (!ctx) return;

      // Only draw if both player and road images are loaded
      if (
        gameStateRef.current.playerCar.image &&
        gameStateRef.current.roadImage
      ) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw the road (static position before scrolling starts)
        ctx.drawImage(
          gameStateRef.current.roadImage,
          0,
          0,
          CANVAS_WIDTH,
          CANVAS_HEIGHT
        );

        // Draw player car
        const player = gameStateRef.current.playerCar;
        if (player.image.complete) {
          ctx.drawImage(
            player.image,
            player.x,
            player.y,
            player.width,
            player.height
          );
        }
      }
    };

    // Initial draw
    drawInitialGame(ctx);

    // Event listeners for drag controls
    const handleDragStart = (event) => {
      const rect = canvas.getBoundingClientRect();
      const positionX =
        (event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
      setDragStartX(positionX);
      setIsDragging(true);
    };

    const handleDragMove = (event) => {
      if (!isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const positionX =
        (event.touches ? event.touches[0].clientX : event.clientX) - rect.left;

      gameStateRef.current.playerCar.x = Math.max(
        ROAD_X_START,
        Math.min(
          positionX - dragStartX + gameStateRef.current.playerCar.x,
          ROAD_X_END - PLAYER_CAR_WIDTH
        )
      );

      setDragStartX(positionX);
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    // Keyboard controls
    const handleKeyDown = (e) => {
      const playerCar = gameStateRef.current.playerCar;
      const moveAmount = 20; // Pixels to move per key press

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          playerCar.x = Math.max(ROAD_X_START, playerCar.x - moveAmount);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          playerCar.x = Math.min(
            ROAD_X_END - PLAYER_CAR_WIDTH,
            playerCar.x + moveAmount
          );
          break;
        // You can add up/down controls if needed
        case "ArrowUp":
        case "w":
        case "W":
          // playerCar.y = Math.max(0, playerCar.y - moveAmount);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          // playerCar.y = Math.min(CANVAS_HEIGHT - PLAYER_CAR_HEIGHT, playerCar.y + moveAmount);
          break;
      }
    };

    // Add event listeners
    canvas.addEventListener("mousedown", handleDragStart);
    canvas.addEventListener("mousemove", handleDragMove);
    canvas.addEventListener("mouseup", handleDragEnd);

    canvas.addEventListener("touchstart", handleDragStart);
    canvas.addEventListener("touchmove", handleDragMove);
    canvas.addEventListener("touchend", handleDragEnd);

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      // Cleanup event listeners
      canvas.removeEventListener("mousedown", handleDragStart);
      canvas.removeEventListener("mousemove", handleDragMove);
      canvas.removeEventListener("mouseup", handleDragEnd);

      canvas.removeEventListener("touchstart", handleDragStart);
      canvas.removeEventListener("touchmove", handleDragMove);
      canvas.removeEventListener("touchend", handleDragEnd);

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDragging, dragStartX]);

  //explosion effect
  useEffect(() => {
    if (!explosionActive) return;

    const canvas = explosionCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = [
      "#6A0000",
      "#900000",
      "#902B2B",
      "#A63232",
      "#A62626",
      "#FD5039",
      "#C12F2A",
      "#FF6540",
      "#f93801",
    ];

    // Initialize particles
    explosionParticlesRef.current = [];
    for (let i = 0; i < 100; i++) {
      explosionParticlesRef.current.push({
        x: explosionPosition.x,
        y: explosionPosition.y,
        size: Math.random() * 15 + 5,
        speedX: (Math.random() - 0.5) * 8,
        speedY: (Math.random() - 0.5) * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        decay: Math.random() * 0.02 + 0.01,
      });
    }

    let animationFrameId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      let activeParticles = 0;

      explosionParticlesRef.current.forEach((particle) => {
        if (particle.opacity > 0) {
          activeParticles++;

          // Update particle
          particle.x += particle.speedX;
          particle.y += particle.speedY;
          particle.opacity -= particle.decay;

          // Draw particle
          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size
          );
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(1, "rgba(0,0,0,0)");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      if (activeParticles > 0) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setExplosionActive(false);
      }
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [explosionActive, explosionPosition]);

  //Water splash out effect
  // Water splash effect
  useEffect(() => {
    if (!splashActive) return;

    const canvas = waterCanvasRef.current; // Reusing the same canvas
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize splash particles
    splashParticlesRef.current = [];
    for (let i = 0; i < 50; i++) {
      splashParticlesRef.current.push({
        x: splashPosition.x,
        y: splashPosition.y,
        size: Math.random() * 8 + 3,
        speedX: (Math.random() - 0.5) * 6,
        speedY: (Math.random() - 0.8) * 8, // More upward motion
        color: `rgba(64, 164, 223, ${Math.random() * 0.7 + 0.3})`,
        opacity: 1,
        decay: Math.random() * 0.02 + 0.01,
      });
    }

    let animationFrameId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      let activeParticles = 0;

      splashParticlesRef.current.forEach((particle) => {
        if (particle.opacity > 0) {
          activeParticles++;

          // Update particle with gravity effect
          particle.x += particle.speedX;
          particle.y += particle.speedY;
          particle.speedY += 0.1; // Gravity
          particle.opacity -= particle.decay;

          // Draw particle
          ctx.fillStyle = particle.color;
          ctx.globalAlpha = particle.opacity;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      if (activeParticles > 0) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setSplashActive(false);
      }
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [splashActive, splashPosition]);

  const startGameLoop = () => {
    // const savedGameState = JSON.parse(localStorage.getItem("gameState"));
    const savedGameState = currentGameStateRef.current;
    // console.log("savedGameState", savedGameState);

    if (savedGameState) {
      // Set the game state values from saved data if available
      setScore(savedGameState.score);
      setLifeLeft(savedGameState.lives);
      setStage(currentLevel);
      // console.log(currentLevel);
      setAdWatchesLeft(
        savedGameState.adWatchesLeft !== undefined
          ? savedGameState.adWatchesLeft
          : 3
      );
      gameStateRef.current.totalDistance = savedGameState.totalDistance;
    }

    // The rest of your game loop logic goes here...

    // Start the game loop as usual
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    gameStateRef.current.gameRunning = true;
    gameStateRef.current.lastTimestamp = performance.now();

    // Start playing audio when game starts
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset audio to start
      audioRef.current.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });
    }

    // Start the game loop animation
    const gameLoop = (timestamp) => {
      if (!gameStateRef.current.gameRunning) return;

      const deltaTime = timestamp - gameStateRef.current.lastTimestamp;
      gameStateRef.current.lastTimestamp = timestamp;

      // Update score and score ref
      setScore((prev) => {
        const newScore = prev + Math.floor(deltaTime / 100);
        currentScoreRef.current = newScore;
        return newScore;
      });

      updateGame(deltaTime);
      drawGame(ctx);

      gameStateRef.current.animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameStateRef.current.animationFrameId = requestAnimationFrame(gameLoop);
  };

  const checkCoinCollection = () => {
    const playerCar = gameStateRef.current.playerCar;
    const coins = gameStateRef.current.coins;

    for (let i = coins.length - 1; i >= 0; i--) {
      const coin = coins[i];
      const distance = Math.sqrt(
        Math.pow(
          playerCar.x + playerCar.width / 2 - (coin.x + coin.radius),
          2
        ) +
          Math.pow(
            playerCar.y + playerCar.height / 2 - (coin.y + coin.radius),
            2
          )
      );

      if (
        distance <
        coin.radius + Math.min(playerCar.width, playerCar.height) / 2
      ) {
        // Update score and score ref
        setScore((prev) => {
          const newScore = prev + coinValue;
          currentScoreRef.current = newScore;
          return newScore;
        });

        gameStateRef.current.coins.splice(i, 1);

        // Play coin collection sound
        if (coinAudioRef.current) {
          coinAudioRef.current.currentTime = 0; // Rewind to start
          coinAudioRef.current
            .play()
            .catch((e) => console.log("Coin audio error:", e));
        }
      }
    }
  };

  const updateGame = (deltaTime) => {
    // Update road offset for scrolling effect
    gameStateRef.current.roadOffset += roadSpeed;

    if (gameStateRef.current.roadOffset >= CANVAS_HEIGHT) {
      gameStateRef.current.roadOffset -= CANVAS_HEIGHT;
    }

    // Accumulate total distance traveled
    gameStateRef.current.totalDistance += roadSpeed * (deltaTime / 1000);

    // Check level progression FIRST (before collision checks)
    const newLevel = Math.floor(
      gameStateRef.current.totalDistance / levelDistance
    );
    if (newLevel > stage) {
      setStage(newLevel);
      // Check if player reached the max level (levelData.length)
      if (newLevel >= categoryData.length) {
        // Use the current score ref for the most up-to-date score
        console.log("Game won with score:", currentScoreRef.current);
        handleGameLose();
        setGameWon(true);

        endGame(); // End the game when player wins
        return; // Exit early to prevent further updates
      }
    }

    // If game is already won, don't process further updates
    if (gameWon) return;

    // Update obstacle cars' positions - move them down with the road
    gameStateRef.current.obstacleCars.forEach((car) => {
      car.y += car.speed; // Add speed to move downward
    });

    // Update coins' positions
    gameStateRef.current.coins.forEach((coin) => {
      coin.y += roadSpeed;
    });
    // Update potholes' positions
    updatePotholes();

    // Remove obstacles, coins, and potholes that are off-screen
    gameStateRef.current.obstacleCars =
      gameStateRef.current.obstacleCars.filter((car) => car.y < CANVAS_HEIGHT);
    gameStateRef.current.coins = gameStateRef.current.coins.filter(
      (coin) => coin.y < CANVAS_HEIGHT
    );

    // Spawn obstacle cars randomly
    if (Math.random() < obstacleSpawnRate) {
      spawnObstacleCar();
    }
    // Handle coin series spawning with distance check using totalDistance
    if (
      !coinSeriesRef.current.active &&
      gameStateRef.current.totalDistance - coinSeriesRef.current.lastSeriesY >
        coinSeriesDistance
    ) {
      coinSeriesRef.current.active = true;
      coinSeriesRef.current.count = coinSeriesCount;
      coinSeriesRef.current.lane = Math.floor(Math.random() * LANE_COUNT);
      coinSeriesRef.current.currentY = -COIN_RADIUS * 2;
      coinSeriesRef.current.lastSeriesY = gameStateRef.current.totalDistance; // Update last series distance
    }

    // Spawn coins in the series
    if (coinSeriesRef.current.active) {
      if (coinSeriesRef.current.count > 0) {
        // Center coins in the lane, ensuring they stay within road boundaries
        const x =
          ROAD_X_START +
          coinSeriesRef.current.lane * LANE_WIDTH +
          LANE_WIDTH / 2 -
          COIN_RADIUS;

        const coin = {
          x,
          y: coinSeriesRef.current.currentY,
          radius: COIN_RADIUS,
          lane: coinSeriesRef.current.lane,
        };

        gameStateRef.current.coins.push(coin);
        coinSeriesRef.current.count--;
        coinSeriesRef.current.currentY -= coinSeriesSpacing;
      } else {
        coinSeriesRef.current.active = false;
      }
    }

    // Spawn potholes
    spawnPothole();

    // Check for collisions with obstacle cars and potholes
    const shouldEndGame = checkCollisions();
    if (shouldEndGame) {
      // No need to call handleGameLose here as it's already called in checkCollisions
      endGame();
      return; // Stop further updates if game should end
    }

    // Check for coin collection
    checkCoinCollection();
  };

  const drawGame = (ctx) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawRoad(ctx);
    drawPotholes(ctx);
    drawCoins(ctx);
    drawCar(ctx, gameStateRef.current.playerCar);

    gameStateRef.current.obstacleCars.forEach((car) => {
      drawCar(ctx, car);
    });

    // Draw level indicator
    // drawLevelIndicator(ctx)
  };

  // const drawLevelIndicator = (ctx) => {
  //   ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
  //   ctx.fillRect(10, 60, 100, 40)
  //   ctx.fillStyle = "#FFFFFF"
  //   ctx.font = "16px Arial"
  //   ctx.fillText(`Level: ${level + 1}/${levelData.length}`, 20, 85)
  // }

  const drawRoad = (ctx) => {
    const roadImage = gameStateRef.current.roadImage;

    if (roadImage && roadImage.complete && roadImage.naturalHeight !== 0) {
      // Draw the road image twice to create a seamless scrolling effect
      const y1 =
        -CANVAS_HEIGHT + (gameStateRef.current.roadOffset % CANVAS_HEIGHT);
      const y2 = y1 + CANVAS_HEIGHT;
      ctx.drawImage(roadImage, 0, y1, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(roadImage, 0, y2, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  };

  const drawCar = (ctx, car) => {
    if (car.image && car.image.complete && car.image.naturalHeight !== 0) {
      ctx.drawImage(car.image, car.x, car.y, car.width, car.height);
    }
  };

  const drawCoins = (ctx) => {
    ctx.fillStyle = "#FFD700";
    gameStateRef.current.coins.forEach((coin) => {
      ctx.beginPath();
      ctx.arc(
        coin.x + coin.radius,
        coin.y + coin.radius,
        coin.radius,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.fillStyle = "#FFC600";
      ctx.beginPath();
      ctx.arc(
        coin.x + coin.radius,
        coin.y + coin.radius,
        coin.radius * 0.7,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.fillStyle = "#FFD700";
    });
  };

  // Draw potholes
  const drawPotholes = (ctx) => {
    const potholeImage = gameStateRef.current.potholeImage;

    if (!potholeImage) return;

    potholesRef.current.forEach((pothole) => {
      // Only draw if within road boundaries
      if (
        pothole.x >= ROAD_X_START &&
        pothole.x + pothole.width <= ROAD_X_END
      ) {
        if (potholeImage.complete && potholeImage.naturalHeight !== 0) {
          // Draw the pothole image with the specified dimensions
          ctx.drawImage(
            potholeImage,
            pothole.x,
            pothole.y,
            pothole.width,
            pothole.height
          );
        }
      }
    });
  };

  // Spawn obstacle cars(Generate random cars in random lanes)
  const spawnObstacleCar = () => {
    const enemyImages = gameStateRef.current.enemyImages || [];
    // Only use images that are fully loaded
    const validImages = enemyImages.filter(
      (img) => img && img.complete && img.naturalHeight !== 0
    );

    // If no valid images, use null and the fallback will be used
    const randomImage =
      validImages.length > 0
        ? validImages[Math.floor(Math.random() * validImages.length)]
        : null;

    const lanes = Array.from({ length: LANE_COUNT }, (_, i) => i);
    lanes.sort(() => Math.random() - 0.5);

    for (const lane of lanes) {
      // Center obstacle cars in the lane, ensuring they stay within road boundaries
      const x =
        ROAD_X_START +
        lane * LANE_WIDTH +
        LANE_WIDTH / 2 -
        OBSTACLE_CAR_WIDTH / 2;

      // Check if there's already a car in this lane near the top of the screen
      const hasCarInLane = gameStateRef.current.obstacleCars.some(
        (car) => car.lane === lane && car.y < CANVAS_HEIGHT * 0.3
      );

      if (!hasCarInLane) {
        // Generate the car above the visible area
        const obstacleCar = {
          x,
          y: -OBSTACLE_CAR_HEIGHT, // Start above the canvas
          width: OBSTACLE_CAR_WIDTH,
          height: OBSTACLE_CAR_HEIGHT,
          lane,
          color: "#e74c3c",
          speed: enemySpeed * (0.8 + Math.random() * 0.4), // Speed for moving down from current level
          image: randomImage,
        };

        gameStateRef.current.obstacleCars.push(obstacleCar);
        return;
      }
    }
  };

  // Spawn potholes(Generate random potholes in random lanes)
  const spawnPothole = () => {
    // Calculate the adjusted minimum distance threshold based on POTHOLE_RATE
    const adjustedDistanceThreshold = 100 / potholeRate; // Reduce threshold as the rate increases

    // Only spawn potholes if the last one is far enough away
    if (
      gameStateRef.current.totalDistance -
        (coinSeriesRef.current.lastPotholeDistance || 0) >
      adjustedDistanceThreshold
    ) {
      // Adjusted rate controls the probability of spawning potholes
      if (Math.random() < potholeRate) {
        // Center potholes in the lane, ensuring they stay within road boundaries
        const randomLane = Math.floor(Math.random() * LANE_COUNT);
        const potholeX =
          ROAD_X_START +
          randomLane * LANE_WIDTH +
          LANE_WIDTH / 2 -
          POTHOLE_WIDTH / 2;

        potholesRef.current.push({
          x: potholeX,
          y: -POTHOLE_HEIGHT,
          width: POTHOLE_WIDTH,
          height: POTHOLE_HEIGHT,
          lane: randomLane,
        });

        // Update the last pothole distance
        coinSeriesRef.current.lastPotholeDistance =
          gameStateRef.current.totalDistance;
      }
    }
  };

  // Update potholes' positions and remove off-screen ones
  const updatePotholes = () => {
    for (let i = potholesRef.current.length - 1; i >= 0; i--) {
      const pothole = potholesRef.current[i];
      pothole.y += roadSpeed;

      if (pothole.y > CANVAS_HEIGHT) {
        potholesRef.current.splice(i, 1);
      }
    }
  };

  // Check for collisions with potholes and obstacle cars
  const checkCollisions = () => {
    const playerCar = gameStateRef.current.playerCar;

    // Check collision with obstacle cars (immediate game over)
    for (const obstacleCar of gameStateRef.current.obstacleCars) {
      if (
        playerCar.x + playerCar.width > obstacleCar.x &&
        playerCar.x < obstacleCar.x + obstacleCar.width &&
        playerCar.y + playerCar.height > obstacleCar.y &&
        playerCar.y < obstacleCar.y + obstacleCar.height
      ) {
        // Crash sound and explosion effect
        if (crashAudioRef.current) {
          crashAudioRef.current.currentTime = 0;
          crashAudioRef.current
            .play()
            .catch((e) => console.log("Crash sound error:", e));
        }
        // Trigger explosion effect
        setExplosionPosition({
          x: (playerCar.x + obstacleCar.x) / 2,
          y: (playerCar.y + obstacleCar.y) / 2,
        });
        setExplosionActive(true);

        //Clear the Obstacle cars that caused the collision
        gameStateRef.current.obstacleCars =
          gameStateRef.current.obstacleCars.filter(
            (car) => car !== obstacleCar
          );

        gameStateRef.current.Lives = 0;
        setLifeLeft(0);

        // Call handleGameLose with the current score
        console.log(
          "Collision with obstacle car, ending game with score:",
          currentScoreRef.current
        );
        handleGameLose();

        return true; // Game over
      }
    }

    // Check collision with potholes (reduce lives)
    for (let i = potholesRef.current.length - 1; i >= 0; i--) {
      const pothole = potholesRef.current[i];

      if (
        pothole.y + pothole.height > playerCar.y &&
        pothole.y < playerCar.y + playerCar.height
      ) {
        const playerCenterX = playerCar.x + playerCar.width / 2;

        if (
          playerCenterX > pothole.x &&
          playerCenterX < pothole.x + pothole.width
        ) {
          // Play splash sound effect (only for pothole collision)
          if (splashAudioRef.current) {
            splashAudioRef.current.currentTime = 0;
            splashAudioRef.current
              .play()
              .catch((e) => console.log("Splash sound error:", e));
          }

          // Trigger splash effect at pothole position
          setSplashPosition({
            x: playerCenterX,
            y: pothole.y + pothole.height,
          });
          setSplashActive(true);

          potholesRef.current.splice(i, 1);

          // Reduce lives
          const newLives = gameStateRef.current.Lives - 1;
          gameStateRef.current.Lives = newLives;
          setLifeLeft(newLives);

          // If lives reached 0, end game
          if (newLives <= 0) {
            console.log(
              "Lives reached 0, ending game with score:",
              currentScoreRef.current
            );
            // Call handleGameLose with the current score
            handleGameLose();
            return true; // This will trigger game over
          }
          return false; // Just reduce lives but continue game
        }
      }
    }

    return false;
  };

  const startGame = () => {
    gameStateRef.current.playerCar = {
      x: CANVAS_WIDTH / 2 - PLAYER_CAR_WIDTH / 2,
      y: CANVAS_HEIGHT - PLAYER_CAR_HEIGHT - 20,
      width: PLAYER_CAR_WIDTH,
      height: PLAYER_CAR_HEIGHT,
      lane: Math.floor(LANE_COUNT / 2),
      color: "#3498db",
      speed: 0,
      image: gameStateRef.current.playerCar.image,
    };
    gameStateRef.current.obstacleCars = [];
    gameStateRef.current.coins = [];
    gameStateRef.current.roadOffset = 0;
    gameStateRef.current.totalDistance = 0; // Reset total distance
    coinSeriesRef.current.active = false;
    coinSeriesRef.current.count = 0;
    coinSeriesRef.current.lastSeriesY = -coinSeriesDistance;
    coinSeriesRef.current.lastPotholeDistance = -lastPotholeDistance; // Reset last pothole distance
    gameStateRef.current.Lives = 3; // Reset lives

    // Reset level
    setStage(0);
    setGameWon(false);
    setScore(0);
    currentScoreRef.current = 0; // Reset score ref
    setLifeLeft(3); // Reset lifeLeft to 3
    setAdWatchesLeft(3);
    setGameOver(false);
    setGameStarted(true);
    setOpen(false); //to close the bet popup
    placebet(); //to placeBet
    setBetAmount(betAmount);

    // Reset audio states
    if (crashAudioRef.current) {
      crashAudioRef.current.pause();
    }
    if (splashAudioRef.current) {
      splashAudioRef.current.pause();
    }
    if (coinAudioRef.current) {
      coinAudioRef.current.pause();
    }
    setExplosionActive(false);
  };

  const endGame = () => {
    gameStateRef.current.gameRunning = false;
    setGameOver(true);
    // Only set gameOver if it's not a win
    if (!gameWon && !gameOver) {
      setGameOver(true);
    }

    if (score > highScore) {
      setHighScore(score);
    }

    // Stop audio when game ends
    if (audioRef.current) {
      audioRef.current.pause();
    }

    cancelAnimationFrame(gameStateRef.current.animationFrameId);
  };

  const playAgain = () => {
    const playedStatus = "LOSE";
    updateGameResult(playedStatus);
    setGameOver(true);
    setGameStarted(false); // Game is paused
    setGameWon(false);
    setExplosionActive(false);
    currentGameStateRef.current = null; // Clear the ref
    navigate("/gameinfo");
  };

  const watchAdHandler = () => {
    // Check if ad watches are exhausted
    if (adWatchesLeft <= 0) {
      console.log("No more ad watches left");
      return;
    }

    // Pause the game immediately
    gameStateRef.current.gameRunning = false;
    if (gameStateRef.current.animationFrameId) {
      cancelAnimationFrame(gameStateRef.current.animationFrameId);
    }

    // Get the current ad function from the adSDKFunctions array
    const currentAdIndex = adWatchesLeft - 1;
    const adFunction = adSDKFunctions[currentAdIndex];

    if (!adFunction) {
      console.error("No ad function available");
      // Resume game if ad fails to load
      gameStateRef.current.gameRunning = true;
      gameStateRef.current.animationFrameId = requestAnimationFrame(gameLoop);
      return;
    }

    console.log(`Attempting to show ad ${currentAdIndex + 1} of ${adSDKFunctions.length}`);
    console.log(`Ad function to be called: ${adFunction}`);

    try {
      // Decrement ad watches immediately
      const newAdWatchesLeft = adWatchesLeft - 1;
      setAdWatchesLeft(newAdWatchesLeft);

      // Execute the ad function from the window object
      const adFunctionName = adFunction.replace('()', '');
      if (window[adFunctionName] && typeof window[adFunctionName] === 'function') {
        // Store current game state before showing ad
        const currentGameState = {
          score: currentScoreRef.current,
          lives: lifeLeft,
          stage: currentLevel,
          totalDistance: gameStateRef.current.totalDistance,
          adWatchesLeft: newAdWatchesLeft,
        };
        currentGameStateRef.current = currentGameState;

        console.log(`Calling ad function: ${adFunctionName}`);
        
        // Call the ad function
        window[adFunctionName]()
          .then(() => {
            console.log(`Ad ${currentAdIndex + 1} completed successfully`);
            
            // Clear all obstacleCars and potholes before restart
            gameStateRef.current.obstacleCars = [];
            potholesRef.current = [];

            // Close the game over dialog
            setGameOver(false);

            // Restart game loop from where it was paused
            startGameLoop();
          })
          .catch((error) => {
            console.error(`Error watching ad ${currentAdIndex + 1}:`, error);
            // If ad fails, restore the game state
            gameStateRef.current.gameRunning = true;
            gameStateRef.current.animationFrameId = requestAnimationFrame(gameLoop);
            // Restore the ad watch count
            setAdWatchesLeft(adWatchesLeft);
          });

      } else {
        console.error(`Ad function ${adFunctionName} not found or not a function`);
        // Resume game if function doesn't exist
        gameStateRef.current.gameRunning = true;
        gameStateRef.current.animationFrameId = requestAnimationFrame(gameLoop);
        // Restore the ad watch count
        setAdWatchesLeft(adWatchesLeft);
      }
    } catch (error) {
      console.error("Error in watchAdHandler:", error);
      // If ad fails, restore the game state
      gameStateRef.current.gameRunning = true;
      gameStateRef.current.animationFrameId = requestAnimationFrame(gameLoop);
      // Restore the ad watch count
      setAdWatchesLeft(adWatchesLeft);
    }
  };

  const exitGame = () => {
    const playedStatus = "WON";
    updateGameResult(playedStatus);
    setGameWon(false);
    setGameOver(false); // Explicitly set gameOver to false
    setGameStarted(false); // Show Start Game button
    // Optionally clear saved game data from localStorage
    currentGameStateRef.current = null; // Clear the ref
    localStorage.removeItem("currentGameHistoryId"); // Remove any saved game history ID
    // Reset other game states if needed
    setStage(0);
    setScore(0);
    currentScoreRef.current = 0; // Reset score ref
    setLifeLeft(3); // Reset lifeLeft to 3
    navigate("/gameinfo");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        p: 0,
        bgcolor: "#001f3f",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      {/* Initial Screen */}
      {showInitialScreen && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundImage: `url(${bg1})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Typography
            variant="h1"
            sx={{
              color: "#58E9F8",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Metal Mania",
              textAlign: "center",
              mb: 4,
              fontWeight: "400",
              fontSize: "70px",
              marginTop: "30px",
              width: "380px",
            }}
          >
            STRING RACING
          </Typography>
          <Button
            onClick={() => {
              setShowInitialScreen(false);
              handlePlayNow();
            }}
            variant="contained"
            size="large"
            sx={{
              bgcolor: "#0072B7",
              color: "#ffffff",
              border: "4px solid #29A4BF",
              width: "300px",
              height: "60px",
              fontFamily: "Inter",
              "&:hover": {
                bgcolor: "#0072B7",
              },
              px: 6,
              py: 2,
              fontSize: "48px",
              fontWeight: "bold",
              borderRadius: "12px",
              marginBottom: "80px",
            }}
          >
            START
          </Button>
        </Box>
      )}

      {/* Amount Dialog */}
      <Dialog open={open} onClose={handleClose}
      >
        <DialogTitle
          sx={{
            backgroundColor: "black",
            color: "white",
            fontFamily: "Inter",
            textAlign:"center"
          }}
        >
          Enter Amount to Play
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "black", padding: "20px" }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Typography variant="body2" color="white" fontWeight={600}>
              Your Balance: {ticketBalance}
            </Typography>
          </Box>
          <TextField
            autoFocus
            margin="dense"
            label={`Enter Amount (${minBet}-${maxBet})`}
            type="number"
            fullWidth
            variant="outlined"
            value={betAmount}
            onChange={handleAmountChange}
            error={!!error}
            InputProps={{
              style: { color: "white" },
            }}
            InputLabelProps={{
              style: { color: "#ccc" },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#ccc",
                },
                "&:hover fieldset": {
                  borderColor: "#fff",
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "black" }}>
          <Button
            onClick={handleClose}
            sx={{
              backgroundColor: "#041821",
              border: "3px solid #0C3648",
              borderRadius: "6px",
              padding: "10px 7px 10px 7px",
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: "12px",
              color: "#ffffff",
              gap: "10px",
              "&:hover": {
                backgroundColor: "#094159",
                border: "3px solid #41B3C8",
                borderRadius: "6px",
              },
              py: 1.5,
              margin: 0,
            }}
          >
            No
          </Button>
          <Button
            onClick={handlePlayGame}
            sx={{
              backgroundColor: "#041821",
              border: "3px solid #0C3648",
              borderRadius: "6px",
              padding: "10px 7px 10px 7px",
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: "12px",
              color: "#ffffff",
              gap: "10px",
              "&:hover": {
                backgroundColor: "#094159",
                border: "3px solid #41B3C8",
                borderRadius: "6px",
              },
              py: 1.5,
              margin: 0,
            }}
          >
            Play Game
          </Button>
        </DialogActions>
      </Dialog>

      {/* Score and lives display positioned at top right */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 1,
          textAlign: "right",
          color: "#29A4BF",
          textShadow: "0 0 4px rgba(0,0,0,0.8)",
        }}
      >
          <Typography variant="subtitle1" sx={{fontSize:"17px"}}>
          Lives: {renderHearts(Math.max(0, lifeLeft))}
        </Typography>
        <Typography variant="h6" component="div" sx={{fontSize:"17px"}}>
          Score: {score}
        </Typography>
        {/* <Typography variant="subtitle1">High Score: {highScore}</Typography> */}
        <Typography variant="subtitle1" sx={{fontSize:"17px"}}>Levels: {stage}</Typography>
      </Box>

      {/* Game canvas container */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: "400px",
            height: "auto",
            aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}`,
            maxHeight: "100%",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "contain",
            }}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          />
          {/* Explosion effect canvas */}
          <canvas
            ref={explosionCanvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 2,
              filter: "blur(1px) contrast(1.5)",
            }}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          />

          {/* water splash out canvas*/}
          <canvas
            ref={waterCanvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 2,
              filter: "blur(1px) contrast(1.5)",
            }}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          />

          {!gameStarted && (
            <Box
              sx={{
                position: "absolute",
                bottom: "10%",
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
              }}
            ></Box>
          )}
        </Box>
      </Box>

      {/* Game won dialog */}
      {gameWon && (
        <Dialog
          open={gameWon}
          onClose={() => setGameWon(false)}
          PaperProps={{
            sx: {
              bgcolor: "#001f3f",
              color: "#ffd700",
              borderRadius: "8px",
              border: "2px solid #4CAF50",
              maxWidth: "280px",
              margin: "0 auto"
            },
          }}
        >
          <DialogContent sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 1,
                textAlign: "center",
                bgcolor: "#001f3f",
                color: "#ffffff",
                fontFamily: "Inter",
              }}
            >
              <Typography
                variant="h6"
                component="div"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#4CAF50", fontSize: "18px", mb: 1 }}
              >
                You Won!
              </Typography>
              <Typography variant="body1" sx={{ fontSize: "14px", mb: 1 }}>
                Final Score: {currentScoreRef.current}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "12px", color: "#4CAF50" }}>
                All levels completed!
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: "center",
              p: 1,
            }}
          >
            <Button
              onClick={exitGame}
              variant="contained"
              size="small"
              sx={{
                bgcolor: "#4CAF50",
                color: "#fff",
                "&:hover": {
                  bgcolor: "#45a049",
                },
                fontWeight: "bold",
                py: 0.5,
                px: 3,
                fontSize: "14px",
                minWidth: "120px"
              }}
            >
              Exit
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Game over dialog */}
      {gameOver && !gameWon && (
        <Dialog
          open={gameOver}
          onClose={() => !gameOver && startGame()}
          PaperProps={{
            sx: {
              bgcolor: "#001f3f",
              color: "#ffffff",
              fontFamily: "Inter",
              borderRadius: "8px",
              border: "2px solid #41B3C8",
              maxWidth: "280px",
              margin: "0 auto"
            },
          }}
        >
          <DialogContent sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "#ffffff",
                py: 1,
                textAlign: "center",
              }}
            >
              <Typography
                variant="h6"
                component="div"
                gutterBottom
                sx={{ fontWeight: "bold", fontSize: "18px", mb: 1 }}
              >
                Game Over!
              </Typography>
              <Typography variant="body1" sx={{ fontSize: "14px", mb: 0.5 }}>
                Score: {currentScoreRef.current}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "12px", mb: 1 }}>
                {lifeLeft <= 0 ? "No lives left!" : "You crashed!"}
              </Typography>
              {adWatchesLeft > 0 && (
                <Typography variant="body2" sx={{ fontSize: "12px", color: "#41B3C8" }}>
                  Watch ad to continue ({adWatchesLeft})
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: "center",
              p: 1,
              gap: 1,
            }}
          >
            <Button
              onClick={playAgain}
              variant="contained"
              size="small"
              sx={{
                backgroundColor: "#041821",
                border: "2px solid #0C3648",
                borderRadius: "4px",
                py: 0.5,
                px: 2,
                fontSize: "13px",
                color: "#3A9FD0",
                "&:hover": {
                  backgroundColor: "#094159",
                  border: "2px solid #41B3C8",
                },
                minWidth: "100px"
              }}
            >
              Play Again
            </Button>
            {adWatchesLeft > 0 && (
              <Button
                onClick={watchAdHandler}
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: "#041821",
                  border: "2px solid #0C3648",
                  borderRadius: "4px",
                  py: 0.5,
                  px: 2,
                  fontSize: "13px",
                  color: "#3A9FD0",
                  "&:hover": {
                    backgroundColor: "#094159",
                    border: "2px solid #41B3C8",
                  },
                  minWidth: "100px"
                }}
              >
                Watch Ad
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
