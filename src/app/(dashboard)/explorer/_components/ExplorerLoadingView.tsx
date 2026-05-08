type ExplorerLoadingViewProps = {
  title: string;
  description: string;
};

export function ExplorerLoadingView({
  title,
  description,
}: ExplorerLoadingViewProps) {
  return (
    <div className="core-surface rounded-3xl p-8">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-300 border-r-cyan-500" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm text-gray-400">{description}</p>
        </div>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 pt-4 md:grid-cols-3">
          <div className="core-panel rounded-2xl p-4">
            <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-7 w-28 animate-pulse rounded bg-white/8" />
          </div>
          <div className="core-panel rounded-2xl p-4">
            <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-7 w-20 animate-pulse rounded bg-white/8" />
          </div>
          <div className="core-panel rounded-2xl p-4">
            <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-7 w-24 animate-pulse rounded bg-white/8" />
          </div>
        </div>
      </div>
    </div>
  );
}
