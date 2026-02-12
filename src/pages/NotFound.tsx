import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-hidden px-4">
      {/* Ambient background layers */}
      <div className="pointer-events-none absolute inset-0">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary)/0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Nebula radial */}
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[120px]" />
        <div className="absolute left-1/3 top-1/4 h-96 w-96 rounded-full bg-neon-cyan/[0.04] blur-[100px]" />

        {/* Floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="absolute block h-1 w-1 rounded-full bg-primary/40"
            style={{
              left: `${10 + (i * 7.3) % 80}%`,
              top: `${8 + (i * 11.7) % 80}%`,
              animation: `float ${4 + (i % 3) * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}

        {/* Horizontal light streaks */}
        <div className="absolute left-0 top-[38%] h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute left-0 top-[62%] h-px w-full bg-gradient-to-r from-transparent via-neon-cyan/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Logo + Beta tag */}
        <div className="mb-12 flex items-center gap-2">
          <span className="font-display text-lg tracking-widest text-primary">CODETRACKX</span>
          <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-heading text-[10px] uppercase tracking-wider text-primary/70">
            Private Beta
          </span>
        </div>

        {/* Circuit frame + 404 */}
        <div className="relative mb-6">
          {/* Circuit decorations */}
          <svg className="absolute -left-10 -top-6 h-8 w-8 text-primary/30" viewBox="0 0 32 32" fill="none">
            <path d="M0 16h12m4 0h16M16 0v12m0 4v16" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="16" cy="16" r="2" fill="currentColor" />
          </svg>
          <svg className="absolute -bottom-6 -right-10 h-8 w-8 text-primary/30" viewBox="0 0 32 32" fill="none">
            <path d="M0 16h12m4 0h16M16 0v12m0 4v16" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="16" cy="16" r="2" fill="currentColor" />
          </svg>

          {/* Glowing 404 */}
          <h1
            className="font-display text-[8rem] font-bold leading-none tracking-wider text-primary sm:text-[10rem]"
            style={{
              textShadow:
                "0 0 20px hsl(var(--primary)/0.5), 0 0 60px hsl(var(--primary)/0.25), 0 0 100px hsl(var(--primary)/0.1)",
              animation: "glow-pulse 3s ease-in-out infinite",
            }}
          >
            404
          </h1>
        </div>

        {/* Sub-heading */}
        <h2 className="mb-3 font-heading text-2xl font-semibold tracking-wide text-foreground sm:text-3xl">
          Page Not Found
        </h2>

        <p className="mb-10 max-w-md text-sm leading-relaxed text-muted-foreground">
          We're sorry, the page you're looking for might have been removed or doesn't exist.
        </p>

        {/* CTA */}
        <Button
          variant="arena"
          size="lg"
          onClick={() => navigate("/dashboard")}
          className="rounded-full"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
