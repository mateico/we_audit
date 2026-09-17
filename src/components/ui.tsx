import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export function Container({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 ${className}`}
      {...props}
    />
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  const variants: Record<string, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline:
      "border border-border bg-card text-foreground hover:bg-surface-muted",
    ghost: "bg-transparent text-foreground hover:bg-surface-muted",
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
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "bad" | "warn";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-surface-muted text-muted",
    good: "bg-success-bg text-success",
    bad: "bg-danger-bg text-danger",
    warn: "bg-warning-bg text-warning",
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
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
      className={`rounded-lg border border-border bg-card p-4 sm:p-5 ${className}`}
      {...props}
    />
  );
}

function bandaScore(score: number) {
  if (score >= 75)
    return { color: "var(--success)", etiqueta: "Muy bueno" };
  if (score >= 50) return { color: "var(--warning)", etiqueta: "Regular" };
  return { color: "var(--danger)", etiqueta: "Bajo" };
}

export function ScoreGauge({
  score,
  size = 96,
}: {
  score: number;
  size?: number;
}) {
  const r = size / 2 - 9;
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
      <span className="text-xl font-bold" style={{ color }}>
        {score}
      </span>
      <span className="text-xs font-medium text-muted">{etiqueta}</span>
    </div>
  );
}
