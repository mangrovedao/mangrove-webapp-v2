export function lerp(from: number, to: number, percent: number) {
  return from * (1 - percent) + to * percent
}
export function clamp(a: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, a))
}
