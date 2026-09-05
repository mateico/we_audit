import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  const variants: Record<string, string> = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
    ghost:
      "bg-transparent border border-border text-foreground hover:bg-black/5",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "bad" | "warn";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-black/5 text-foreground",
    good: "bg-green-100 text-green-700",
    bad: "bg-red-100 text-red-700",
    warn: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 shadow-sm ${className}`}
      {...props}
    />
  );
}

function bandaScore(score: number) {
  if (score >= 75) return { color: "var(--score-good)", etiqueta: "Muy bueno" };
  if (score >= 50) return { color: "var(--score-mid)", etiqueta: "Regular" };
  return { color: "var(--score-bad)", etiqueta: "Bajo" };
}

export function ScoreGauge({
  score,
  size = 88,
}: {
  score: number;
  size?: number;
}) {
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  const { color, etiqueta } = bandaScore(score);

  const anguloGrados = 180 * (1 - Math.min(Math.max(score, 0), 100) / 100);
  const anguloRad = (anguloGrados * Math.PI) / 180;
  const endX = cx + r * Math.cos(anguloRad);
  const endY = cy - r * Math.sin(anguloRad);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size / 2 + 12}
        viewBox={`0 0 ${size} ${size / 2 + 12}`}
      >
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--border)"
          strokeWidth={8}
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${endX} ${endY}`}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-lg font-bold" style={{ color }}>
        {score}
      </span>
      <span className="text-xs text-muted">{etiqueta}</span>
    </div>
  );
}
