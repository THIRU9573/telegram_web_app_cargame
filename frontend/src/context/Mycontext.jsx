import React, { createContext, useState } from "react";

export const MyContext = createContext();

export function MyProvider({ children }) {
  const [data, setData] = useState(null);  // Your state to save

  return (
    <MyContext.Provider value={{ data, setData }}>
      {children}
    </MyContext.Provider>
  );
}
