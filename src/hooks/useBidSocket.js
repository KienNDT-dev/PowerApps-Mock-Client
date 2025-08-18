import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io } from "socket.io-client";

let socket;
export function useBidSocket(token, bidPackageId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token || !bidPackageId) return;

    if (!socket) {
      socket = io(import.meta.env.VITE_API, {
        auth: { token },
        transports: ["websocket"],
      });
    } else {
      socket.auth = { token };
      if (!socket.connected) socket.connect();
    }

    socket.emit("join:bidPackage", { bidPackageId });

    socket.on("bid:new", (payload) => {
      queryClient.setQueryData(["bids", bidPackageId], (old = []) => [...old, payload]);
    });

    socket.on("bid:updated", (payload) => {
      queryClient.setQueryData(["bids", bidPackageId], (old = []) =>
        old.map((bid) => (bid.bidId === payload.bidId ? { ...bid, ...payload.fieldsChanged } : bid))
      );
    });

    return () => {
      socket.emit("leave:bidPackage", { bidPackageId });
      socket.off("bid:new");
      socket.off("bid:updated");
    };
  }, [token, bidPackageId, queryClient]);

  return socket;
}
