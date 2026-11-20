export const PARTING_START_MS = 3750;
export const WRAP_CLEAR_MS = 5420;

export function smoothProgress(elapsed, start, end) {
  const p = Math.max(0, Math.min(1, (elapsed - start) / (end - start)));
  return p * p * (3 - 2 * p);
}

// Ribbon and wrap meet at the same two points throughout their release.
export function partingProgress(elapsed) {
  return smoothProgress(elapsed, PARTING_START_MS, 5070);
}
