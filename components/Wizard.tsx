"use client";

import { useState } from "react";
import WebcamCapture from "./WebcamCapture";
import CalibrationStep from "./CalibrationStep";
import MeasurementStep from "./MeasurementStep";
import RecommendationStep from "./RecommendationStep";
import { CalibrationRect, ReferenceObject } from "@/lib/geometry";

type Step = "intro" | "capture" | "calibrate" | "measure" | "result";

type Frame = {
  url: string;
  width: number;
  height: number;
};

export default function Wizard() {
  const [step, setStep] = useState<Step>("intro");
  const [frame, setFrame] = useState<Frame | null>(null);
  const [reference, setReference] = useState<ReferenceObject>("card");
  const [pxPerMm, setPxPerMm] = useState<number | null>(null);
  // calibration rect is captured but only used implicitly via pxPerMm for measurements.
  const [, setCalibrationRect] = useState<CalibrationRect | null>(null);
  const [units, setUnits] = useState<"in" | "cm">("in");
  const [results, setResults] = useState<{ chestIn: number; shoulderIn: number } | null>(
    null,
  );

  const stepIndex = ["intro", "capture", "calibrate", "measure", "result"].indexOf(step);

  return (
    <div className="space-y-6">
      <StepIndicator current={stepIndex} />

      {step === "intro" && (
        <Intro onStart={() => setStep("capture")} />
      )}

      {step === "capture" && (
        <WebcamCapture
          onCaptured={(url, w, h) => {
            setFrame({ url, width: w, height: h });
            setStep("calibrate");
          }}
        />
      )}

      {step === "calibrate" && frame && (
        <CalibrationStep
          imageUrl={frame.url}
          imageWidth={frame.width}
          imageHeight={frame.height}
          reference={reference}
          onReferenceChange={setReference}
          onConfirm={(ppm, rect) => {
            setPxPerMm(ppm);
            setCalibrationRect(rect);
            setStep("measure");
          }}
          onBack={() => setStep("capture")}
        />
      )}

      {step === "measure" && frame && pxPerMm !== null && (
        <MeasurementStep
          imageUrl={frame.url}
          imageWidth={frame.width}
          imageHeight={frame.height}
          pxPerMm={pxPerMm}
          units={units}
          onUnitsChange={setUnits}
          onConfirm={(chestIn, shoulderIn) => {
            setResults({ chestIn, shoulderIn });
            setStep("result");
          }}
          onBack={() => setStep("calibrate")}
        />
      )}

      {step === "result" && results && (
        <RecommendationStep
          chestInches={results.chestIn}
          shoulderInches={results.shoulderIn}
          onRestart={() => {
            setFrame(null);
            setPxPerMm(null);
            setResults(null);
            setStep("intro");
          }}
        />
      )}
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <span className="inline-block rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-widest text-accent">
            Free · No app · 100% in-browser
          </span>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
            Stop guessing.
            <br />
            <span className="text-accent2">Know your true size</span> in 60 seconds.
          </h1>
          <p className="mt-4 max-w-prose text-white/70">
            A Medium at Zara is a Large at H&amp;M. Most online clothing returns
            happen because nobody owns a measuring tape. We don't need one
            either. Hold a credit card against your chest and your webcam does
            the math — every credit card on Earth is exactly 85.6 × 53.98 mm.
          </p>
          <ol className="mt-5 space-y-2 text-sm text-white/70">
            <li>
              <span className="font-mono text-accent2">1.</span> Hold a credit
              card (or an A4 sheet) flat against your chest.
            </li>
            <li>
              <span className="font-mono text-accent2">2.</span> Snap a photo
              from your laptop's webcam.
            </li>
            <li>
              <span className="font-mono text-accent2">3.</span> We tell you
              your shoulder and chest in inches — and what size to buy at every
              major brand.
            </li>
          </ol>
          <button
            onClick={onStart}
            className="mt-7 rounded-full bg-accent px-7 py-3 text-base font-semibold text-black transition hover:bg-accent/90"
          >
            Start — turn on webcam
          </button>
          <p className="mt-3 text-[11px] text-white/40">
            Your camera feed never leaves this browser tab. No upload, no
            account, no tracking pixel.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
          <div className="text-xs uppercase tracking-widest text-white/40">
            How the math works
          </div>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-black/60 p-3 text-[11px] leading-relaxed text-white/80">
{`// Credit card: 85.6 mm × 53.98 mm (ISO/IEC 7810 ID-1)
pixelsPerMm = cardPixelWidth / 85.6

shoulderMm  = shoulderPixelWidth / pixelsPerMm
shoulderIn  = shoulderMm / 25.4

// Then match against each brand's chart.
recommendSize(chestIn, brand)`}
          </pre>
          <div className="mt-4 text-xs text-white/50">
            No ML model. No server roundtrip. Just pixel ratios — the kind of
            calibration trick photographers and surveyors have used for a
            century, in your browser.
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  const steps = ["Intro", "Capture", "Calibrate", "Measure", "Sizes"];
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs">
      {steps.map((label, i) => {
        const state =
          i < current ? "done" : i === current ? "current" : "future";
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold ${
                state === "done"
                  ? "border-accent2 bg-accent2 text-black"
                  : state === "current"
                    ? "border-accent2 text-accent2"
                    : "border-white/20 text-white/40"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={
                state === "future" ? "text-white/40" : "text-white/80"
              }
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span className="text-white/20">·</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
