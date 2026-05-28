"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onCaptured: (dataUrl: string, naturalWidth: number, naturalHeight: number) => void;
};

export default function WebcamCapture({ onCaptured }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`Camera unavailable: ${msg}`);
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const snap = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    const url = canvas.toDataURL("image/jpeg", 0.92);
    onCaptured(url, w, h);
  }, [onCaptured]);

  const startCountdown = useCallback(() => {
    let n = 3;
    setCountdown(n);
    const tick = () => {
      n -= 1;
      if (n <= 0) {
        setCountdown(null);
        snap();
      } else {
        setCountdown(n);
        setTimeout(tick, 1000);
      }
    };
    setTimeout(tick, 1000);
  }, [snap]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
        <video
          ref={videoRef}
          playsInline
          muted
          className="h-full w-full object-cover [transform:scaleX(-1)]"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-2/3 w-1/3 rounded-xl border-2 border-dashed border-accent2/70" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-xs text-white/70">
          Hold the card flat against your chest, centered in the dashed box.
        </div>
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl font-black text-accent2 drop-shadow-[0_4px_20px_rgba(60,255,176,0.6)]">
              {countdown}
            </span>
          </div>
        )}
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-white/70">
            Requesting camera…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-red-300">
            {error}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/60">
          Stand 4–6 ft from the laptop. Wear a fitted top so the chest line is visible.
        </p>
        <div className="flex gap-2">
          <button
            onClick={startCountdown}
            disabled={!ready || countdown !== null}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            3-second timer
          </button>
          <button
            onClick={snap}
            disabled={!ready}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Snap now
          </button>
        </div>
      </div>
    </div>
  );
}
