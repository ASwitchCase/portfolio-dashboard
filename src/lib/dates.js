export function toDateInputValue(isoString) {
  if (!isoString) return "";
  return isoString.slice(0, 10); // yyyy-MM-dd
}

export function fromDateInputValue(dateString) {
  if (!dateString) return null;
  return new Date(`${dateString}T00:00:00.000Z`).toISOString();
}

export function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
