import { useEffect, useRef, useState } from 'react';

export const useReverseVideoPlayback = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isReversing, setIsReversing] = useState(false);
  const playReverse = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const reversePlayback = () => {
      if (video.currentTime <= 0) {
        setIsReversing(false);
        void video.play();
        return;
      }
      video.currentTime -= 0.023;
      requestAnimationFrame(reversePlayback);
    };
    reversePlayback();
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const handleVideoEnd = () => {
        if (isReversing) {
          setIsReversing(false);
          videoElement.currentTime = 0;
          void videoElement.play();
        } else {
          setIsReversing(true);
          playReverse();
        }
      };

      videoElement.addEventListener('ended', handleVideoEnd);
      return () => {
        videoElement.removeEventListener('ended', handleVideoEnd);
      };
    }
  }, [isReversing]);
  return videoRef;
};
