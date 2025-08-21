import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const movementVariants = {
  initial: { opacity: 0, y: 10, scale: 0.99 },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 160, damping: 28, mass: 0.6, duration: 0.45 },
  },
  up: {
    // small upward ease, then settle
    y: [-6, 0],
    transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] },
  },
  down: {
    y: [6, 0],
    transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] },
  },
};

export default function LeaderboardBid({ bid, movement = "same" }) {
  const isTop = bid.rank === 1;

  return (
    <motion.div
      layout="position"
      variants={movementVariants}
      initial="initial"
      animate={["enter", movement]}
      exit={{ opacity: 0, scale: 0.98, y: -8, transition: { duration: 0.2 } }}
      className={`flex items-center justify-between p-3 rounded-xl border shadow-sm transition-colors
        ${
          isTop
            ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-400"
            : bid.isMine
              ? "bg-gradient-to-r from-primary/5 to-primary/10 border-primary"
              : "bg-card border-border hover:shadow-md"
        }`}
    >
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`font-bold text-xs px-2 py-0.5 rounded-md
              ${isTop ? "bg-yellow-300/70 text-yellow-900" : "bg-muted text-muted-foreground"}
            `}
          >
            #{bid.rank}
          </span>

          {bid.isMine && (
            <Badge className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary/90 to-primary text-white">
              Me
            </Badge>
          )}
        </div>

        <p
          className={`font-medium text-sm truncate ${isTop ? "text-yellow-800" : "text-foreground"}`}
        >
          {bid.contractorAlias}
        </p>
      </div>
    </motion.div>
  );
}
