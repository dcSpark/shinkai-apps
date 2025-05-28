import React from 'react';

export const useScrollRestoration = ({
  key,
  containerRef,
  scrollTopStateRef,
}: {
  key: string;
  containerRef: React.RefObject<HTMLElement | null>;
  scrollTopStateRef: React.RefObject<{ [key: string]: number } | null>;
}): void => {
  const saveScroll = React.useCallback(() => {
    if (scrollTopStateRef.current) {
      scrollTopStateRef.current[`${key}-scrollTop`] =
        containerRef?.current?.scrollTop ?? 0;
    }
  }, [containerRef, scrollTopStateRef, key]);

  const restoreScroll = React.useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: scrollTopStateRef?.current?.[`${key}-scrollTop`] ?? 0,
      });
    }
  }, [containerRef, key, scrollTopStateRef]);

  React.useLayoutEffect(() => {
    return () => {
      saveScroll();
    };
  }, [saveScroll]);

  React.useEffect(() => {
    // Small delay to ensure content is rendered
    const timeoutId = setTimeout(restoreScroll, 100);
    return () => clearTimeout(timeoutId);
  }, [restoreScroll]);

  React.useEffect(() => {
    restoreScroll();
  }, [restoreScroll]);

  React.useEffect(() => {
    const element = containerRef?.current;
    element?.addEventListener('scroll', saveScroll);
    return () => {
      element?.removeEventListener('scroll', saveScroll);
    };
  }, [containerRef, saveScroll]);
};
