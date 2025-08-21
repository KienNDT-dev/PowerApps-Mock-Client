import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useGetMyBidPackage } from "@/hooks/useGetMyBidPackage";
import { useGetLeaderboard } from "@/hooks/useGetLeaderboard";
import { useBidSocket } from "@/hooks/useBidSocket";
import { useAuth } from "@/context/AuthProvider";
import BidPackageHeader from "@/components/BidPackageHeader";
import BidInput from "@/components/BidInput";
import Leaderboard from "@/components/Leaderboard";
import { formatDate } from "@/utils/formatDate";
import { formatAmount } from "@/utils/formatAmount";
import Countdown from "react-countdown";
import Loading from "@/components/Loading";

export default function BiddingPortal() {
  const { accessToken } = useAuth();
  const { data, isLoading: bidPackageLoading } = useGetMyBidPackage();

  const { viewers, isConnected, notifications, createBid, updateBid } = useBidSocket(
    accessToken,
    data?.cr97b_bidpackageid
  );
  const {
    data: leaderboardData,
    isLoading: leaderboardLoading,
    error: leaderboardError,
  } = useGetLeaderboard(data?.cr97b_bidpackageid);

  const [bidAmount, setBidAmount] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Check if deadline has passed
  useEffect(() => {
    if (data?.cr97b_submissiondeadline) {
      const now = new Date();
      const deadline = new Date(data.cr97b_submissiondeadline);
      setIsExpired(now > deadline);
    }
  }, [data?.cr97b_submissiondeadline]);

  const {
    cr97b_bidpackageid,
    cr97b_submissiondeadline,
    cr97b_name,
    cr97b_bidpackagecode,
    cr97b_priceestimate,
    cr97b_description,
    hasBid,
    canBid,
  } = data || {};

  const myExistingBid = useMemo(() => {
    if (!leaderboardData?.bids) return null;
    return leaderboardData.bids.find((bid) => bid.isMine) || null;
  }, [leaderboardData]);

  const handleBidSubmit = () => {
    if (isExpired) return;

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
    setIsSubmitting(true);

    if (myExistingBid) {
      updateBid(myExistingBid.bidId, { bidPrice: amount }, (response) => {
        setIsSubmitting(false);
        if (response?.success) {
          setBidAmount("");
        } else {
          setError(response?.message || "Failed to update bid");
        }
      });
    } else {
      createBid(amount, "My Bid", (response) => {
        setIsSubmitting(false);
        if (response?.success) {
          setBidAmount("");
        } else {
          setError(response?.message || "Failed to create bid");
        }
      });
    }
  };

  if (bidPackageLoading || leaderboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loading message="Loading..." />
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
          <div className="col-span-4 bg-white">
            <Card className="h-full rounded-2xl shadow-lg">
              <BidPackageHeader
                name={cr97b_name}
                code={cr97b_bidpackagecode}
                priceEstimate={cr97b_priceestimate}
                hasBid={hasBid}
                canBid={canBid}
                isExpired={isExpired}
              />
              <CardContent className="space-y-8 text-[color:var(--color-text-primary)]">
                <div className="space-y-3">
                  <h3 className="font-semibold text-base">Detailed Description</h3>
                  <div className="max-h-36 overflow-y-auto rounded-lg border border-[color:var(--color-neutral-200)] bg-[color:var(--color-neutral-200)] p-3 text-sm leading-relaxed shadow-inner">
                    <p className="text-slate-700">{cr97b_description}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5 p-4 flex flex-col gap-4">
                  <div
                    className={`rounded-xl p-4 flex flex-col gap-4 border transition-colors
    ${
      isExpired
        ? "border-gray-300 bg-gray-50"
        : "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5"
    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1
          ${
            isExpired
              ? "bg-gray-100 text-gray-500 ring-gray-200"
              : "bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] ring-[color:var(--color-primary)]/20"
          }`}
                        >
                          <Clock className="h-5 w-5" />
                        </div>

                        <div>
                          <p
                            className={`text-xs font-medium tracking-wide uppercase
          ${isExpired ? "text-gray-500" : "text-[color:var(--color-text-primary)]/70"}`}
                          >
                            Submission Deadline
                          </p>

                          <p
                            className={`mt-1 text-xl font-bold leading-snug
            ${isExpired ? "text-gray-600" : "text-[color:var(--color-primary)]"}`}
                          >
                            {isExpired
                              ? "Bidding Period Ended"
                              : formatDate(cr97b_submissiondeadline)}
                          </p>

                          {!isExpired && (
                            <p className="mt-1 text-xs text-[color:var(--color-text-primary)]/60">
                              Please submit before the closing time.
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                          isExpired
                            ? "bg-gray-100 text-gray-600 ring-gray-200"
                            : "bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] ring-[color:var(--color-primary)]/20"
                        }`}
                      >
                        {isExpired ? "Closed" : "Open"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Countdown
                      date={new Date(cr97b_submissiondeadline)}
                      renderer={({ days, hours, minutes, seconds, completed }) => {
                        if (completed) {
                          return;
                        }
                        return (
                          <div className="flex gap-3 w-full justify-around">
                            <div className="flex flex-col items-center px-3 py-2 rounded-md bg-[color:var(--color-neutral-200)] min-w-[60px]">
                              <span className="text-lg font-extrabold text-[color:var(--color-primary)]">
                                {days}
                              </span>
                              <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-text-primary)]/70">
                                Days
                              </span>
                            </div>
                            <div className="flex flex-col items-center px-3 py-2 rounded-md bg-[color:var(--color-neutral-200)] min-w-[60px]">
                              <span className="text-lg font-extrabold text-[color:var(--color-primary)]">
                                {hours}
                              </span>
                              <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-text-primary)]/70">
                                Hrs
                              </span>
                            </div>
                            <div className="flex flex-col items-center px-3 py-2 rounded-md bg-[color:var(--color-neutral-200)] min-w-[60px]">
                              <span className="text-lg font-extrabold text-[color:var(--color-primary)]">
                                {minutes}
                              </span>
                              <span className="text-[11px] uppercase tracking-wide text-[color:var(--color-text-primary)]/70">
                                Min
                              </span>
                            </div>
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
                    bidPackageId={cr97b_bidpackageid}
                    error={error}
                    disabled={!canBid || !isConnected}
                    existingBid={myExistingBid}
                    isSubmitting={isSubmitting}
                    isExpired={isExpired}
                  />

                  {!canBid && !isExpired && (
                    <p className="mt-2 text-xs italic text-[color:var(--color-text-primary)]/50">
                      Bidding is closed for this package.
                    </p>
                  )}
                  {!isConnected && !isExpired && (
                    <p className="mt-2 text-xs italic text-yellow-600">
                      Connecting to live updates...
                    </p>
                  )}
                  {isExpired && (
                    <p className="mt-2 text-xs italic text-gray-500">
                      The bidding period for this package has ended.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 bg-white">
            <Leaderboard
              bids={leaderboardData?.bids || []}
              viewers={viewers}
              formatAmount={formatAmount}
              isExpired={isExpired}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
