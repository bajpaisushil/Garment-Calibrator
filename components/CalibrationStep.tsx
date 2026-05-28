"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalibrationRect,
  ReferenceObject,
  aspectRatio,
  pixelsPerMm,
} from "@/lib/geometry";

type Props = {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  reference: ReferenceObject;
  onReferenceChange: (ref: ReferenceObject) => void;
  onConfirm: (pxPerMm: number, rect: CalibrationRect) => void;
  onBack: () => void;
};

type DragMode =
  | { kind: "move"; startX: number; startY: number; rect: CalibrationRect }
  | { kind: "resize"; corner: "tl" | "tr" | "bl" | "br"; rect: CalibrationRect }
  | null;

export default function CalibrationStep({
  imageUrl,
  imageWidth,
  imageHeight,
  reference,
  onReferenceChange,
  onConfirm,
  onBack,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [displaySize, setDisplaySize] = useState({ w: imageWidth, h: imageHeight });
  const [rect, setRect] = useState<CalibrationRect>(() => {
    const ratio = aspectRatio(reference);
    const width = imageWidth * 0.22;
    const height = width / ratio;
    return {
      x: imageWidth / 2 - width / 2,
      y: imageHeight * 0.5 - height / 2,
      width,
      height,
    };
  });
  const dragRef = useRef<DragMode>(null);

  useEffect(() => {
    const ratio = aspectRatio(reference);
    setRect((r) => ({ ...r, height: r.width / ratio }));
  }, [reference]);

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

  function clientToImage(e: PointerEvent | React.PointerEvent) {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / scale,
      y: (e.clientY - r.top) / scale,
    };
  }

  function startMove(e: React.PointerEvent) {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    const pt = clientToImage(e);
    dragRef.current = {
      kind: "move",
      startX: pt.x - rect.x,
      startY: pt.y - rect.y,
      rect,
    };
  }

  function startResize(corner: "tl" | "tr" | "bl" | "br", e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { kind: "resize", corner, rect };
  }

  function onPointerMove(e: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    const pt = clientToImage(e);
    const ratio = aspectRatio(reference);

    if (drag.kind === "move") {
      const x = Math.max(0, Math.min(imageWidth - rect.width, pt.x - drag.startX));
      const y = Math.max(0, Math.min(imageHeight - rect.height, pt.y - drag.startY));
      setRect((r) => ({ ...r, x, y }));
      return;
    }

    const r0 = drag.rect;
    let nx = r0.x;
    let ny = r0.y;
    let nw = r0.width;
    let nh = r0.height;
    const right = r0.x + r0.width;
    const bottom = r0.y + r0.height;

    if (drag.corner === "br") {
      nw = Math.max(20, pt.x - r0.x);
      nh = nw / ratio;
    } else if (drag.corner === "tr") {
      nw = Math.max(20, pt.x - r0.x);
      nh = nw / ratio;
      ny = bottom - nh;
    } else if (drag.corner === "bl") {
      nw = Math.max(20, right - pt.x);
      nh = nw / ratio;
      nx = right - nw;
    } else if (drag.corner === "tl") {
      nw = Math.max(20, right - pt.x);
      nh = nw / ratio;
      nx = right - nw;
      ny = bottom - nh;
    }

    nx = Math.max(0, Math.min(imageWidth - nw, nx));
    ny = Math.max(0, Math.min(imageHeight - nh, ny));
    setRect({ x: nx, y: ny, width: nw, height: nh });
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  const pxPerMm = pixelsPerMm(rect, reference);
  const rectStyle = {
    left: rect.x * scale,
    top: rect.y * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Calibrate</h3>
          <p className="text-sm text-white/60">
            Drag the orange rectangle so its edges sit exactly on the card.
            That's how we learn what 1 mm is in pixels.
          </p>
        </div>
        <div className="flex rounded-full border border-white/15 p-1 text-sm">
          <button
            onClick={() => onReferenceChange("card")}
            className={`rounded-full px-3 py-1 transition ${
              reference === "card" ? "bg-white text-black" : "text-white/70"
            }`}
          >
            Credit card
          </button>
          <button
            onClick={() => onReferenceChange("a4")}
            className={`rounded-full px-3 py-1 transition ${
              reference === "a4" ? "bg-white text-black" : "text-white/70"
            }`}
          >
            A4 paper
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative mx-auto overflow-hidden rounded-2xl border border-white/10 bg-black no-select"
        style={{ width: displaySize.w, height: displaySize.h, maxWidth: "100%" }}
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
        <div
          className="absolute cursor-move touch-none rounded-sm border-2 border-accent bg-accent/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
          style={rectStyle}
          onPointerDown={startMove}
        >
          {(["tl", "tr", "bl", "br"] as const).map((corner) => (
            <div
              key={corner}
              onPointerDown={(e) => startResize(corner, e)}
              className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent ${
                corner === "tl"
                  ? "left-0 top-0 cursor-nwse-resize"
                  : corner === "tr"
                    ? "left-full top-0 cursor-nesw-resize"
                    : corner === "bl"
                      ? "left-0 top-full cursor-nesw-resize"
                      : "left-full top-full cursor-nwse-resize"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
        <div>
          <span className="text-white/60">Pixels per millimeter: </span>
          <span className="font-mono text-accent2">{pxPerMm.toFixed(2)}</span>
        </div>
        <div className="text-white/50">
          Reference: {reference === "card" ? "85.6 × 53.98 mm" : "210 × 297 mm"}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:bg-white/5"
        >
          ← Retake photo
        </button>
        <button
          onClick={() => onConfirm(pxPerMm, rect)}
          className="rounded-full bg-accent2 px-5 py-2.5 text-sm font-semibold text-black hover:bg-accent2/90"
        >
          Looks right — measure me →
        </button>
      </div>
    </div>
  );
}
