import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useGetMyBidPackage } from "@/hooks/useGetMyBidPackage";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/context/AuthProvider";
import BidPackageHeader from "@/components/BidPackageHeader";
import BidInput from "@/components/BidInput";
import Leaderboard from "@/components/Leaderboard";
import { formatDate } from "@/utils/formatDate";
import { formatAmount } from "@/utils/formatAmount";
import Countdown from "react-countdown";

export default function BiddingPortal() {
  const { accessToken } = useAuth();
  const { data, isLoading } = useGetMyBidPackage();
  const socketRef = useSocket(accessToken);

  const [bidAmount, setBidAmount] = useState("");
  const [error, setError] = useState("");
  const [leaderboard, setLeaderboard] = useState({ viewers: 0, bids: [] });

  const {
    cr97b_bidpackageid,
    cr97b_submissiondeadline,
    cr97b_name,
    cr97b_bidpackagecode,
    cr97b_priceestimate,
    cr97b_description,
    cr97b_createdon,
    hasBid,
    canBid,
  } = data || {};

  const handleBidSubmit = () => {
    if (!bidAmount || isNaN(Number(bidAmount))) {
      setError("Please enter a valid amount");
      return;
    }
    const amount = Number(bidAmount);
    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    setError("");
    const newBid = {
      bidId: `new-${Date.now()}`,
      contractorId: "current-user",
      contractorAlias: "My Company",
      amount: amount,
      currency: "VND",
      isMine: true,
      submittedOn: new Date().toISOString(),
      rank: 1,
    };
    const updatedBids = [
      newBid,
      ...leaderboard.bids.map((bid) => ({
        ...bid,
        rank: bid.rank + 1,
        isMine: false,
      })),
    ]
      .sort((a, b) => a.amount - b.amount)
      .map((bid, index) => ({
        ...bid,
        rank: index + 1,
      }));
    setLeaderboard((prev) => ({
      ...prev,
      bids: updatedBids,
    }));
    setBidAmount("");
  };

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !cr97b_bidpackageid) return;

    socket.emit("join:bidPackage", { bidPackageId: cr97b_bidpackageid });

    const handleNewBid = (bid) => {
      setLeaderboard((prev) => {
        const exists = prev.bids.find((b) => b.bidId === bid.bidId);
        if (exists) return prev;
        const updated = [...prev.bids, bid]
          .sort((a, b) => a.amount - b.amount)
          .map((b, idx) => ({ ...b, rank: idx + 1 }));
        return { ...prev, bids: updated };
      });
    };
    const handleUpdatedBid = (bid) => {
      setLeaderboard((prev) => {
        const updated = prev.bids
          .map((b) => (b.bidId === bid.bidId ? { ...b, ...bid } : b))
          .sort((a, b) => a.amount - b.amount)
          .map((b, idx) => ({ ...b, rank: idx + 1 }));
        return { ...prev, bids: updated };
      });
    };
    const handleViewers = (count) => {
      setLeaderboard((prev) => ({ ...prev, viewers: count }));
    };

    socket.on("bid:new", handleNewBid);
    socket.on("bid:updated", handleUpdatedBid);
    socket.on("room:viewers", handleViewers);

    return () => {
      socket.emit("leave:bidPackage", { bidPackageId: cr97b_bidpackageid });
      socket.off("bid:new", handleNewBid);
      socket.off("bid:updated", handleUpdatedBid);
      socket.off("room:viewers", handleViewers);
    };
  }, [socketRef, cr97b_bidpackageid]);

  useEffect(() => {
    if (!data) return;
    setLeaderboard((prev) => ({
      ...prev,
      bids: Array.isArray(data.bids)
        ? data.bids
            .map((bid, idx) => ({
              ...bid,
              rank: idx + 1,
              isMine: bid.isMine || false,
            }))
            .sort((a, b) => a.amount - b.amount)
            .map((bid, idx) => ({ ...bid, rank: idx + 1 }))
        : [],
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-lg text-muted-foreground animate-pulse">Loading bid package...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-lg text-muted-foreground">No bid package available.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-5 gap-6 h-[calc(100vh-3rem)]">
          {/* Left Container */}
          <div className="col-span-4 bg-white">
            <Card className="h-full rounded-2xl shadow-lg">
              <BidPackageHeader
                name={cr97b_name}
                code={cr97b_bidpackagecode}
                priceEstimate={cr97b_priceestimate}
                hasBid={hasBid}
                canBid={canBid}
              />
              <CardContent className="space-y-8 text-[color:var(--color-text-primary)]">
                {/* Description */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-base">Detailed Description</h3>
                  <div className="max-h-36 overflow-y-auto rounded-lg border border-[color:var(--color-neutral-200)] bg-[color:var(--color-neutral-200)] p-3 text-sm leading-relaxed shadow-inner">
                    <p className="text-slate-700">{cr97b_description}</p>
                  </div>
                </div>

                {/* Deadline Section */}
                <div className="rounded-xl border border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5 p-4 flex flex-col gap-4">
                  {/* Deadline title + date */}
                  <div className="flex items-start gap-3">
                    <Clock className="h-6 w-6 text-[color:var(--color-primary)] mt-1" />
                    <div>
                      <p className="text-sm font-medium text-[color:var(--color-text-primary)]/70">
                        Submission Deadline
                      </p>
                      <p className="text-lg font-bold text-[color:var(--color-primary)]">
                        {formatDate(cr97b_submissiondeadline)}
                      </p>
                    </div>
                  </div>

                  {/* Countdown */}
                  <div className="flex items-center justify-between gap-2">
                    <Countdown
                      date={new Date(cr97b_submissiondeadline)}
                      renderer={({ days, hours, minutes, seconds, completed }) => {
                        if (completed) {
                          return (
                            <span className="text-[color:var(--color-error)] font-semibold text-lg">
                              Closed
                            </span>
                          );
                        }
                        return (
                          <div className="flex gap-3 w-full justify-around">
                            {/* Days */}
                            <div className="flex flex-col items-center px-3 py-2 rounded-md bg-[color:var(--color-neutral-200)] min-w-[60px]">
                              <span className="text-lg font-extrabold text-[color:var(--color-primary)]">
                                {days}
                              </span>
                              <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-text-primary)]/70">
                                Days
                              </span>
                            </div>
                            {/* Hours */}
                            <div className="flex flex-col items-center px-3 py-2 rounded-md bg-[color:var(--color-neutral-200)] min-w-[60px]">
                              <span className="text-lg font-extrabold text-[color:var(--color-primary)]">
                                {hours}
                              </span>
                              <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-text-primary)]/70">
                                Hrs
                              </span>
                            </div>
                            {/* Minutes */}
                            <div className="flex flex-col items-center px-3 py-2 rounded-md bg-[color:var(--color-neutral-200)] min-w-[60px]">
                              <span className="text-lg font-extrabold text-[color:var(--color-primary)]">
                                {minutes}
                              </span>
                              <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-text-primary)]/70">
                                Min
                              </span>
                            </div>
                            {/* Seconds */}
                            <div
                              className={`flex flex-col items-center px-3 py-2 rounded-md bg-[color:var(--color-neutral-200)] min-w-[60px] ${
                                days === 0 && hours === 0 ? "animate-pulse" : ""
                              }`}
                            >
                              <span className="text-lg font-extrabold text-[color:var(--color-primary)]">
                                {seconds}
                              </span>
                              <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-text-primary)]/70">
                                Sec
                              </span>
                            </div>
                          </div>
                        );
                      }}
                    />
                  </div>
                </div>

                {/* Bid Input */}
                <div className="pt-4 border-t border-[color:var(--color-neutral-200)]">
                  <BidInput
                    priceEstimate={cr97b_priceestimate}
                    value={bidAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setBidAmount(value);
                      if (error) setError("");
                    }}
                    onSubmit={handleBidSubmit}
                    error={error}
                    disabled={!canBid}
                  />

                  {/* Error / Disabled states */}
                  {error && (
                    <p className="mt-2 text-sm font-medium text-[color:var(--color-error)]">
                      {error}
                    </p>
                  )}
                  {!canBid && (
                    <p className="mt-2 text-xs italic text-[color:var(--color-text-primary)]/50">
                      Bidding is closed for this package.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right Container */}
          <div className="col-span-1 bg-white">
            <Leaderboard
              bids={leaderboard.bids}
              viewers={leaderboard.viewers}
              formatAmount={formatAmount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
