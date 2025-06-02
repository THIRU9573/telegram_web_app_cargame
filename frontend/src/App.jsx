import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Header from './Components/Header/Header';
import Footer from './Components/Footer/Footer';
import Home from './Components/Home/Home';
import Task from './Components/Task/Task';
import Games from './Components/Games/Games';
import Profile from './Components/Profile/Profile';
import Cargame from './Components/Cargame/Cargame';
import Gameinfo from './Components/Gameinfo/Gameinfo';
import Refer from './Components/Refer/Refer';
import Referalhistory from './Components/Referalhistory/Referalhistory';
import Boosters from './Components/Boosters/Boosters';
import Withdrawhistory from './Components/Withdrawhistory/Withdrawhistory';
import tg from './Components/Telegramwebexpand/Telegramwebexpand';
import { MyProvider } from './context/Mycontext';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const location = useLocation();

  // Pages where header is hidden
  const hideHeaderOn = ['/games/car', '/gameinfo'];

  // Pages where footer is hidden
  const hideFooterOn = ['/games/car'];

  const showHeader = !hideHeaderOn.includes(location.pathname);
  const showFooter = !hideFooterOn.includes(location.pathname);

  //  localStorage.removeItem("upToken");
  console.log("upTokennn", localStorage.getItem("upToken"));


  // Handle Telegram WebApp events
  useEffect(() => {
    // Initialize WebApp
    tg.ready();

    // Handle back button
    tg.BackButton.onClick(() => {
      window.history.back();
    });

    // Show back button when not on main page
    if (location.pathname !== '/') {
      tg.BackButton.show();
    } else {
      tg.BackButton.hide();
    }

    return () => {
      tg.BackButton.offClick();
    };
  }, [location]);

  return (

    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Games />} />
        <Route path="/task" element={<Task />} />
        <Route path="/games/car" element={<Cargame />} />
        <Route path="/gameinfo" element={<Gameinfo />} />
        <Route path="/refer" element={<Refer />} />
        <Route path="/referralhistory" element={<Referalhistory />} />
        <Route path="/boosters" element={<Boosters />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/withdrawhistory" element={<Withdrawhistory />} />
      </Routes>
      {showFooter && <Footer />}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: "#041821",
            color: "white",
            marginTop: "80px",
            zIndex: 9999,
          },
        }}
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <UserProvider>
        <MyProvider>          {/* <-- wrap here */}
          <AppContent />
        </MyProvider>
      </UserProvider>
    </Router>
  );
}

export default App;