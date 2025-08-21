import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Gavel, TrendingUp, Clock } from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import LeaderboardBid from "./LeaderboardBid";
import { useEffect, useMemo, useRef, useState } from "react";

export default function Leaderboard({ bids, viewers, isExpired }) {
  const prevRanksRef = useRef(new Map());

  const rankedBids = useMemo(() => {
    if (!bids || bids.length === 0) return [];
    return bids
      .filter((bid) => bid.amount > 0)
      .map((bid) => ({ ...bid }))
      .sort((a, b) => {
        if (a.amount !== b.amount) {
          return a.amount - b.amount;
        }
        const timeA = new Date(a.updatedOn).getTime();
        const timeB = new Date(b.updatedOn).getTime();

        return timeA - timeB;
      })
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

  const [order, setOrder] = useState(() => rankedBids.map((b) => b.bidId));
  useEffect(() => {
    setOrder(rankedBids.map((b) => b.bidId));
  }, [rankedBids]);

  const bidById = useMemo(() => {
    const map = new Map(rankedBids.map((b) => [b.bidId, b]));
    return (id) => map.get(id);
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
            <div className="flex items-center gap-2 mt-1">
              {isExpired ? (
                <>
                  <Clock className="h-3 w-3 text-gray-500" />
                  <span className="text-sm font-medium text-gray-500">Ended</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                  </span>
                  <span className="text-sm font-medium text-red-600">Live</span>
                </>
              )}
            </div>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                animate={{ scale: viewers > 0 ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 0.4 }}
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.35 } }}
            className="flex flex-col items-center justify-center py-14 text-muted-foreground border rounded-xl bg-muted/20"
          >
            <Gavel className="h-10 w-10 mb-3 opacity-60" />
            <p className="text-base font-semibold">No bids yet</p>
            <p className="text-xs">Be the first to place your bid!</p>
          </motion.div>
        ) : (
          <Reorder.Group
            as="div"
            axis="y"
            values={order}
            onReorder={setOrder}
            className="list-none space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2"
            transition={{ layout: { damping: 28, stiffness: 180, mass: 0.6 } }}
          >
            <AnimatePresence mode="popLayout">
              {order.map((id) => {
                const bid = bidById(id);
                if (!bid) return null;
                return (
                  <Reorder.Item
                    key={id}
                    value={id}
                    id={id}
                    dragListener={false}
                    transition={{ type: "spring", damping: 30, stiffness: 160, mass: 0.6 }}
                    className="will-change-transform"
                  >
                    <LeaderboardBid bid={bid} movement={movementById.get(id)} />
                  </Reorder.Item>
                );
              })}
            </AnimatePresence>
          </Reorder.Group>
        )}

        {rankedBids.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25 } }}
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
