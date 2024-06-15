import '../../theme/styles.css';

import { Player } from '@lottiefiles/react-lottie-player';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

import logo from '../../../src/assets/icons/visor.svg';
import InstalledPopupAnimation from '../../assets/animations/installed-popup.json';
import { srcUrlResolver } from '../../helpers/src-url-resolver';

const InstalledPopup = () => {
  return (
    <div className="flex h-full flex-col justify-start">
      <div className="grid place-content-center">
        <img
          alt="shinkai logo"
          className="animate-spin-slow h-10 w-20"
          data-cy="shinkai-logo"
          src={srcUrlResolver(logo)}
        />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center space-y-3">
        <div className="p-3">
          <Player
            autoplay
            className="w-full"
            loop
            src={InstalledPopupAnimation}
          />
        </div>

        <p className="text-md text-center text-white" data-cy="welcome-message">
          Shinkai Visor was installed successfully, navigate to a website and
          use the action button to start asking Shinkai AI
        </p>
      </div>
    </div>
  );
};
const container = document.getElementById('root');
if (!container) {
  throw new Error('container not found');
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <div className="font-inter h-full w-full overflow-hidden bg-gray-500 p-3 shadow-xl">
      <InstalledPopup />
    </div>
  </React.StrictMode>,
);
