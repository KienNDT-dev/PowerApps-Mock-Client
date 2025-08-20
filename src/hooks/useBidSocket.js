import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./useSocket";

export function useBidSocket(token, bidPackageId) {
  const { socket, isConnected } = useSocket(token);
  const queryClient = useQueryClient();
  const [viewers, setViewers] = useState(0);
  const [roomJoined, setRoomJoined] = useState(false);

  const calculateRanks = (bids) => {
    return bids
      .sort((a, b) => a.amount - b.amount)
      .map((bid, index) => ({ ...bid, rank: index + 1 }));
  };

  useEffect(() => {
    if (!socket || !isConnected || !bidPackageId) {
      setRoomJoined(false);
      return;
    }

    socket.emit("join:bidPackage", { bidPackageId }, (response) => {
      if (response?.success) {
        setRoomJoined(true);
      } else {
        setRoomJoined(false);
      }
    });

    const handleNewBid = (bid) => {
      queryClient.setQueryData(["leaderboard", bidPackageId], (oldData) => {
        if (!oldData) return oldData;

        const existingBidIndex = oldData.bids.findIndex((b) => b.bidId === bid.bidId);
        let updatedBids;

        if (existingBidIndex >= 0) {
          updatedBids = [...oldData.bids];
          updatedBids[existingBidIndex] = { ...updatedBids[existingBidIndex], ...bid };
        } else {
          updatedBids = [...oldData.bids, bid];
        }

        const rankedBids = calculateRanks(updatedBids);
        return { ...oldData, bids: rankedBids };
      });

      queryClient.invalidateQueries({
        queryKey: ["leaderboard", bidPackageId],
        exact: true,
        refetchType: "active",
      });
    };

    const handleUpdatedBid = (bid) => {
      queryClient.setQueryData(["leaderboard", bidPackageId], (oldData) => {
        if (!oldData) return oldData;

        const updatedBids = oldData.bids.map((b) => (b.bidId === bid.bidId ? { ...b, ...bid } : b));
        const rankedBids = calculateRanks(updatedBids);
        return { ...oldData, bids: rankedBids };
      });

      queryClient.invalidateQueries({
        queryKey: ["leaderboard", bidPackageId],
        exact: true,
        refetchType: "active",
      });
    };

    const handleBidDeleted = ({ bidId }) => {
      queryClient.setQueryData(["leaderboard", bidPackageId], (oldData) => {
        if (!oldData) return oldData;

        const filteredBids = oldData.bids.filter((b) => b.bidId !== bidId);
        const rankedBids = calculateRanks(filteredBids);
        return { ...oldData, bids: rankedBids };
      });

      queryClient.invalidateQueries({
        queryKey: ["leaderboard", bidPackageId],
        exact: true,
        refetchType: "active",
      });
    };

    const handleViewerCount = ({ viewers: count }) => {
      setViewers(count);
    };

    socket.on("bid:new", handleNewBid);
    socket.on("bid:updated", handleUpdatedBid);
    socket.on("bid:deleted", handleBidDeleted);
    socket.on("viewer:count", handleViewerCount);

    return () => {
      if (socket && bidPackageId) {
        socket.emit("leave:bidPackage", { bidPackageId });
        socket.off("bid:new", handleNewBid);
        socket.off("bid:updated", handleUpdatedBid);
        socket.off("bid:deleted", handleBidDeleted);
        socket.off("viewer:count", handleViewerCount);
      }

      setRoomJoined(false);
      setViewers(0);
    };
  }, [socket, isConnected, bidPackageId, queryClient]);

  const createBid = (bidPrice, bidName, callback) => {
    if (!socket || !isConnected || !roomJoined) {
      callback?.({
        success: false,
        message: roomJoined ? "Socket not connected" : "Room not joined",
      });
      return;
    }

    socket.emit("bid:create", { bidPackageId, bidPrice, bidName }, callback);
  };

  const updateBid = (bidId, updateFields, callback) => {
    if (!socket || !isConnected || !roomJoined) {
      callback?.({
        success: false,
        message: roomJoined ? "Socket not connected" : "Room not joined",
      });
      return;
    }

    socket.emit("bid:update", { bidId, bidPackageId, updateFields }, callback);
  };

  return {
    viewers,
    isConnected: isConnected && roomJoined,
    createBid,
    updateBid,
  };
}
