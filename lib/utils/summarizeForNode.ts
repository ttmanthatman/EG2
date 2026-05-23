export function summarizeForNode(data: unknown, maxLength = 120): string {
  if (data === null || data === undefined) return "—";
  if (typeof data === "string") return data.length <= maxLength ? data : data.substring(0, maxLength) + "…";
  if (Array.isArray(data)) return data.length === 0 ? "[]" : `Array(${data.length})`;
  if (typeof data === "object") {
    const keys = Object.keys(data as Record<string, unknown>);
    if (keys.length === 0) return "{}";
    const preview = keys.slice(0, 4).join(", ");
    return keys.length > 4 ? `{ ${preview}, … }` : `{ ${preview} }`;
  }
  const str = String(data);
  return str.length <= maxLength ? str : str.substring(0, maxLength) + "…";
}
