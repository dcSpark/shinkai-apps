import React from 'react';
import { useLocation } from 'react-router';

export const useURLQueryParams = () => {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
};
