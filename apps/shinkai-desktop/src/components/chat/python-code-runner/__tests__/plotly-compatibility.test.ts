import { describe, expect, it } from 'vitest';

import { preparePlotlyFigure } from '../plotly-compatibility';

describe('saved Python Plotly map figures', () => {
  it('converts legacy map types and numbered maps without changing the input', () => {
    const input = {
      data: [
        { type: 'scattermapbox', lat: [1], lon: [2], marker: { size: 12 } },
        {
          type: 'choroplethmapbox',
          subplot: 'mapbox2',
          locations: ['a'],
          z: [5],
        },
        {
          type: 'densitymapbox',
          subplot: 'mapbox3',
          lat: [1],
          lon: [2],
          z: [3],
        },
      ],
      layout: {
        mapbox: { center: { lat: 1, lon: 2 }, zoom: 5 },
        mapbox2: { style: 'light' },
        mapbox3: { fitbounds: true },
      },
    };
    const original = structuredClone(input);
    const output = preparePlotlyFigure(input);
    expect(output.data).toEqual([
      { ...input.data[0], type: 'scattermap' },
      { ...input.data[1], type: 'choroplethmap', subplot: 'map2' },
      { ...input.data[2], type: 'densitymap', subplot: 'map3' },
    ]);
    expect(output.layout).toEqual({
      map: { center: { lat: 1, lon: 2 }, zoom: 5, fitbounds: false },
      map2: { style: 'light', fitbounds: false },
      map3: { fitbounds: true },
    });
    expect(input).toEqual(original);
  });

  it('converts templates and frames, including partial trace updates', () => {
    const output = preparePlotlyFigure({
      data: [{ type: 'scattermapbox', subplot: 'mapbox2', lat: [1], lon: [2] }],
      layout: {
        template: {
          data: {
            scattermapbox: [{ type: 'scattermapbox', marker: { size: 8 } }],
          },
          layout: { mapbox2: { zoom: 2 } },
        },
      },
      frames: [
        {
          name: 'next',
          data: [{ subplot: 'mapbox2', lat: [3] }],
          layout: { mapbox2: { zoom: 4 } },
          traces: [0],
        },
      ],
    });
    expect(output.layout).toEqual({
      template: {
        data: { scattermap: [{ type: 'scattermap', marker: { size: 8 } }] },
        layout: { map2: { zoom: 2, fitbounds: false } },
      },
    });
    expect(output.frames).toEqual([
      {
        name: 'next',
        data: [{ subplot: 'map2', lat: [3] }],
        layout: { map2: { zoom: 4, fitbounds: false } },
        traces: [0],
      },
    ]);
  });

  it('keeps ordinary charts with inactive Python map templates usable', () => {
    const input = {
      data: [{ type: 'bar', x: ['a'], y: [2] }],
      layout: {
        title: { text: 'mapbox is text' },
        template: {
          layout: {
            mapbox: {
              style: 'mapbox://styles/custom/style',
              accesstoken: 'token',
            },
          },
        },
      },
    };
    expect(preparePlotlyFigure(input).data).toEqual(input.data);
  });

  it('keeps modern defaults when legacy map templates are inactive', () => {
    const output = preparePlotlyFigure({
      data: [{ type: 'bar' }],
      layout: {
        template: {
          data: {
            scattermapbox: [{ marker: { size: 1 } }],
            scattermap: [{ marker: { size: 2 } }],
          },
          layout: { mapbox: { zoom: 1 }, map: { zoom: 2 } },
        },
      },
    });
    expect(output.layout).toEqual({
      template: {
        data: { scattermap: [{ marker: { size: 2 } }] },
        layout: { map: { zoom: 2 } },
      },
    });
  });

  it('converts map button and slider directives without changing labels', () => {
    const output = preparePlotlyFigure({
      data: [{ type: 'scattermapbox' }],
      layout: {
        updatemenus: [
          {
            buttons: [
              {
                label: 'mapbox.zoom',
                method: 'relayout',
                args: [{ 'mapbox.zoom': 4, 'mapbox2.center': { lat: 2 } }],
              },
            ],
          },
        ],
        sliders: [
          {
            steps: [
              {
                method: 'update',
                args: [
                  { type: ['scattermapbox'], subplot: ['mapbox2'] },
                  { 'mapbox2.zoom': 3 },
                ],
              },
            ],
          },
        ],
      },
    });
    expect(output.layout).toEqual({
      updatemenus: [
        {
          buttons: [
            {
              label: 'mapbox.zoom',
              method: 'relayout',
              args: [{ 'map.zoom': 4, 'map2.center': { lat: 2 } }],
            },
          ],
        },
      ],
      sliders: [
        {
          steps: [
            {
              method: 'update',
              args: [
                { type: ['scattermap'], subplot: ['map2'] },
                { 'map2.zoom': 3 },
              ],
            },
          ],
        },
      ],
    });
  });

  it('converts alternate button arguments and string-form trace updates', () => {
    const output = preparePlotlyFigure({
      data: [{ type: 'scattermapbox' }],
      layout: {
        updatemenus: [
          {
            buttons: [
              {
                method: 'restyle',
                args: ['subplot', 'mapbox2'],
                args2: ['subplot', 'mapbox3'],
              },
            ],
          },
        ],
      },
    });
    expect(output.layout).toEqual({
      updatemenus: [
        {
          buttons: [
            {
              method: 'restyle',
              args: ['subplot', 'map2'],
              args2: ['subplot', 'map3'],
            },
          ],
        },
      ],
    });
    expect(() =>
      preparePlotlyFigure({
        data: [{ type: 'scattermapbox' }],
        layout: {
          sliders: [
            {
              steps: [
                {
                  method: 'relayout',
                  args: ['mapbox.style', 'mapbox://styles/private/map'],
                },
              ],
            },
          ],
        },
      }),
    ).toThrow('Mapbox style or access token');
  });

  it.each([
    { style: 'mapbox://styles/custom/style' },
    { style: { sources: { tiles: { url: 'mapbox://tiles' } } } },
    { style: 'light', accesstoken: 'token' },
  ])(
    'reports unsupported Mapbox resources instead of removing them: %j',
    (mapbox) => {
      expect(() =>
        preparePlotlyFigure({
          data: [{ type: 'scattermapbox' }],
          layout: { mapbox },
        }),
      ).toThrow('Mapbox style or access token');
    },
  );

  it('does not overwrite existing modern map settings', () => {
    expect(() =>
      preparePlotlyFigure({ data: [], layout: { mapbox: {}, map: {} } }),
    ).toThrow('both mapbox and map');
    expect(() =>
      preparePlotlyFigure({
        data: [{ type: 'scattermapbox' }, { type: 'scattermap' }],
      }),
    ).toThrow('mixes old and new');
  });
});
