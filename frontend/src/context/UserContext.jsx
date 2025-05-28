import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { UserProfile } from '../ApiConfig';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userBalance, setUserBalance] = useState(0);

  const updateUserBalance = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("authToken");
      
      if (!userId || !token) {
        console.log("No user credentials found");
        return;
      }

      const response = await axios.get(`${UserProfile}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.user?.ticketBalance !== undefined) {
        setUserBalance(response.data.user.ticketBalance);
      }
    } catch (error) {
      console.error("Error updating user balance:", error);
    }
  }, []);

  return (
    <UserContext.Provider value={{ userBalance, updateUserBalance }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 