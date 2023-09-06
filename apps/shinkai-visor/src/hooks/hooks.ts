import { RefObject, useEffect } from 'react';

type AnyEvent = MouseEvent | TouchEvent;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  refs: RefObject<T>[],
  handler: (event: AnyEvent) => void
) {
  useEffect(() => {
    const listener = (event: AnyEvent) => {
      const els = refs.map(ref => ref?.current);

      // Do nothing if clicking refs's element or descendent elements
      for (let el of els) {
        if (!el || el.contains(event.target as Node)) {
          return;
        }
      }

      handler(event);
    };

    document.addEventListener(`mousedown`, listener);
    document.addEventListener(`touchstart`, listener);

    return () => {
      document.removeEventListener(`mousedown`, listener);
      document.removeEventListener(`touchstart`, listener);
    };

    // Reload only if ref or handler changes
  }, [refs, handler]);
}

export default useOnClickOutside;
