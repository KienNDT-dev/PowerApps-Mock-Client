import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./useSocket";
import { useGetLeaderboard } from "./useGetLeaderboard";

export function useLeaderboardSocket(token, bidPackageId) {
  const { socket, isConnected } = useSocket(token);
  const queryClient = useQueryClient();
  const [roomJoined, setRoomJoined] = useState(false);
  const [viewers, setViewers] = useState(0);

  // Fetch initial leaderboard data
  const { data: leaderboardData, isLoading, error, refetch } = useGetLeaderboard(bidPackageId);

  useEffect(() => {
    if (!socket || !isConnected || !bidPackageId) {
      setRoomJoined(false);
      return;
    }

    // Join the bid package room
    socket.emit("join:bidPackage", { bidPackageId }, (response) => {
      if (response?.success) {
        setRoomJoined(true);
      } else {
        console.error("❌ Failed to join room:", response?.message);
        setRoomJoined(false);
      }
    });

    // Handle new bid events
    const handleNewBid = (bid) => {
      queryClient.setQueryData(["leaderboard", bidPackageId], (oldData) => {
        if (!oldData) return oldData;

        // Check if bid already exists
        const existingBidIndex = oldData.bids.findIndex((b) => b.bidId === bid.bidId);

        let updatedBids;
        if (existingBidIndex >= 0) {
          // Update existing bid
          updatedBids = [...oldData.bids];
          updatedBids[existingBidIndex] = { ...updatedBids[existingBidIndex], ...bid };
        } else {
          // Add new bid
          updatedBids = [...oldData.bids, bid];
        }

        // Sort by amount and recalculate ranks
        const sortedBids = updatedBids
          .sort((a, b) => a.amount - b.amount)
          .map((bid, index) => ({ ...bid, rank: index + 1 }));

        return {
          ...oldData,
          bids: sortedBids,
        };
      });
    };

    // Handle bid updates
    const handleUpdatedBid = (bid) => {
      queryClient.setQueryData(["leaderboard", bidPackageId], (oldData) => {
        if (!oldData) return oldData;

        const updatedBids = oldData.bids
          .map((b) => (b.bidId === bid.bidId ? { ...b, ...bid } : b))
          .sort((a, b) => a.amount - b.amount)
          .map((bid, index) => ({ ...bid, rank: index + 1 }));

        return {
          ...oldData,
          bids: updatedBids,
        };
      });
    };

    // Handle viewer count updates
    const handleViewerCount = ({ viewers: count }) => {
      setViewers(count);
    };

    // Handle bid deletions (if needed)
    const handleBidDeleted = ({ bidId }) => {
      queryClient.setQueryData(["leaderboard", bidPackageId], (oldData) => {
        if (!oldData) return oldData;

        const updatedBids = oldData.bids
          .filter((b) => b.bidId !== bidId)
          .sort((a, b) => a.amount - b.amount)
          .map((bid, index) => ({ ...bid, rank: index + 1 }));

        return {
          ...oldData,
          bids: updatedBids,
        };
      });
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

    socket.emit("bid:create", { bidPackageId, bidPrice, bidName }, (response) => {
      if (response?.success) {
      } else {
        console.error("❌ Failed to create bid:", response?.message);
      }
      callback?.(response);
    });
  };

  const updateBid = (bidId, updateFields, callback) => {
    if (!socket || !isConnected || !roomJoined) {
      callback?.({
        success: false,
        message: roomJoined ? "Socket not connected" : "Room not joined",
      });
      return;
    }

    socket.emit("bid:update", { bidId, bidPackageId, updateFields }, (response) => {
      if (response?.success) {
      } else {
        console.error("❌ Failed to update bid:", response?.message);
      }
      callback?.(response);
    });
  };

  // Helper function to refresh leaderboard manually
  const refreshLeaderboard = () => {
    refetch();
  };

  return {
    // Data
    leaderboard: leaderboardData,
    bids: leaderboardData?.bids || [],
    deadline: leaderboardData?.deadline,
    viewers,

    // Status
    isLoading,
    error,
    isConnected: isConnected && roomJoined,

    // Actions
    createBid,
    updateBid,
    refreshLeaderboard,
  };
}
