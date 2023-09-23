import { Spin } from 'antd';

export const SplashScreen = () => {
  return (
    <div className="h-full flex flex-col place-items-center justify-between-center space-y-3">
      <Spin />
      <span>Initializing</span>
    </div>
  );
};
