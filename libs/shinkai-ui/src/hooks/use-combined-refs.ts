import React, { useEffect, useRef } from 'react';

function useCombinedRefs<T>(
  ...refs: React.ForwardedRef<T>[]
): React.MutableRefObject<T | null> {
  const targetRef = useRef<T>(null);
  useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        // eslint-disable-next-line no-param-reassign
        ref.current = targetRef.current;
      }
    });
  }, [refs]);
  return targetRef;
}

export { useCombinedRefs };
