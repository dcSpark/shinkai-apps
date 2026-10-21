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

  it.each([
    ['stamen-terrain', 'outdoors'],
    ['stamen-toner', 'carto-positron'],
    ['stamen-watercolor', 'carto-voyager'],
  ])(
    'replaces removed %s tiles with %s without changing the saved chart',
    (style, replacement) => {
      const input = {
        data: [
          { type: 'scattermapbox', subplot: 'mapbox2', lat: [1], lon: [2] },
        ],
        layout: {
          mapbox2: { style, zoom: 3 },
          template: { layout: { mapbox2: { style } } },
          updatemenus: [
            {
              buttons: [
                {
                  method: 'relayout',
                  args: [{ 'mapbox2.style': style }],
                  args2: ['mapbox2.style', style],
                },
                { method: 'update', args: [{}, { mapbox2: { style } }] },
              ],
            },
          ],
          sliders: [
            { steps: [{ method: 'relayout', args: ['mapbox2', { style }] }] },
          ],
        },
        frames: [{ name: 'next', layout: { mapbox2: { style, zoom: 5 } } }],
      };
      const original = structuredClone(input);
      const output = preparePlotlyFigure(input);

      expect(output.layout).toEqual({
        map2: { style: replacement, zoom: 3, fitbounds: false },
        template: {
          layout: { map2: { style: replacement, fitbounds: false } },
        },
        updatemenus: [
          {
            buttons: [
              {
                method: 'relayout',
                args: [{ 'map2.style': replacement }],
                args2: ['map2.style', replacement],
              },
              {
                method: 'update',
                args: [{}, { map2: { style: replacement } }],
              },
            ],
          },
        ],
        sliders: [
          {
            steps: [
              { method: 'relayout', args: ['map2', { style: replacement }] },
            ],
          },
        ],
      });
      expect(output.frames?.[0].layout).toEqual({
        map2: { style: replacement, zoom: 5, fitbounds: false },
      });
      expect(input).toEqual(original);
    },
  );

  it.each([
    'light',
    'open-street-map',
    'https://example.com/map-style.json',
    { version: 8, sources: {}, layers: [] },
  ])(
    'removes obsolete tokens and keeps supported styles unchanged: %j',
    (style) => {
      expect(
        preparePlotlyFigure({
          data: [{ type: 'scattermapbox' }],
          layout: { mapbox: { style, accesstoken: 'obsolete-token' } },
        }).layout,
      ).toEqual({ map: { style, fitbounds: false } });
    },
  );

  it('removes obsolete map tokens from templates, frames, and map controls', () => {
    const map = { style: 'light', accesstoken: 'obsolete-token', zoom: 3 };
    const input = {
      data: [{ type: 'scattermapbox', subplot: 'mapbox2', lat: [1], lon: [2] }],
      layout: {
        mapbox2: map,
        template: { layout: { mapbox2: map } },
        updatemenus: [
          {
            buttons: [
              {
                method: 'relayout',
                args: [
                  {
                    'mapbox2.accesstoken': 'obsolete-token',
                    'mapbox2.zoom': 4,
                  },
                ],
                args2: ['mapbox2.accesstoken', 'obsolete-token'],
              },
              { method: 'update', args: [{}, { mapbox2: map }] },
            ],
          },
        ],
        sliders: [{ steps: [{ method: 'relayout', args: ['mapbox2', map] }] }],
      },
      frames: [{ name: 'next', layout: { mapbox2: map } }],
    };
    const original = structuredClone(input);
    const output = preparePlotlyFigure(input);
    const convertedMap = { style: 'light', zoom: 3 };

    expect(output.layout).toEqual({
      map2: { ...convertedMap, fitbounds: false },
      template: { layout: { map2: { ...convertedMap, fitbounds: false } } },
      updatemenus: [
        {
          buttons: [
            { method: 'relayout', args: [{ 'map2.zoom': 4 }], args2: [{}] },
            { method: 'update', args: [{}, { map2: convertedMap }] },
          ],
        },
      ],
      sliders: [
        { steps: [{ method: 'relayout', args: ['map2', convertedMap] }] },
      ],
    });
    expect(output.frames?.[0].layout).toEqual({
      map2: { ...convertedMap, fitbounds: false },
    });
    expect(input).toEqual(original);
  });

  it('converts map modebar buttons in layouts, templates, frames, and controls', () => {
    const modebar = {
      add: ['zoomInMapbox', 'zoomOutMapbox', 'resetViewMapbox', 'toImage'],
      remove: ['resetViewMapbox', 'zoomOutMapbox', 'zoomInMapbox', 'zoom2d'],
      orientation: 'v',
    };
    const input = {
      data: [{ type: 'scattermapbox', lat: [1], lon: [2] }],
      layout: {
        modebar,
        template: { layout: { modebar } },
        updatemenus: [
          {
            buttons: [
              {
                method: 'relayout',
                args: ['modebar.add', modebar.add],
                args2: ['modebar.remove', modebar.remove],
              },
              { method: 'update', args: [{}, { modebar }] },
            ],
          },
        ],
      },
      frames: [{ name: 'next', layout: { modebar } }],
    };
    const original = structuredClone(input);
    const output = preparePlotlyFigure(input);
    const convertedModebar = {
      add: ['zoomInMap', 'zoomOutMap', 'resetViewMap', 'toImage'],
      remove: ['resetViewMap', 'zoomOutMap', 'zoomInMap', 'zoom2d'],
      orientation: 'v',
    };

    expect(output.layout).toEqual({
      modebar: convertedModebar,
      template: { layout: { modebar: convertedModebar } },
      updatemenus: [
        {
          buttons: [
            {
              method: 'relayout',
              args: ['modebar.add', convertedModebar.add],
              args2: ['modebar.remove', convertedModebar.remove],
            },
            { method: 'update', args: [{}, { modebar: convertedModebar }] },
          ],
        },
      ],
    });
    expect(output.frames?.[0].layout).toEqual({ modebar: convertedModebar });
    expect(input).toEqual(original);
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
          layout: {
            mapbox: { zoom: 1, style: 'stamen-terrain' },
            map: { zoom: 2, style: 'light' },
          },
        },
      },
    });
    expect(output.layout).toEqual({
      template: {
        data: { scattermap: [{ marker: { size: 2 } }] },
        layout: { map: { zoom: 2, style: 'light' } },
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
    ).toThrow('Mapbox style or resource');
  });

  it.each([
    { style: 'mapbox://styles/custom/style' },
    { style: { sources: { tiles: { url: 'mapbox://tiles' } } } },
    { style: 'light', layers: [{ source: ['mapbox://tiles'] }] },
  ])(
    'reports unsupported Mapbox resources instead of removing them: %j',
    (mapbox) => {
      expect(() =>
        preparePlotlyFigure({
          data: [{ type: 'scattermapbox' }],
          layout: { mapbox: { ...mapbox, accesstoken: 'obsolete-token' } },
        }),
      ).toThrow('Mapbox style or resource');
    },
  );

  it.each(['template', 'frame'])(
    'keeps errors for unsupported Mapbox layers in a %s after token removal',
    (location) => {
      const layout = {
        mapbox: {
          style: 'light',
          accesstoken: 'obsolete-token',
          layers: [{ source: ['mapbox://tiles'] }],
        },
      };
      expect(() =>
        preparePlotlyFigure({
          data: [{ type: 'scattermapbox' }],
          ...(location === 'template'
            ? { layout: { template: { layout } } }
            : { frames: [{ name: 'next', layout }] }),
        }),
      ).toThrow('Mapbox style or resource');
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
