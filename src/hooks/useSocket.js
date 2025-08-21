import { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API || "http://localhost:5000";
let socketInstance = null;

export function useSocket(token) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token || token.trim() === "") {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    if (!socketInstance) {
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
        setIsConnected(true);
      });

      socketInstance.on("disconnect", (reason) => {
        setIsConnected(false);
      });

      socketInstance.on("connect_error", (error) => {
        console.error("🚨 Socket connection error:", error);
        setIsConnected(false);

        if (error.message.includes("token")) {
          socketInstance.disconnect();
          socketInstance = null;
          socketRef.current = null;
        }
      });
    }

    socketRef.current = socketInstance;

    return () => {
    };
  }, [token]);

  useEffect(() => {
    return () => {
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
