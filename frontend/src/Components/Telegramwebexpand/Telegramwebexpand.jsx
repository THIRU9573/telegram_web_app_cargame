// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;

// Configure WebApp
tg.expand(); // Expand to full screen
tg.enableClosingConfirmation(); // Enable closing confirmation
tg.MainButton.setText('Play'); // Set main button text

// Set theme colors
// tg.setHeaderColor('#4B1E85'); // Set header color
// tg.setBackgroundColor('#121212'); // Set background color

export default tg;