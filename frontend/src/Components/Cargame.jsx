// "use client";

import { useEffect, useRef, useState } from "react";
import {Box,Paper,Button,Dialog,Typography,DialogContent,DialogActions,} from "@mui/material";
import player from "../assets/player.png";
import enemycar1 from "../assets/enemycar1.png";
import enemycar2 from "../assets/enemycar2.png";
import enemycar3 from "../assets/enemycar3.png";
import enemycar4 from "../assets/enemycar4.png";
import enemycar5 from "../assets/enemycar5.png";
import road from "../assets/road.png";
import cardrive from "../assets/cardrive.mp3";
import crash from "../assets/crash.mp3";
import coin from "../assets/coin.mp3";
import pothole from "../assets/pothole.png";
import { VolumeUp, VolumeOff } from "@mui/icons-material";

// Game constants
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 800;
const LANE_COUNT = 4;
const ROAD_X_START = 40; // Left road boundary
const ROAD_X_END = CANVAS_WIDTH - 40; // Right road boundary
const LANE_WIDTH = (ROAD_X_END - ROAD_X_START) / LANE_COUNT; // Lane width within road boundaries
const PLAYER_CAR_HEIGHT = 80;
const PLAYER_CAR_WIDTH = 60;
const OBSTACLE_CAR_HEIGHT = 80;
const OBSTACLE_CAR_WIDTH = 50;
const ROAD_SPEED = 5;
const ENEMY_SPEED = 2; // Speed for obstacle cars moving down
const OBSTACLE_SPAWN_RATE = 0.003;
const COIN_RADIUS = 15;
const COIN_SPAWN_RATE = 0.01;
const COIN_VALUE = 10;
const POTHOLE_WIDTH = 60;
const POTHOLE_HEIGHT = 20;
const POTHOLE_RATE = 10;
const COIN_SERIES_COUNT = 10;
const COIN_SERIES_SPACING = 50;
const COIN_SERIES_DISTANCE = 30;
const LAST_POTHOLE_DISTANCE = 150; // Tracks the distance when last pothole was spawned
const LEVEL_DISTANCE = 200; // Distance needed to level up (adjust as needed)

// Add frame rate control
const FPS = 60;
const FRAME_TIME = 1000 / FPS;

// Add these constants at the top with other game constants
const FIXED_TIME_STEP = 1000 / 60; // 60 FPS
const MAX_FRAME_TIME = 1000 / 30; // Don't allow slower than 30 FPS

export default function CarGame() {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  // const [betAmount, setBetAmount] = useState(200);
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
  const explosionParticlesRef = useRef([]);
  const explosionCanvasRef = useRef(null);

  const coinSeriesRef = useRef({
    active: false,
    count: 0,
    lane: 0,
    currentY: 0,
    lastSeriesY: -COIN_SERIES_DISTANCE, // Tracks the distance when last series was spawned
    lastPotholeDistance: -LAST_POTHOLE_DISTANCE, // Tracks the distance when last pothole was spawned
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

  // Add volume control state and local storage for high scores
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('gameVolume');
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  });

  // Add touch control state
  const [touchActive, setTouchActive] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const touchThreshold = 20; // minimum distance for swipe detection

  // Add mute state
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = localStorage.getItem('gameMute');
    return savedMute ? JSON.parse(savedMute) : false;
  });

  // Initialize audio when component mounts
  useEffect(() => {
    // Initialize audio elements directly with their sources
    audioRef.current = new Audio(cardrive);
    audioRef.current.loop = true;
    audioRef.current.preload = "auto";

    crashAudioRef.current = new Audio(crash);
    crashAudioRef.current.preload = "auto";

    coinAudioRef.current = new Audio(coin);
    coinAudioRef.current.preload = "auto";

    return () => {
      // Clean up audio when component unmounts
      [audioRef.current, crashAudioRef.current, coinAudioRef.current].forEach(
        (audio) => {
          if (audio) {
            audio.pause();
            audio.src = "";
          }
        }
      );
    };
  }, []);

  // Initialize canvas and game state when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Load images for player car,
    const playerImage = new Image();
    playerImage.src = player;
    gameStateRef.current.playerCar.image = playerImage;

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
    gameStateRef.current.roadImage = roadImage;

    //Load pothole image
    const potholeImage = new Image();
    potholeImage.src = pothole;
    gameStateRef.current.potholeImage = potholeImage;

    drawGame(ctx);

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

    canvas.addEventListener("mousedown", handleDragStart);
    canvas.addEventListener("mousemove", handleDragMove);
    canvas.addEventListener("mouseup", handleDragEnd);

    canvas.addEventListener("touchstart", handleDragStart);
    canvas.addEventListener("touchmove", handleDragMove);
    canvas.addEventListener("touchend", handleDragEnd);

    return () => {
      canvas.removeEventListener("mousedown", handleDragStart);
      canvas.removeEventListener("mousemove", handleDragMove);
      canvas.removeEventListener("mouseup", handleDragEnd);

      canvas.removeEventListener("touchstart", handleDragStart);
      canvas.removeEventListener("touchmove", handleDragMove);
      canvas.removeEventListener("touchend", handleDragEnd);
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

  const startGameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    gameStateRef.current.gameRunning = true;
    gameStateRef.current.lastTimestamp = performance.now();
    let accumulator = 0;

    const gameLoop = (timestamp) => {
      if (!gameStateRef.current.gameRunning) return;

      let frameTime = timestamp - gameStateRef.current.lastTimestamp;
      if (frameTime > MAX_FRAME_TIME) frameTime = MAX_FRAME_TIME;
      
      accumulator += frameTime;
      gameStateRef.current.lastTimestamp = timestamp;

      // Update game state in fixed time steps
      while (accumulator >= FIXED_TIME_STEP) {
        updateGame(FIXED_TIME_STEP);
        accumulator -= FIXED_TIME_STEP;
      }

      // Render at screen refresh rate
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
        setScore((prev) => prev + COIN_VALUE);
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
    // Update road position
    gameStateRef.current.roadOffset = (gameStateRef.current.roadOffset + ROAD_SPEED) % CANVAS_HEIGHT;
    gameStateRef.current.totalDistance += ROAD_SPEED;
    
    // Update obstacle cars with their original speed from backend
    gameStateRef.current.obstacleCars.forEach((car) => {
      car.y += car.speed; // Use the speed assigned when car was created
    });

    // Filter out cars that are off screen
    gameStateRef.current.obstacleCars = gameStateRef.current.obstacleCars.filter(
      (car) => car.y < CANVAS_HEIGHT
    );

    // Spawn new obstacles at original rate
    if (Math.random() < OBSTACLE_SPAWN_RATE) {
      spawnObstacleCar();
    }

    // Update coins with smoother movement
    gameStateRef.current.coins.forEach((coin) => {
      coin.y += ROAD_SPEED;
      // Add slight horizontal oscillation for more interesting movement
      coin.x += Math.sin(coin.y / 30) * 0.5;
    });

    // Filter out collected or off-screen coins
    gameStateRef.current.coins = gameStateRef.current.coins.filter(
      (coin) => !coin.collected && coin.y < CANVAS_HEIGHT
    );

    // Spawn new coins with better distribution
    if (!coinSeriesRef.current.active && 
        Math.random() < COIN_SPAWN_RATE && 
        gameStateRef.current.coins.length < 15) {
      startCoinSeries();
    }

    // Update coin series if active
    if (coinSeriesRef.current.active) {
      updateCoinSeries();
    }

    // Update potholes
    updatePotholes();
    if (Math.random() < POTHOLE_RATE / 1000) {
      spawnPothole();
    }

    // Check collisions
    checkCollisions();

    // Level up check
    const newLevel = Math.floor(gameStateRef.current.totalDistance / LEVEL_DISTANCE);
    if (newLevel > level) {
      setLevel(newLevel);
      showLevelUpAnimation();
    }
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
  };

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
    const validImages = enemyImages.filter(
      (img) => img && img.complete && img.naturalHeight !== 0
    );

    const randomImage =
      validImages.length > 0
        ? validImages[Math.floor(Math.random() * validImages.length)]
        : null;

    // Get current player lane
    const playerLane = Math.floor(
      (gameStateRef.current.playerCar.x - ROAD_X_START) / LANE_WIDTH
    );

    // Get all existing obstacle cars near the top of the screen
    const topObstacles = gameStateRef.current.obstacleCars.filter(
      (car) => car.y < CANVAS_HEIGHT * 0.3
    );

    // Get all occupied lanes
    const occupiedLanes = topObstacles.map(car => car.lane);

    // Get all possible lanes
    const allLanes = Array.from({ length: LANE_COUNT }, (_, i) => i);

    // Remove player's current lane and adjacent lanes from possible spawn points
    const safeLanes = allLanes.filter(lane => {
      // Don't spawn in player's lane or adjacent lanes
      if (Math.abs(lane - playerLane) <= 1) return false;
      // Don't spawn if there's already a car in this lane near the top
      if (occupiedLanes.includes(lane)) return false;
      return true;
    });

    // If there are no safe lanes, don't spawn
    if (safeLanes.length === 0) return;

    // Pick a random safe lane
    const selectedLane = safeLanes[Math.floor(Math.random() * safeLanes.length)];

    // Calculate x position centered in the selected lane
    const x = ROAD_X_START + selectedLane * LANE_WIDTH + (LANE_WIDTH - OBSTACLE_CAR_WIDTH) / 2;

    // Create the obstacle car
    const obstacleCar = {
      x,
      y: -OBSTACLE_CAR_HEIGHT,
      width: OBSTACLE_CAR_WIDTH,
      height: OBSTACLE_CAR_HEIGHT,
      lane: selectedLane,
      color: "#e74c3c",
      speed: ENEMY_SPEED, // This will be controlled by backend
      image: randomImage,
    };

    // Check if this spawn would create a "wall" of obstacles
    const wouldCreateWall = checkForObstacleWall(obstacleCar);
    
    if (!wouldCreateWall) {
      gameStateRef.current.obstacleCars.push(obstacleCar);
    }
  };

  // Add helper function to check for obstacle walls
  const checkForObstacleWall = (newCar) => {
    // Get all obstacles near the new car's y position
    const nearbyObstacles = gameStateRef.current.obstacleCars.filter(
      car => Math.abs(car.y - newCar.y) < OBSTACLE_CAR_HEIGHT * 1.5
    );

    // Add the new car to the list
    const allObstacles = [...nearbyObstacles, newCar];

    // Sort obstacles by lane
    const occupiedLanes = allObstacles.map(car => car.lane).sort();

    // Check if there's at least one gap between obstacles
    let hasGap = false;
    for (let lane = 0; lane < LANE_COUNT - 1; lane++) {
      // If there are two consecutive unoccupied lanes, we have a gap
      if (!occupiedLanes.includes(lane) && !occupiedLanes.includes(lane + 1)) {
        hasGap = true;
        break;
      }
    }

    // Return true if this would create a wall (no gaps)
    return !hasGap;
  };

  // Spawn potholes(Generate random potholes in random lanes)
  const spawnPothole = () => {
    // Calculate the adjusted minimum distance threshold based on POTHOLE_RATE
    const adjustedDistanceThreshold = 100 / POTHOLE_RATE; // Reduce threshold as the rate increases

    // Only spawn potholes if the last one is far enough away
    if (
      gameStateRef.current.totalDistance -
        (coinSeriesRef.current.lastPotholeDistance || 0) >
      adjustedDistanceThreshold
    ) {
      // Adjusted rate controls the probability of spawning potholes
      if (Math.random() < POTHOLE_RATE) {
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
      pothole.y += ROAD_SPEED;

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
          crashAudioRef.current.play().catch((e) => console.log("Crash sound error:", e));
        }
        // Trigger explosion effect
        setExplosionPosition({
          x: (playerCar.x + obstacleCar.x) / 2,
          y: (playerCar.y + obstacleCar.y) / 2,
        });
        setExplosionActive(true);
  
        gameStateRef.current.Lives = 0;
        setLifeLeft(0);
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
          potholesRef.current.splice(i, 1);
  
          // Reduce lives
          const newLives = gameStateRef.current.Lives - 1;
          gameStateRef.current.Lives = newLives;
          setLifeLeft(newLives);
  
          // If lives reached 0, end game
          if (newLives <= 0) {
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
    coinSeriesRef.current.lastSeriesY = -COIN_SERIES_DISTANCE;
    coinSeriesRef.current.lastPotholeDistance = -LAST_POTHOLE_DISTANCE; // Reset last pothole distance
    gameStateRef.current.Lives = 3; // Reset lives

     // Reset level
     setLevel(0); 
     setGameWon(false);
    setScore(0);
    setLifeLeft(3); // Reset lifeLeft to 3
    setGameOver(false);
    setGameStarted(true);

    // Reset audio states
    if (crashAudioRef.current) {
      crashAudioRef.current.pause();
    }
    if (coinAudioRef.current) {
      coinAudioRef.current.pause();
    }
    setExplosionActive(false);
    startGameLoop();
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

  // Add level up animation
  const showLevelUpAnimation = () => {
    setExplosionActive(true);
    setExplosionPosition({
      x: gameStateRef.current.playerCar.x + PLAYER_CAR_WIDTH / 2,
      y: gameStateRef.current.playerCar.y
    });
    setTimeout(() => setExplosionActive(false), 1000);
  };

  // Improve coin series generation
  const startCoinSeries = () => {
    coinSeriesRef.current = {
      active: true,
      count: 0,
      lane: Math.floor(Math.random() * LANE_COUNT),
      currentY: -COIN_RADIUS,
      pattern: Math.random() < 0.5 ? 'straight' : 'zigzag'
    };
  };

  const updateCoinSeries = () => {
    if (coinSeriesRef.current.count >= COIN_SERIES_COUNT) {
      coinSeriesRef.current.active = false;
      return;
    }

    if (coinSeriesRef.current.currentY <= -COIN_RADIUS) {
      const laneX = ROAD_X_START + (coinSeriesRef.current.lane + 0.5) * LANE_WIDTH;
      let coinX = laneX;
      
      if (coinSeriesRef.current.pattern === 'zigzag') {
        coinX += Math.sin(coinSeriesRef.current.count * Math.PI / 2) * (LANE_WIDTH * 0.3);
      }

      gameStateRef.current.coins.push({
        x: coinX - COIN_RADIUS,
        y: coinSeriesRef.current.currentY,
        collected: false
      });

      coinSeriesRef.current.count++;
      coinSeriesRef.current.currentY -= COIN_SERIES_SPACING;
    }
  };

  useEffect(() => {
    // Load high score from local storage
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }

    // Apply volume settings to audio elements
    const setAudioVolume = (audio) => {
      if (audio) {
        audio.volume = volume;
      }
    };

    setAudioVolume(audioRef.current);
    setAudioVolume(crashAudioRef.current);
    setAudioVolume(coinAudioRef.current);

    // Save volume setting
    localStorage.setItem('gameVolume', volume.toString());
  }, [volume]);

  // Update high score saving
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('highScore', score.toString());
    }
  }, [score, highScore]);

  // Add volume control UI to the game
  const VolumeControl = () => (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: '#ffd700',
      }}
    >
      <Typography variant="body2">Volume</Typography>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        style={{
          width: '100px',
          accentColor: '#ffd700',
        }}
      />
    </Box>
  );

  // Add these functions for touch controls
  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    setTouchActive(true);
  };

  const handleTouchMove = (event) => {
    if (!touchActive) return;
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    // Only handle horizontal movement if it's greater than vertical movement
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > touchThreshold) {
      const newX = Math.max(
        ROAD_X_START,
        Math.min(
          gameStateRef.current.playerCar.x + deltaX,
          ROAD_X_END - PLAYER_CAR_WIDTH
        )
      );
      gameStateRef.current.playerCar.x = newX;
      setTouchStartX(touch.clientX);
    }
  };

  const handleTouchEnd = () => {
    setTouchActive(false);
  };

  // Add mobile-friendly UI components
  const MobileControls = () => (
    <Box
      sx={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: { xs: 'flex', md: 'none' },
        gap: 4,
        zIndex: 2,
      }}
    >
      <Button
        variant="contained"
        sx={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 215, 0, 0.3)',
          backdropFilter: 'blur(5px)',
          '&:hover': {
            backgroundColor: 'rgba(255, 215, 0, 0.5)',
          },
        }}
        onTouchStart={() => {
          const interval = setInterval(() => {
            gameStateRef.current.playerCar.x = Math.max(
              ROAD_X_START,
              gameStateRef.current.playerCar.x - 5
            );
          }, 16);
          return () => clearInterval(interval);
        }}
      >
        ←
      </Button>
      <Button
        variant="contained"
        sx={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 215, 0, 0.3)',
          backdropFilter: 'blur(5px)',
          '&:hover': {
            backgroundColor: 'rgba(255, 215, 0, 0.5)',
          },
        }}
        onTouchStart={() => {
          const interval = setInterval(() => {
            gameStateRef.current.playerCar.x = Math.min(
              ROAD_X_END - PLAYER_CAR_WIDTH,
              gameStateRef.current.playerCar.x + 5
            );
          }, 16);
          return () => clearInterval(interval);
        }}
      >
        →
      </Button>
    </Box>
  );

  // Update the canvas event listeners in useEffect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Add touch event listeners
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Add effect to handle mute state
  useEffect(() => {
    const setAudioMute = (audio) => {
      if (audio) {
        audio.muted = isMuted;
      }
    };

    setAudioMute(audioRef.current);
    setAudioMute(crashAudioRef.current);
    setAudioMute(coinAudioRef.current);

    // Save mute preference
    localStorage.setItem('gameMute', JSON.stringify(isMuted));
  }, [isMuted]);

  // Update MuteButton component with adjusted positioning
  const MuteButton = () => (
    <Button
      onClick={() => setIsMuted(!isMuted)}
      sx={{
        position: 'absolute',
        top: 40,
        left: 40,
        minWidth: 'auto',
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(5px)',
        color: '#ffd700',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        zIndex: 2,
        '@media (max-width: 600px)': {
          top: 20,
          left: 20,
        },
      }}
    >
      {isMuted ? <VolumeOff /> : <VolumeUp />}
    </Button>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        p: 0,
        bgcolor: "#001f3f", // Navy dark background
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <MuteButton />
      <VolumeControl />
      {/* Score and lives display positioned at top right */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 1,
          textAlign: "right",
          color: "#ffd700", // Yellow text color
          textShadow: "0 0 4px rgba(0,0,0,0.8)",
        }}
      >
        <Typography variant="h6" component="div">
          Score: {score}
        </Typography>
        <Typography variant="subtitle1">High Score: {highScore}</Typography>
        <Typography variant="subtitle1">
          Lives Left: {Math.max(0, lifeLeft)}
        </Typography>
        <Typography variant="subtitle1">Levels: {level}</Typography>
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
            >
              <Button
                onClick={startGame}
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "#ffd700", // Yellow button
                  color: "#001f3f", // Navy text
                  "&:hover": {
                    bgcolor: "#ffc600", // Lighter yellow on hover
                  },
                  px: 4,
                  py: 1.5,
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                }}
              >
                Start Game
              </Button>
            </Box>
          )}
        </Box>
      </Box>

    {/* Game won dialog */}
      {gameWon && (
        <Dialog
          open={gameWon}
          onClose={() => setGameWon(false)}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              bgcolor: "#001f3f",
              color: "#ffd700",
              borderRadius: "8px",
              border: "2px solid #4CAF50",
              maxWidth: "300px",
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
                borderRadius: "8px",
              }}
            >
              <Typography
                variant="h6"
                component="div"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#4CAF50", fontSize: "18px" }}
              >
                You Won!
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ fontSize: "14px" }}>
                Congratulations!
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ fontSize: "14px" }}>
                Final Score: {currentScoreRef.current}
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ mt: 1, fontSize: "12px" }}>
                You've successfully reached All levels!
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: "center",
              pb: 2,
              px: 2,
            }}
          >
            <Button
              onClick={exitGame}
              variant="contained"
              size="small"
              fullWidth
              sx={{
                bgcolor: "#4CAF50",
                color: "#fff",
                "&:hover": {
                  bgcolor: "#45a049",
                },
                fontWeight: "bold",
                py: 1,
                fontSize: "14px",
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
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              bgcolor: "#001f3f",
              color: "#ffffff",
              fontFamily: "Inter",
              borderRadius: "8px",
              border: "2px solid #41B3C8",
              maxWidth: "300px",
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
                fontFamily: "Inter",
                color: "#ffffff",
                py: 1,
                textAlign: "center",
              }}
            >
              <Typography
                variant="h6"
                component="div"
                gutterBottom
                sx={{ fontWeight: "bold", fontSize: "18px" }}
              >
                You Lost the Game!
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ fontSize: "14px" }}>
                Final Score: {currentScoreRef.current}
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ fontSize: "14px" }}>
                High Score: {highScore}
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ fontSize: "12px" }}>
                {lifeLeft <= 0
                  ? "You've run out of lives!"
                  : "You crashed into an obstacle!"}
              </Typography>
              {adWatchesLeft > 0 ? (
                <Typography variant="body2" sx={{ fontSize: "12px", mt: 1 }}>
                  Watch an ad to continue ({adWatchesLeft} left)
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ fontSize: "12px", mt: 1, color: "#ff5555" }}>
                  No more ad watches left for this session
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: "center",
              pb: 2,
              px: 2,
              gap: 1,
            }}
          >
            <Button
              onClick={playAgain}
              variant="contained"
              size="small"
              fullWidth
              sx={{
                backgroundColor: "#041821",
                border: "2px solid #0C3648",
                borderRadius: "4px",
                padding: "6px 4px",
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: "14px",
                color: "#3A9FD0",
                gap: "8px",
                "&:hover": {
                  backgroundColor: "#094159",
                  border: "2px solid #41B3C8",
                  borderRadius: "4px",
                },
                py: 1,
                margin: 0,
              }}
            >
              Play Again
            </Button>
            {adWatchesLeft > 0 && (
              <Button
                onClick={watchAdHandler}
                variant="contained"
                size="small"
                fullWidth
                sx={{
                  backgroundColor: "#041821",
                  border: "2px solid #0C3648",
                  borderRadius: "4px",
                  padding: "6px 4px",
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#3A9FD0",
                  gap: "8px",
                  "&:hover": {
                    backgroundColor: "#094159",
                    border: "2px solid #41B3C8",
                    borderRadius: "4px",
                  },
                  py: 1,
                  margin: 0,
                }}
              >
                Watch Ads
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
      <MobileControls />
    </Box>
  );
}
