"use client";

import { useEffect, useRef, useState } from "react";
import { Point, distancePx, pxToInches, pxToCm } from "@/lib/geometry";

type MarkerKey = "leftShoulder" | "rightShoulder" | "leftChest" | "rightChest";

const ORDER: MarkerKey[] = [
  "leftShoulder",
  "rightShoulder",
  "leftChest",
  "rightChest",
];

const LABELS: Record<MarkerKey, string> = {
  leftShoulder: "Left shoulder tip",
  rightShoulder: "Right shoulder tip",
  leftChest: "Left chest edge (widest)",
  rightChest: "Right chest edge (widest)",
};

const HINTS: Record<MarkerKey, string> = {
  leftShoulder: "Click the outer point of your left shoulder.",
  rightShoulder: "Now the outer point of your right shoulder.",
  leftChest: "Click your left side at the widest part of the chest.",
  rightChest: "And the right side at the widest part of the chest.",
};

type Props = {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  pxPerMm: number;
  units: "in" | "cm";
  onUnitsChange: (u: "in" | "cm") => void;
  onConfirm: (chestInches: number, shoulderInches: number) => void;
  onBack: () => void;
};

export default function MeasurementStep({
  imageUrl,
  imageWidth,
  imageHeight,
  pxPerMm,
  units,
  onUnitsChange,
  onConfirm,
  onBack,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [displaySize, setDisplaySize] = useState({ w: imageWidth, h: imageHeight });
  const [markers, setMarkers] = useState<Partial<Record<MarkerKey, Point>>>({});
  const [active, setActive] = useState<MarkerKey>("leftShoulder");
  const draggingRef = useRef<MarkerKey | null>(null);

  useEffect(() => {
    function measure() {
      const el = containerRef.current;
      if (!el) return;
      const rectEl = el.getBoundingClientRect();
      const scale = Math.min(rectEl.width / imageWidth, 1);
      setDisplaySize({ w: imageWidth * scale, h: imageHeight * scale });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [imageWidth, imageHeight]);

  const scale = displaySize.w / imageWidth;

  function clientToImage(e: React.PointerEvent | PointerEvent): Point {
    const el = containerRef.current!;
    const r = el.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / scale,
      y: (e.clientY - r.top) / scale,
    };
  }

  function onCanvasPointerDown(e: React.PointerEvent) {
    const pt = clientToImage(e);
    setMarkers((m) => ({ ...m, [active]: pt }));
    const idx = ORDER.indexOf(active);
    const next = ORDER[idx + 1];
    if (next) setActive(next);
  }

  function onMarkerPointerDown(key: MarkerKey, e: React.PointerEvent) {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    draggingRef.current = key;
    setActive(key);
  }

  function onPointerMove(e: React.PointerEvent) {
    const key = draggingRef.current;
    if (!key) return;
    const pt = clientToImage(e);
    setMarkers((m) => ({ ...m, [key]: pt }));
  }

  function onPointerUp() {
    draggingRef.current = null;
  }

  const ls = markers.leftShoulder;
  const rs = markers.rightShoulder;
  const lc = markers.leftChest;
  const rc = markers.rightChest;

  const shoulderPx = ls && rs ? distancePx(ls, rs) : 0;
  const chestPx = lc && rc ? distancePx(lc, rc) : 0;

  const toUnit = (px: number) =>
    units === "in" ? pxToInches(px, pxPerMm) : pxToCm(px, pxPerMm);

  const shoulderVal = toUnit(shoulderPx);
  const chestRawVal = toUnit(chestPx);
  // Chest CIRCUMFERENCE estimate: width × π / 2 × 1.05 ≈ width × 1.65 (light fudge for back depth).
  // Front width is roughly half the circumference; multiply by ~2 for a real fit number.
  const chestCircVal = chestRawVal * 2;

  const allPlaced = ls && rs && lc && rc;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Measure</h3>
          <p className="text-sm text-white/60">{HINTS[active]}</p>
        </div>
        <div className="flex rounded-full border border-white/15 p-1 text-sm">
          <button
            onClick={() => onUnitsChange("in")}
            className={`rounded-full px-3 py-1 ${units === "in" ? "bg-white text-black" : "text-white/70"}`}
          >
            inches
          </button>
          <button
            onClick={() => onUnitsChange("cm")}
            className={`rounded-full px-3 py-1 ${units === "cm" ? "bg-white text-black" : "text-white/70"}`}
          >
            cm
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ORDER.map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              active === key
                ? "border-accent2 bg-accent2/15 text-accent2"
                : markers[key]
                  ? "border-white/20 bg-white/5 text-white"
                  : "border-dashed border-white/20 text-white/50"
            }`}
          >
            {markers[key] ? "✓ " : ""}
            {LABELS[key]}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative mx-auto overflow-hidden rounded-2xl border border-white/10 bg-black no-select"
        style={{ width: displaySize.w, height: displaySize.h, maxWidth: "100%" }}
        onPointerDown={onCanvasPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Captured frame"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${imageWidth} ${imageHeight}`}
          preserveAspectRatio="none"
        >
          {ls && rs && (
            <line
              x1={ls.x}
              y1={ls.y}
              x2={rs.x}
              y2={rs.y}
              stroke="#3cffb0"
              strokeWidth={Math.max(2, imageWidth / 400)}
              strokeDasharray={Math.max(4, imageWidth / 200)}
            />
          )}
          {lc && rc && (
            <line
              x1={lc.x}
              y1={lc.y}
              x2={rc.x}
              y2={rc.y}
              stroke="#ff5a3c"
              strokeWidth={Math.max(2, imageWidth / 400)}
              strokeDasharray={Math.max(4, imageWidth / 200)}
            />
          )}
        </svg>
        {ORDER.map((key) => {
          const p = markers[key];
          if (!p) return null;
          const color =
            key === "leftShoulder" || key === "rightShoulder" ? "#3cffb0" : "#ff5a3c";
          return (
            <button
              key={key}
              onPointerDown={(e) => onMarkerPointerDown(key, e)}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg"
              style={{
                left: p.x * scale,
                top: p.y * scale,
                width: 18,
                height: 18,
                background: color,
              }}
              aria-label={LABELS[key]}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label="Shoulder width"
          value={ls && rs ? shoulderVal.toFixed(1) : "—"}
          unit={units}
          color="text-accent2"
        />
        <Stat
          label="Chest (front)"
          value={lc && rc ? chestRawVal.toFixed(1) : "—"}
          unit={units}
          color="text-accent"
        />
        <Stat
          label="Chest (full, est.)"
          value={lc && rc ? chestCircVal.toFixed(1) : "—"}
          unit={units}
          color="text-accent"
          subtitle="front width × 2"
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:bg-white/5"
        >
          ← Re-calibrate
        </button>
        <button
          onClick={() => {
            if (!allPlaced) return;
            const chestInches = units === "in" ? chestCircVal : chestCircVal / 2.54;
            const shoulderInches = units === "in" ? shoulderVal : shoulderVal / 2.54;
            onConfirm(chestInches, shoulderInches);
          }}
          disabled={!allPlaced}
          className="rounded-full bg-accent2 px-5 py-2.5 text-sm font-semibold text-black hover:bg-accent2/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Show my sizes →
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  color,
  subtitle,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs uppercase tracking-wide text-white/50">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${color}`}>
        {value} <span className="text-base font-normal text-white/60">{unit}</span>
      </div>
      {subtitle && <div className="mt-0.5 text-xs text-white/40">{subtitle}</div>}
    </div>
  );
}
