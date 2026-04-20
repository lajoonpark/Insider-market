export function nextRng(state: number): { value: number; state: number } {
  let x = state || 123456789;
  x ^= x << 13;
  x ^= x >> 17;
  x ^= x << 5;
  const next = x >>> 0;
  return { value: next / 4294967296, state: next };
}

export function rngRange(
  state: number,
  min: number,
  max: number,
): { value: number; state: number } {
  const next = nextRng(state);
  return { value: min + (max - min) * next.value, state: next.state };
}
