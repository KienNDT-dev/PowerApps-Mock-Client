import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatCurrency";

export default function BidInput({ value, onChange, onSubmit, error, disabled, priceEstimate }) {
  const [displayValue, setDisplayValue] = useState("");
  const [localError, setLocalError] = useState("");
  const [isValid, setIsValid] = useState(true);

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

  useEffect(() => {
    setDisplayValue(formatCurrency(value || ""));
    validate(value || "");
  }, [value, priceEstimate]);

  const validate = (rawDigits) => {
    if (!rawDigits) {
      setLocalError("");
      setIsValid(false);
      return;
    }
    let n = parseInt(rawDigits, 10);
    if (isNaN(n) || n <= 0) {
      setLocalError("Please enter a valid amount.");
      setIsValid(false);
      return;
    }

    // Auto-clamp if above max
    if (!isNaN(maxAllowed) && n > maxAllowed) {
      n = maxAllowed;
      setDisplayValue(formatCurrency(n));
      onChange({ target: { value: String(n) } });
    }

    if (!isNaN(minAllowed) && !isNaN(maxAllowed)) {
      if (n < minAllowed || n > maxAllowed) {
        setLocalError(
          `Your bid must be within ~±5% of the offer price (${formatCurrency(
            minAllowed
          )} - ${formatCurrency(maxAllowed)} VND).`
        );
        setIsValid(false);
        return;
      }
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
    disabled || !!effectiveError || !isValid || !(value && parseInt(value, 10) > 0);

  return (
    <div className="border-t pt-6">
      <h3 className="font-semibold mb-4">Place Your Bid</h3>
      <div className="space-y-4">
        <div>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="Enter amount (VND)"
            value={displayValue}
            onChange={handleChange}
            aria-invalid={!!effectiveError}
            className={effectiveError ? "border-[color:var(--color-error)]" : ""}
            disabled={disabled}
          />
          {effectiveError ? (
            <p className="text-sm text-[color:var(--color-error)] mt-1">{effectiveError}</p>
          ) : !isNaN(minAllowed) ? (
            <p className="text-xs text-[color:var(--color-text-primary)]/60 mt-1">
              Allowed range: {formatCurrency(minAllowed)} – {formatCurrency(maxAllowed)} VND
            </p>
          ) : null}
        </div>
        <Button
          onClick={onSubmit}
          className="w-full bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/90 text-white"
          disabled={isSubmitDisabled}
        >
          Submit Bid
        </Button>
      </div>
    </div>
  );
}
