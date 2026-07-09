const statusOptions = [
  "all",
  "confirmed",
  "checked-in",
  "completed",
  "cancelled",
  "no-show",
] as const;

export type StatusFilter = (typeof statusOptions)[number];

export function formatStatus(status: StatusFilter) {
  if (status === "all") return "All";
  return status
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function normalizeStatus(value: string | undefined): StatusFilter {
  return statusOptions.includes(value as StatusFilter) ? (value as StatusFilter) : "all";
}

export const statusFilterOptions = statusOptions.map((status) => ({
  value: status,
  label: formatStatus(status),
}));
