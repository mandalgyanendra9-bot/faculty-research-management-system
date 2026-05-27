import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.data);
    } catch (_error) {
      localStorage.removeItem("frms_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("frms_token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe();
  }, []);

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("frms_token", data.data.token);
    setUser(data.data.user);
    toast.success("Welcome back");
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("frms_token", data.data.token);
    setUser(data.data.user);
    toast.success("Account created");
  };

  const logout = () => {
    localStorage.removeItem("frms_token");
    setUser(null);
    toast.success("Logged out");
  };

  const value = useMemo(
    () => ({ user, setUser, loading, login, register, logout, refreshUser: fetchMe }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
