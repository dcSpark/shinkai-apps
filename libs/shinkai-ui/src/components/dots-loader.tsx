const DotsLoader = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <div className="flex h-4 space-x-1.5">
        <div className="h-2 w-2 animate-[loaderDots_0.6s_0s_infinite_alternate] rounded-full bg-slate-100" />
        <div className="h-2 w-2 animate-[loaderDots_0.6s_0.3s_infinite_alternate] rounded-full bg-slate-100" />
        <div className="h-2 w-2 animate-[loaderDots_0.6s_0.6s_infinite_alternate] rounded-full bg-slate-100" />
      </div>
    </div>
  );
};

export { DotsLoader };
