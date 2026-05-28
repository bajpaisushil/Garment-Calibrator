import Wizard from "@/components/Wizard";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-lg font-black text-black">
            T
          </div>
          <div>
            <div className="text-lg font-bold leading-none">True-Size</div>
            <div className="text-[11px] text-white/50">
              Webcam garment calibrator
            </div>
          </div>
        </div>
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden text-xs text-white/50 hover:text-white sm:block"
        >
          Open source · MIT
        </a>
      </header>

      <Wizard />

      <footer className="mt-16 border-t border-white/10 pt-6 text-[11px] text-white/40">
        <p>
          Measurements are estimates based on a single 2D photo and the
          published dimensions of your reference object. Real-world fit
          depends on fabric, cut, and brand. We don't store images, frames,
          or measurements — everything stays in this tab.
        </p>
      </footer>
    </main>
  );
}
