import { describe, expect, it } from 'vitest';

import { normalizePlotlyColors } from '../plotly-color-compatibility';

// Expected values checked against TinyColor 1.6.0 inputToRGB/toRgbString.
describe('Plotly 3 HSV color compatibility', () => {
  it.each([
    ['hsv(120,1,1)', 'rgb(0, 255, 0)'],
    ['hsv(120,.5,.5)', 'rgb(64, 128, 64)'],
    ['hsv(120,0.333,0.5)', 'rgb(85, 128, 85)'],
    ['hsv(120,50%,50%)', 'rgb(64, 128, 64)'],
    ['hsv(120,50%,.5)', 'rgb(64, 128, 64)'],
    ['hsv(120,.5,50%)', 'rgb(64, 128, 64)'],
    ['hsv(120,50,50)', 'rgb(64, 128, 64)'],
    ['hsv(120,1%,1)', 'rgb(252, 255, 252)'],
    ['hsv(120,1.0%,1)', 'rgb(0, 255, 0)'],
    ['hsv(1,1,1)', 'rgb(255, 4, 0)'],
    ['hsv(1.0,1,1)', 'rgb(255, 0, 0)'],
    ['hsv(0.5,1,1)', 'rgb(255, 2, 0)'],
    ['hsv(50%,1,1)', 'rgb(0, 255, 255)'],
    ['hsv(360,1,1)', 'rgb(255, 0, 0)'],
    ['hsv(720,1,1)', 'rgb(255, 0, 0)'],
    ['hsv(-60,1,1)', 'rgb(255, 0, 0)'],
    ['hsva(120,1,1,.5)', 'rgba(0, 255, 0, 0.5)'],
  ])('matches legacy %s', (input, expected) => {
    expect(normalizePlotlyColors({ marker: { color: input } }, false)).toEqual({
      marker: { color: expected },
    });
  });

  it('keeps unrelated values and input objects unchanged', () => {
    const input = {
      marker: {
        color: ['red', '#123456', 'rgb(12, 34, 56)', 'hsl(120,50%,50%)'],
      },
      text: 'hsv(120,1,1)',
      customdata: ['hsv(120,1,1)'],
    };
    const saved = structuredClone(input);
    expect(normalizePlotlyColors(input, false)).toEqual(input);
    expect(input).toEqual(saved);
    const colorInput = { marker: { color: 'hsv(120,1,1)' } };
    normalizePlotlyColors(colorInput, false);
    expect(colorInput.marker.color).toBe('hsv(120,1,1)');
  });
});
