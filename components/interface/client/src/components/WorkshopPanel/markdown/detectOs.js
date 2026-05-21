/**
 * Detects the OS of the browser running the labspace interface.
 *
 * Prefers the modern `navigator.userAgentData.platform` when available,
 * falling back to `navigator.platform` and finally `navigator.userAgent`.
 *
 * @returns {"mac" | "linux" | "windows" | "unknown"}
 */
export function detectOs() {
  if (typeof navigator === "undefined") return "unknown";

  const raw = (
    navigator.userAgentData?.platform ||
    navigator.platform ||
    navigator.userAgent ||
    ""
  ).toLowerCase();

  if (raw.includes("win")) return "windows";
  if (raw.includes("mac") || raw.includes("darwin")) return "mac";
  if (raw.includes("linux") || raw.includes("x11")) return "linux";
  return "unknown";
}
