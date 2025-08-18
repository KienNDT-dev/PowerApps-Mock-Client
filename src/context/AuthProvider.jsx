import authAxios from "@/lib/authAxios";
import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken"));
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = !!accessToken;

  // Login: POST to /contractor-auth/login, store access token
  const login = async (email, password) => {
    const res = await authAxios.post(
      "/contractor-auth/login",
      { email, password },
      { withCredentials: true }
    );
    const token = res.data?.accessToken || res.data?.access_token || res.data?.token;

    if (token) {
      setAccessToken(token);
      localStorage.setItem("accessToken", token);
      console.log("✅ Access token stored in memory");
    } else {
      localStorage.removeItem("accessToken");
      console.error("❌ No access token found in login response:", res.data);
    }

    return res.data;
  };

  // Logout: POST to /auth/logout, clear access token
  const logout = async () => {
    setIsLoading(true);
    try {
      await authAxios.post("/auth/logout", {}, { withCredentials: true });
    } catch (error) {
    } finally {
      setAccessToken(null);
      localStorage.removeItem("accessToken");
      setIsLoading(false);
    }
  };

  // Refresh: POST to /auth/refresh, update access token
  const refresh = useCallback(async () => {
    const res = await authAxios.post("/auth/refresh", {}, { withCredentials: true });
    setAccessToken(res.data.accessToken);
    return res.data.accessToken;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        login,
        logout,
        refresh,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
