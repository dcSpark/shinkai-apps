export function delay(e = 1e3) {
  return new Promise((t) => setTimeout(t, e));
}
