// const TelegramBot = require("node-telegram-bot-api");
// const mongoose = require("mongoose");

// const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// // Your React app URL (deployed or localhost tunnel for testing)
// const WEBAPP_URL = "https://http://localhost:5173/";

// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;

//   // Send message with Play button
//   bot.sendMessage(chatId, "Welcome! Click Play to start:", {
//     reply_markup: {
//       inline_keyboard: [
//         [
//           {
//             text: "Play",
//             web_app: { url: `${WEBAPP_URL}` }, // Opens your React app as Telegram WebApp
//           },
//         ],
//       ],
//     },
//   });
// });
 