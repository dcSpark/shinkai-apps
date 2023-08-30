import React from 'react';

export function useMap<Key, Value>(initialState: [Key, Value][] = []) {
  const mapRef = React.useRef(new Map<Key, Value>(initialState));
  const [, reRender] = React.useReducer((x) => x + 1, 0);

  mapRef.current.set = (...args) => {
    Map.prototype.set.apply(mapRef.current, args);
    reRender();
    return mapRef.current;
  };

  mapRef.current.clear = (...args) => {
    Map.prototype.clear.apply(mapRef.current, args);
    reRender();
  };

  mapRef.current.delete = (...args) => {
    const res = Map.prototype.delete.apply(mapRef.current, args);
    reRender();

    return res;
  };

  return mapRef.current;
}
