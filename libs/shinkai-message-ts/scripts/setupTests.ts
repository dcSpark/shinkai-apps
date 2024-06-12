// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import * as matchers from '@testing-library/jest-dom/matchers';

// Mock matchmedia
// @ts-expect-error matchMedia
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
