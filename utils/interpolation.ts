export function lerp(from: number, to: number, percent: number) {
  return from * (1 - percent) + to * percent
}
export function clamp(a: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, a))
}
export function invlerp(x: number, y: number, a: number) {
  return clamp((a - x) / (y - x))
}
export function range(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  a: number,
) {
  return lerp(x2, y2, invlerp(x1, y1, a))
}
