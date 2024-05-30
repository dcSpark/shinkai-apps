import { Loader2 } from 'lucide-react';

export const SplashScreen = () => {
  return (
    <div className="h-full flex flex-col place-items-center justify-center space-y-3">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Initializing</span>
    </div>
  );
};
