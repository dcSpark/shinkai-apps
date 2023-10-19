const DotsLoader = ({ className }: { className?: string }) => {
  return (
    <div className={`${className} flex flex-col justify-center`}>
      <div className="flex flex-row space-x-1 items-center justify-center">
        <div className="h-1 w-1 rounded-full bg-slate-100 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-1 w-1 rounded-full bg-slate-100 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-1 w-1 rounded-full bg-slate-100 animate-bounce"></div>
      </div>
    </div>
  );
};

export default DotsLoader;
