import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatCurrency";

export default function BidInput({
  value,
  onChange,
  onSubmit,
  error,
  disabled,
  priceEstimate,
  bidPackageId,
  existingBid = null,
  isSubmitting = false,
  isExpired = false,
}) {
  const [displayValue, setDisplayValue] = useState("");
  const [localError, setLocalError] = useState("");
  const [isValid, setIsValid] = useState(false);

  console.log("🔄 BidInput rendered with existingBid:", existingBid);

  const estimateNum = (() => {
    if (priceEstimate === null || priceEstimate === undefined) return NaN;
    if (typeof priceEstimate === "number") return priceEstimate;
    const n = parseInt(String(priceEstimate).replace(/\D/g, ""), 10);
    return isNaN(n) ? NaN : n;
  })();

  const step = 1_000_000;
  const minExact = !isNaN(estimateNum) ? Math.floor(estimateNum * 0.95) : NaN;
  const maxExact = !isNaN(estimateNum) ? Math.ceil(estimateNum * 1.05) : NaN;
  const minAllowed = !isNaN(minExact) ? Math.floor(minExact / step) * step : NaN;
  const maxAllowed = !isNaN(maxExact) ? Math.ceil(maxExact / step) * step : NaN;

  const isUpdate = existingBid && existingBid.bidId;
  const buttonText = isExpired ? "Bid Ended" : isUpdate ? "Update Bid" : "Submit Bid";

  useEffect(() => {
    console.log("🔍 BidInput useEffect triggered:", { value, existingBid });
    setDisplayValue(formatCurrency(value || ""));
    validate(value || "");
  }, [value, priceEstimate, existingBid?.amount, existingBid?.bidId]);

  const validate = (rawDigits) => {
    console.log("🔍 Validating with data:", {
      rawDigits,
      currentAmount: parseInt(rawDigits, 10),
      existingAmount: existingBid?.amount,
      isUpdate,
      existingBid,
    });

    if (!rawDigits) {
      setLocalError("");
      setIsValid(false);
      return;
    }

    const n = parseInt(rawDigits, 10);
    if (isNaN(n) || n <= 0) {
      setLocalError("Please enter a valid amount.");
      setIsValid(false);
      return;
    }

    if (!isNaN(minAllowed) && !isNaN(maxAllowed)) {
      if (n < minAllowed || n > maxAllowed) {
        setLocalError(`Your bid must be within ~±5% of the offer price.`);
        setIsValid(false);
        return;
      }
    }

    if (isUpdate && existingBid && n === existingBid.amount) {
      setLocalError("Please enter a different amount to update your bid.");
      setIsValid(false);
      return;
    }

    setLocalError("");
    setIsValid(true);
  };

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setDisplayValue(formatCurrency(raw));
    onChange({ target: { value: raw } });
    validate(raw);
  };

  const effectiveError = error || localError;
  const isSubmitDisabled =
    disabled ||
    isExpired ||
    !!effectiveError ||
    !isValid ||
    !(value && parseInt(value, 10) > 0) ||
    isSubmitting;

  return (
    <div className="border-t pt-6">
      <h3 className="font-semibold mb-4">
        {isExpired ? "Bidding Period Ended" : isUpdate ? "Update Your Bid" : "Place Your Bid"}
        {isUpdate && existingBid && !isExpired && (
          <span className="text-sm font-normal text-muted-foreground ml-2">
            (Current: {formatCurrency(existingBid.amount)} VND)
          </span>
        )}
      </h3>

      <div className="space-y-4">
        <div>
          <Input
            type="text"
            inputMode="numeric"
            placeholder={isExpired ? "Bidding has ended" : "Enter amount (VND)"}
            value={displayValue}
            onChange={handleChange}
            aria-invalid={!!effectiveError}
            className={effectiveError ? "border-[color:var(--color-error)]" : ""}
            disabled={disabled || isSubmitting || isExpired}
          />

          {!isNaN(minAllowed) && !isExpired && (
            <p className="text-xs text-[color:var(--color-text-primary)]/60 mt-1">
              Allowed range: {formatCurrency(minAllowed)} – {formatCurrency(maxAllowed)} VND
            </p>
          )}

          {effectiveError && !isExpired && (
            <p className="text-sm text-[color:var(--color-error)] mt-1">{effectiveError}</p>
          )}
        </div>

        <Button
          onClick={onSubmit}
          className={`w-full ${
            isExpired
              ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
              : "bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/90"
          } text-white`}
          disabled={isSubmitDisabled}
        >
          {isSubmitting && !isExpired ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              {isUpdate ? "Updating..." : "Submitting..."}
            </span>
          ) : (
            buttonText
          )}
        </Button>
      </div>
    </div>
  );
}
