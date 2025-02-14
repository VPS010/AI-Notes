import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "./api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on component mount
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await api.get("/api/auth/me");
      console.log("res.data", res.data);
      setUser({
        _id: res.data._id,
        username: res.data.username,
        email: res.data.email,
      });
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Register a new user
  const signup = async (data) => {
    try {
      const res = await api.post("/api/auth/signup", data);
      localStorage.setItem("token", res.data.token);
      setUser({
        _id: res.data._id,
        username: res.data.username,
        email: res.data.email,
      });
      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  // Authenticate an existing user
  const login = async (data) => {
    try {
      const res = await api.post("/api/auth/login", data);
      localStorage.setItem("token", res.data.token);
      setUser({
        _id: res.data._id,
        username: res.data.username,
        email: res.data.email,
      });
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  // Logout: Clear user data and token
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
