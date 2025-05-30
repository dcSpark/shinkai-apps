import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

// Mock matchmedia
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {
        console.log('method in mock, doing nothing...');
      },
      removeListener: function () {
        console.log('method in mock, doing nothing...');
      },
    };
  };

expect.extend(matchers);
