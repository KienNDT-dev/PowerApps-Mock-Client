import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API || "http://localhost:5000";
let socket;

export function useSocket(token) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    if (!socket) {
      socket = io(SOCKET_URL, {
        extraHeaders: {
          access_token: token,
        },
      });
    } else {
      socket.auth = { token };
      socket.connect();
    }

    socketRef.current = socket;

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("disconnect", (reason) => console.log("Socket disconnected:", reason));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
      socket = null;
      socketRef.current = null;
    };
  }, [token]);

  return socketRef;
}
