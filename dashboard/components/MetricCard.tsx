interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
}

export default function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-white px-5 py-5">
      <p className="text-sm font-medium text-ink-secondary">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink-primary">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs text-ink-secondary">{hint}</p>
      )}
    </div>
  );
}
