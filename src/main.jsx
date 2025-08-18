import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./app/router.jsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient.js";
import { setAccessTokenGetter as setAuthAxiosTokenGetter } from "./lib/authAxios";
import { setAccessTokenGetter as setHttpTokenGetter } from "./lib/http";
import { AuthProvider, useAuth } from "./context/AuthProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function AuthTokenSync() {
  const { accessToken, setAccessToken } = useAuth();
  React.useEffect(() => {
    setAuthAxiosTokenGetter(() => accessToken);
    setHttpTokenGetter(() => accessToken);
    if (typeof window !== "undefined") window.setAccessToken = setAccessToken;
  }, [accessToken, setAccessToken]);
  return null;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AuthTokenSync />
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={true} />
        <AppRouter />
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
