import React from 'react';
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

function AppContent() {
  const location = useLocation();
  
  // Pages where header is hidden
  const hideHeaderOn = ['/games/car', '/gameinfo'];

  // Pages where footer is hidden
  const hideFooterOn = ['/games/car'];

  const showHeader = !hideHeaderOn.includes(location.pathname);
  const showFooter = !hideFooterOn.includes(location.pathname);

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
      </Routes>
      {showFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </Router>
  );
}

export default App;