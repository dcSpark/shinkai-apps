import type React from 'react';
import { useEffect, useRef } from 'react';

function useCombinedRefs<T>(
  ...refs: React.ForwardedRef<T>[]
): React.RefObject<T | null> {
  const targetRef = useRef<T>(null);
  useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
         
        ref.current = targetRef.current;
      }
    });
  }, [refs]);
  return targetRef;
}

export { useCombinedRefs };
