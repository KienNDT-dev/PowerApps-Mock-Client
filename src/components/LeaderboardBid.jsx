import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function LeaderboardBid({ bid, formatAmount }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`flex items-center justify-between p-3 rounded-xl border shadow-sm
        ${
          bid.rank === 1
            ? "bg-yellow-50 border-yellow-400"
            : bid.isMine
              ? "bg-primary/10 border-primary"
              : "bg-card border-border"
        }`}
    >
      {/* Left side: Rank + Contractor */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-bold text-sm ${bid.rank === 1 ? "text-yellow-600" : ""}`}>
            #{bid.rank}
          </span>
          {bid.isMine && (
            <Badge variant="secondary" className="text-xs">
              My Bid
            </Badge>
          )}
        </div>
        <p className={`font-medium text-sm truncate ${bid.rank === 1 ? "text-yellow-800" : ""}`}>
          {bid.contractorAlias}
        </p>
      </div>

      {/* Right side: Amount */}
      <div className="text-right">
        <p className={`text-sm font-mono font-semibold ${bid.rank === 1 ? "text-yellow-700" : ""}`}>
          {formatAmount(bid.amount)}
        </p>
        <p className="text-xs text-muted-foreground">{bid.currency}</p>
      </div>
    </motion.div>
  );
}
