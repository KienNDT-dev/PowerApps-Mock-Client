import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Gavel } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import LeaderboardBid from "./LeaderboardBid";

export default function Leaderboard({ bids, viewers, formatAmount }) {
  return (
    <Card className="h-full rounded-2xl shadow-lg border border-border bg-background/60 backdrop-blur-sm">
      {/* Header */}
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Leaderboard</CardTitle>
            <p className="text-xs text-muted-foreground">Real-time competition</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{viewers}</span>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="pt-4">
        <div className="space-y-3">
          {bids.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-xl bg-muted/30">
              <Gavel className="h-8 w-8 mb-2 opacity-70" />
              <p className="text-sm font-medium">No bids yet</p>
              <p className="text-xs">Be the first to place a bid!</p>
            </div>
          ) : (
            <AnimatePresence>
              {bids.map((bid, index) => (
                <LeaderboardBid
                  key={bid.bidId}
                  bid={bid}
                  formatAmount={formatAmount}
                  rank={index + 1}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
