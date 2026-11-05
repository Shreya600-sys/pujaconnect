import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for an existing session

  // Fetch the CURRENT, real-time user from the backend using the stored token.
  // This is what guarantees the name/role shown in the UI is always accurate,
  // even if it was updated elsewhere (profile edit, admin action, etc).
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("pc_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch (err) {
      localStorage.removeItem("pc_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // On first load (or full page refresh), restore session in real time.
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("pc_token", data.token);
    setUser(data.user); // <-- name/role available immediately, no reload needed
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("pc_token", data.token);
    setUser(data.user); // <-- name/role available immediately, no reload needed
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("pc_token");
    setUser(null);
  };

  const updateUserLocally = (partialUser) => {
    setUser((prev) => (prev ? { ...prev, ...partialUser } : prev));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, updateUserLocally, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
