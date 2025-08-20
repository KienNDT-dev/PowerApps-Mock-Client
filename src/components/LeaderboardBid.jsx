import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const movementVariants = {
  initial: { opacity: 0, scale: 0.95, y: 8 },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 600, damping: 35 },
  },
  up: {
    y: [-10, 0],
    boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 6px 16px rgba(16,185,129,0.25)", "0 0 0 rgba(0,0,0,0)"],
    transition: { duration: 0.5 },
  },
  down: {
    y: [10, 0],
    boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 6px 16px rgba(239,68,68,0.18)", "0 0 0 rgba(0,0,0,0)"],
    transition: { duration: 0.5 },
  },
};

export default function LeaderboardBid({ bid, movement = "same" }) {
  const isTop = bid.rank === 1;

  return (
    <motion.div
      layout
      layoutId={bid.bidId}
      variants={movementVariants}
      initial="initial"
      animate={["enter", movement]}
      exit={{ opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.2 } }}
      className={`flex items-center justify-between p-3 rounded-xl border shadow-sm transition-all duration-300
        ${
          isTop
            ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-400 shadow-yellow-100"
            : bid.isMine
              ? "bg-gradient-to-r from-primary/5 to-primary/10 border-primary shadow-primary/20"
              : "bg-card border-border hover:shadow-md"
        }`}
    >
      {/* Left: Rank + Contractor */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <motion.span
            layout
            animate={{
              backgroundColor: isTop ? "#fbbf24" : "#f3f4f6",
              color: isTop ? "#92400e" : "#6b7280",
            }}
            transition={{ duration: 0.3 }}
            className="font-bold text-sm px-2 py-0.5 rounded-md"
          >
            #{bid.rank}
          </motion.span>

          {bid.isMine && (
            <Badge className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary/90 to-primary text-white shadow-sm">
              Me
            </Badge>
          )}
        </div>

        <p
          className={`font-medium text-sm truncate transition-colors duration-300 ${isTop ? "text-yellow-800" : "text-foreground"}`}
        >
          {bid.contractorAlias}
        </p>
      </div>
    </motion.div>
  );
}
