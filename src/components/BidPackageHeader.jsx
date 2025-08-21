import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatCurrency";

export default function BidPackageHeader({ name, code, priceEstimate, hasBid, canBid, isExpired }) {
  return (
    <CardHeader className="pb-4 border-b border-[color:var(--color-neutral-200)]">
      <div className="flex items-start justify-between">
        {/* Left side: Name + Code */}
        <div className="flex flex-col">
          <CardTitle className="text-2xl font-bold text-primary">{name}</CardTitle>
          <p className="text-sm font-mono text-[color:var(--color-text-primary)]/70 mt-1">{code}</p>
        </div>

        {/* Right side: Badges + Offer Price */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            {hasBid && !isExpired && (
              <Badge className="bg-[color:var(--color-success)]/10 text-[color:var(--color-success)] border border-[color:var(--color-success)]/30">
                Bid Placed
              </Badge>
            )}
            {isExpired ? (
              <Badge className="bg-gray-100 text-gray-600 border border-gray-300">Closed</Badge>
            ) : canBid ? (
              <Badge className="bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] border border-[color:var(--color-primary)]/30">
                Open
              </Badge>
            ) : (
              <Badge className="bg-[color:var(--color-error)]/10 text-[color:var(--color-error)] border border-[color:var(--color-error)]/30">
                Closed
              </Badge>
            )}
          </div>

          {/* Offer Price under badges */}
          {priceEstimate && (
            <p className="text-sm text-black">
              Offer Price:{" "}
              <span className="text-base text-primary font-semibold">
                {formatCurrency(priceEstimate)} VND
              </span>
            </p>
          )}
        </div>
      </div>
    </CardHeader>
  );
}
