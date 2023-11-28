import * as React from 'react';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import reactCropStyle from 'react-image-crop/dist/ReactCrop.css?inline';
import { IntlProvider } from 'react-intl';

import { blobToBase64 } from '../../helpers/blob-utils';
import { canvasPreview, canvasToBlob } from '../../helpers/canvas-utils';
import { useGlobalImageCaptureChromeMessage } from '../../hooks/use-global-image-capture-message';
import { langMessages, locale } from '../../lang/intl';
import themeStyle from '../../theme/styles.css?inline';

const baseContainer = document.createElement('shinkai-image-capture-root');
const shadow = baseContainer.attachShadow({ mode: 'open' });
const container = document.createElement('div');
container.id = 'root';
shadow.appendChild(container);
const htmlRoot = document.getElementsByTagName('html')[0];
htmlRoot.prepend(baseContainer);

export const ImageCapture = () => {
  const [baseImage, setBaseImage] = useState<string | undefined>(undefined);
  const [crop, setCrop] = useState<Crop>();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const finishCaptureRef = useRef<(image: string) => void>();
  useGlobalImageCaptureChromeMessage({
    capture: ({ image: baseImage, finishCapture }) => {
      setBaseImage(baseImage);
      finishCaptureRef.current = finishCapture;
    },
  });
  const getCroppedImage = async (
    image: HTMLImageElement,
    crop: PixelCrop,
    scale = 1,
    rotate = 0,
  ): Promise<Blob | null> => {
    const canvas = document.createElement('canvas');
    await canvasPreview(image, canvas, crop, scale, rotate);
    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.5);
    if (!blob) {
      console.error('Failed to create blob');
      return null;
    }
    return blob;
  };
  return (
    baseImage && (
      <ReactCrop
        className="h-full w-full"
        crop={crop}
        onChange={(_, percentCrop) => {
          console.log('crop change', _, percentCrop);
          setCrop(percentCrop);
        }}
        onComplete={async (c) => {
          console.log('crop completed', c);
          if (
            typeof finishCaptureRef.current === 'function' &&
            imageRef.current
          ) {
            if (c.width === 0 || c.height === 0) {
              return;
            }
            const croppedImage = await getCroppedImage(
              imageRef.current,
              c,
              1,
              0,
            );
            if (!croppedImage) {
              return;
            }
            const croppedImageAsBase64 = await blobToBase64(croppedImage);
            finishCaptureRef.current(croppedImageAsBase64);
            setBaseImage('');
            setCrop(undefined);
          }
        }}
        style={{ pointerEvents: 'all' }}
      >
        <img
          alt="capture-placeholder"
          className="invisible h-full w-full"
          ref={imageRef}
          src={`${baseImage}`}
        />
      </ReactCrop>
    )
  );
};
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <style>{themeStyle}</style>
    <style>{reactCropStyle}</style>
    <IntlProvider locale={locale} messages={langMessages}>
      <div className="pointer-events-none fixed z-[2000000000] h-full w-full overflow-hidden">
        <ImageCapture />
      </div>
    </IntlProvider>
  </React.StrictMode>,
);
