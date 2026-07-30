/**
 * Returns "Xh Ym" (or "Ym") until the next scheduled digest.
 *
 * Digests are generated at 06:00 and 16:00 Europe/Lisbon time.
 * Uses Intl.DateTimeFormat to correctly handle DST (Lisbon is UTC+1 in winter,
 * UTC+2 in summer — we never hardcode the UTC offset).
 */
export function getNextDigestCountdown(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Lisbon",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);
  const h = parseInt(parts.find(p => p.type === "hour")!.value);
  const m = parseInt(parts.find(p => p.type === "minute")!.value);
  const totalMin = h * 60 + m;
  const slots = [6 * 60, 16 * 60]; // 6:00 and 16:00 Lisbon
  const next = slots.find(s => s > totalMin);
  const diff = next !== undefined ? next - totalMin : slots[0] + 24 * 60 - totalMin;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

/**
 * Returns the next digest time as a display string in Lisbon local time,
 * e.g. "06:00" or "16:00", plus countdown: "06:00 · 3h 44m"
 */
export function getNextDigestLabel(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Lisbon",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);
  const h = parseInt(parts.find(p => p.type === "hour")!.value);
  const m = parseInt(parts.find(p => p.type === "minute")!.value);
  const totalMin = h * 60 + m;
  const slots = [6 * 60, 16 * 60];
  const next = slots.find(s => s > totalMin) ?? slots[0];
  const diff = next !== undefined
    ? (next > totalMin ? next - totalMin : slots[0] + 24 * 60 - totalMin)
    : slots[0] + 24 * 60 - totalMin;
  const slotH = Math.floor(next / 60);
  const slotM = next % 60;
  const dh = Math.floor(diff / 60);
  const dm = diff % 60;
  const timeStr = `${String(slotH).padStart(2, "0")}:${String(slotM).padStart(2, "0")}`;
  const countStr = dh > 0 ? `${dh}h ${dm}m` : `${dm}m`;
  return `${timeStr} · ${countStr}`;
}
