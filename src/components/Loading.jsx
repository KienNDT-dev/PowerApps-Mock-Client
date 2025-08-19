import { Loader2 } from "lucide-react";

export default function Loading({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-[color:var(--color-primary,#e60012)]" />
      <p className="mt-3 text-base sm:text-lg font-medium text-[color:var(--color-text-primary,#212121)]">
        {message}
      </p>
    </div>
  );
}
