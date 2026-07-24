/**
 * 后坐力 spray pattern — 逐行对照 legacy/index.html 的 recoilPattern() 函数。
 * Shot 1 sits at the aim point (shared origin); each later shot kicks up
 * (recoilUp) and drifts (recoilRight) with a cumulative variance wander.
 */
import type { Stats } from '@/types/weapon'

// deterministic noise in ~[-1,1] — same seed as original
const noise = (i: number): number => (Math.sin(i * 127.1 + 31.7) * 43758.5453) % 1

export interface Point {
  x: number
  y: number
}

export function recoilPattern(s: Stats, n: number): Point[] {
  const pts: Point[] = [{ x: 0, y: 0 }]
  let x = 0
  let y = 0
  for (let i = 1; i < n; i++) {
    y += s.recoilUp
    x += s.recoilRight + noise(i) * s.recoilVar * 2.4
    pts.push({ x, y })
  }
  return pts
}

/** detect whether current build's recoil differs from stock — drives single/dual panel render */
export function recoilChanged(s: Stats, base: Stats | null): boolean {
  if (!base) return false
  return (
    Math.abs(s.recoilUp - base.recoilUp) > 1e-4 ||
    Math.abs(s.recoilRight - base.recoilRight) > 1e-4 ||
    Math.abs(s.recoilVar - base.recoilVar) > 1e-4
  )
}
