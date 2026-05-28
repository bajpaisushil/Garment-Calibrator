"use client";

import { recommendForChest } from "@/lib/sizeCharts";

type Props = {
  chestInches: number;
  shoulderInches: number;
  onRestart: () => void;
};

export default function RecommendationStep({
  chestInches,
  shoulderInches,
  onRestart,
}: Props) {
  const recs = recommendForChest(chestInches);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-accent2/15 via-white/5 to-accent/10 p-5">
        <div className="text-xs uppercase tracking-widest text-white/60">
          Your measurements
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-8 gap-y-2">
          <div>
            <span className="text-4xl font-black text-accent2">
              {chestInches.toFixed(1)}
            </span>
            <span className="ml-2 text-white/70">in chest</span>
          </div>
          <div>
            <span className="text-4xl font-black text-accent">
              {shoulderInches.toFixed(1)}
            </span>
            <span className="ml-2 text-white/70">in shoulder</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-white/60">
          Calculated locally in your browser from the captured frame and the
          standardized reference object. Nothing was uploaded.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Buy this size:</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {recs.map((rec) => {
            const fitClass =
              rec.fit === "perfect"
                ? "text-accent2"
                : rec.fit === "above"
                  ? "text-accent"
                  : "text-white";
            return (
              <a
                key={rec.brand.id}
                href={rec.brand.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/30 hover:bg-white/[0.06]"
              >
                <div>
                  <div className="text-base font-semibold">{rec.brand.name}</div>
                  <div className="text-xs text-white/50">{rec.brand.category}</div>
                  {rec.brand.notes && (
                    <div className="mt-1 text-[11px] italic text-white/40">
                      {rec.brand.notes}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-black ${fitClass}`}>
                    {rec.size?.label ?? "—"}
                  </div>
                  <div className="text-[11px] text-white/50">{rec.message}</div>
                  <div className="mt-1 text-[11px] text-accent2 opacity-0 transition group-hover:opacity-100">
                    Shop now →
                  </div>
                </div>
              </a>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-white/40">
          Links contain affiliate tags. We may earn a commission on purchases.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onRestart}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:bg-white/5"
        >
          ↻ Start over
        </button>
      </div>
    </div>
  );
}
