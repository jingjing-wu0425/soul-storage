import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-bg-secondary)_0%,_transparent_70%)]" />

      {/* Breathing ambient dot */}
      <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-accent/30 animate-breathe" />
      <div
        className="absolute top-2/3 right-1/3 w-1.5 h-1.5 rounded-full bg-accent/20 animate-breathe"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 text-center px-6 animate-fade-in">
        <h1 className="font-[var(--font-serif)] text-5xl md:text-7xl font-bold tracking-tight text-text-primary mb-6">
          The Soul Storage
        </h1>
        <p className="text-text-secondary text-lg md:text-xl max-w-md mx-auto mb-12 leading-relaxed">
          每一个情绪、每一帧画面、每一段旋律
          <br />
          都是生命的切片
        </p>

        <Link
          href="/resume"
          className="inline-flex items-center gap-3 px-8 py-3 rounded-full border border-accent/40 text-accent hover:bg-accent/10 transition-all duration-300 text-sm tracking-wider uppercase"
        >
          <span>进入</span>
          <span className="text-accent/50">→</span>
        </Link>
      </div>

      {/* Bottom subtle line */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
    </div>
  );
}
