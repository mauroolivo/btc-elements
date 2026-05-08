type MempoolStatCardProps = {
  label: string;
  value: string;
  hint: string;
};

export function MempoolStatCard({ label, value, hint }: MempoolStatCardProps) {
  return (
    <div className="core-panel rounded-2xl p-4">
      <div className="text-[11px] tracking-wide text-gray-500 uppercase">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-gray-400">{hint}</div>
    </div>
  );
}
