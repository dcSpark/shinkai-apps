const DotsLoader = ({ className }: { className?: string }) => {
  return (
    <div className={`${className} flex flex-col justify-center`}>
      <div className="flex flex-row items-center justify-center space-x-1">
        <div className="animate-big-bounce h-1 w-1 rounded-full bg-slate-100 [animation-delay:-0.3s]" />
        <div className="animate-big-bounce h-1 w-1 rounded-full bg-slate-100 [animation-delay:-0.6s]" />
        <div className="animate-big-bounce h-1 w-1 rounded-full bg-slate-100 [animation-delay:-0.9s]" />
      </div>
    </div>
  );
};

export default DotsLoader;
