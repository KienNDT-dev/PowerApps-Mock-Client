import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Gavel, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import LeaderboardBid from "./LeaderboardBid";
import { useMemo, useRef } from "react";

export default function Leaderboard({ bids, viewers }) {
  const prevRanksRef = useRef(new Map());

  const rankedBids = useMemo(() => {
    if (!bids || bids.length === 0) return [];
    return bids
      .filter((bid) => bid.amount > 0)
      .map((bid) => ({ ...bid }))
      .sort((a, b) => a.amount - b.amount)
      .map((bid, index) => ({ ...bid, rank: index + 1 }));
  }, [bids]);

  const movementById = useMemo(() => {
    const map = new Map();
    for (const b of rankedBids) {
      const prev = prevRanksRef.current.get(b.bidId);
      const movement = prev ? (b.rank < prev ? "up" : b.rank > prev ? "down" : "same") : "same";
      map.set(b.bidId, movement);
    }
    prevRanksRef.current = new Map(rankedBids.map((b) => [b.bidId, b.rank]));
    return map;
  }, [rankedBids]);

  return (
    <Card className="h-full rounded-2xl shadow-lg border border-border bg-background/70 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Leaderboard
            </CardTitle>

            {/* Live Indicator */}
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-sm font-medium text-red-600">Live</span>
            </div>
          </div>

          {/* Viewers Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                animate={{ scale: viewers > 0 ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-sm text-muted-foreground cursor-default"
              >
                <Users className="h-4 w-4" />
                <span>{viewers}</span>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end">
              <p>
                {viewers} online{viewers !== 1 ? "s" : ""}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent className="pt-4 overflow-hidden">
        {rankedBids.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-14 text-muted-foreground border rounded-xl bg-muted/20"
          >
            <Gavel className="h-10 w-10 mb-3 opacity-60" />
            <p className="text-base font-semibold">No bids yet</p>
            <p className="text-xs">Be the first to place your bid!</p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2"
          >
            <AnimatePresence mode="popLayout">
              {rankedBids.map((bid) => (
                <LeaderboardBid
                  key={bid.bidId}
                  bid={bid}
                  movement={movementById.get(bid.bidId)} // 👈 pass movement
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {rankedBids.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 pt-3 border-t border-border/50 text-center"
          >
            <p className="text-xs text-muted-foreground">
              {rankedBids.length} bid{rankedBids.length !== 1 ? "s" : ""} received
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
