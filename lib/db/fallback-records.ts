/** Shared record identity helpers for all fallback cache tiers. */

export function recordIdFor(
  modelName: string,
  record: Record<string, unknown>
): string | null {
  if (modelName === "setting" && typeof record.key === "string") {
    return record.key;
  }
  if (typeof record.id === "string") {
    return record.id;
  }
  return null;
}
