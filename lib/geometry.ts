export type Point = { x: number; y: number };

export type CalibrationRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const CREDIT_CARD_MM = { width: 85.6, height: 53.98 } as const;
export const A4_MM = { width: 210, height: 297 } as const;

export type ReferenceObject = "card" | "a4";

export function referenceDims(ref: ReferenceObject) {
  return ref === "card" ? CREDIT_CARD_MM : A4_MM;
}

export function aspectRatio(ref: ReferenceObject) {
  const d = referenceDims(ref);
  return d.width / d.height;
}

export function pixelsPerMm(rect: CalibrationRect, ref: ReferenceObject): number {
  const { width: realW, height: realH } = referenceDims(ref);
  const fromWidth = rect.width / realW;
  const fromHeight = rect.height / realH;
  return (fromWidth + fromHeight) / 2;
}

export function distancePx(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function pxToInches(px: number, pxPerMm: number): number {
  const mm = px / pxPerMm;
  return mm / 25.4;
}

export function pxToCm(px: number, pxPerMm: number): number {
  return px / pxPerMm / 10;
}
