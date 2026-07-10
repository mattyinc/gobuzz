import { Circle } from "lucide-react";
import type { BookingStatus } from "@/lib/booking-store";
import { formatStatus } from "@/lib/booking-status";
import { cn } from "@/lib/utils";

const statusStyles: Record<BookingStatus, string> = {
  confirmed: "border-amber-700/20 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  "checked-in": "border-emerald-700/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  completed: "border-sky-700/20 bg-sky-500/10 text-sky-800 dark:text-sky-200",
  cancelled: "border-line-soft bg-raised text-muted",
  "no-show": "border-red-700/20 bg-red-500/10 text-red-700 dark:text-red-200",
};

const dotStyles: Record<BookingStatus, string> = {
  confirmed: "fill-amber-600 text-amber-600",
  "checked-in": "fill-emerald-600 text-emerald-600",
  completed: "fill-sky-600 text-sky-600",
  cancelled: "fill-faint text-faint",
  "no-show": "fill-red-600 text-red-600",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold",
        statusStyles[status]
      )}
    >
      <Circle className={cn("h-1.5 w-1.5", dotStyles[status])} aria-hidden="true" />
      {formatStatus(status)}
    </span>
  );
}
