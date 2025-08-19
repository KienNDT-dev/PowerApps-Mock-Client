import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function LeaderboardBid({ bid, formatAmount }) {
  return (
    <motion.div
      layout
      layoutId={bid.bidId} // Ensures smooth animation when position changes
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 500,
          damping: 30,
          duration: 0.25,
        },
      }}
      exit={{
        opacity: 0,
        scale: 0.9,
        y: -10,
        transition: { duration: 0.2 },
      }}
      className={`flex items-center justify-between p-3 rounded-xl border shadow-sm transition-all duration-300
        ${
          bid.rank === 1
            ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-400 shadow-yellow-100"
            : bid.isMine
              ? "bg-gradient-to-r from-primary/5 to-primary/10 border-primary shadow-primary/20"
              : "bg-card border-border hover:shadow-md"
        }`}
    >
      {/* Left side: Rank + Contractor */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <motion.span
            layout
            animate={{
              backgroundColor: bid.rank === 1 ? "#fbbf24" : "#f3f4f6",
              color: bid.rank === 1 ? "#92400e" : "#6b7280",
            }}
            transition={{ duration: 0.3 }}
            className="font-bold text-sm px-2 py-0.5 rounded-md"
          >
            #{bid.rank}
          </motion.span>

          {/* 🟢 "Me" badge with better UI */}
          {bid.isMine && (
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary/90 to-primary text-white shadow-sm"
            >
              Me
            </Badge>
          )}
        </div>

        <p
          className={`font-medium text-sm truncate transition-colors duration-300 ${
            bid.rank === 1 ? "text-yellow-800" : "text-foreground"
          }`}
        >
          {bid.contractorAlias}
        </p>
      </div>

      {/* Right side: Only submission time if available */}
      <div className="text-right ml-2">
        {bid.submittedOn && (
          <p className="text-xs text-muted-foreground">
            {new Date(bid.submittedOn).toLocaleTimeString()}
          </p>
        )}
      </div>
    </motion.div>
  );
}
