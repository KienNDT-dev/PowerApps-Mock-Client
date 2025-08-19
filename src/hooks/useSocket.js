import { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API || "http://localhost:5000";
let socketInstance = null;

export function useSocket(token) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log("useSocket effect running with token:", !!token);

    if (!token || token.trim() === "") {
      console.log("No token provided, cleaning up socket");
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    if (!socketInstance) {
      console.log("Creating NEW socket connection to:", SOCKET_URL);

      socketInstance = io(SOCKET_URL, {
        auth: {
          token: token,
        },
        transports: ["websocket"],
        timeout: 10000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: 3,
      });

      socketInstance.on("connect", () => {
        console.log("✅ Socket connected successfully:", socketInstance.id);
        setIsConnected(true);
      });

      socketInstance.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
        setIsConnected(false);
      });

      socketInstance.on("connect_error", (error) => {
        console.error("🚨 Socket connection error:", error);
        setIsConnected(false);

        if (error.message.includes("token")) {
          console.log("Token error detected, resetting socket");
          socketInstance.disconnect();
          socketInstance = null;
          socketRef.current = null;
        }
      });
    }

    socketRef.current = socketInstance;

    return () => {
      console.log("useSocket cleanup function called");
    };
  }, [token]);

  useEffect(() => {
    return () => {
      console.log("useSocket unmounting, cleaning up");
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
  };
}
