import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Load user from localStorage when the app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Function to handle login and store user details
  const loginUser = (userData) => {
    setUser(userData);
    setToken(userData.token);

    localStorage.setItem("user", JSON.stringify(userData)); // Store user details
    localStorage.setItem("token", userData.token); // Store token
  };

  // Function to logout and clear storage
  const logoutUser = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
