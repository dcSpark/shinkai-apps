import { describe, expect, it } from 'vitest';

import { preparePlotlyFigure } from '../plotly-compatibility';

describe('saved Plotly axis defaults', () => {
  it('keeps overlay ticks independent and preserves explicit tick settings', () => {
    const input = {
      data: [],
      layout: {
        xaxis2: { overlaying: 'x' },
        yaxis2: { overlaying: 'y', side: 'right' },
        yaxis3: { overlaying: 'y', tickmode: 'sync' },
        yaxis4: { overlaying: 'y', tickmode: 'linear', dtick: 5 },
        yaxis5: { overlaying: 'y', tickvals: [1, 4, 9] },
        yaxis6: { overlaying: 'y', dtick: 3 },
        yaxis7: { overlaying: false },
        yaxis8: { title: { text: 'Independent' } },
      },
    };
    const original = structuredClone(input);
    expect(preparePlotlyFigure(input).layout).toEqual({
      ...input.layout,
      xaxis2: { overlaying: 'x', tickmode: 'auto' },
      yaxis2: { overlaying: 'y', side: 'right', tickmode: 'auto' },
    });
    expect(input).toEqual(original);
  });

  it('preserves explicit and inherited overlay tick modes in templates and frames', () => {
    const input = {
      data: [],
      layout: {
        xaxis2: { overlaying: 'x' },
        template: {
          layout: {
            xaxis2: { tickmode: 'sync' },
            yaxis2: { overlaying: 'y' },
          },
        },
      },
      frames: [
        {
          name: 'next',
          layout: {
            xaxis2: { title: { text: 'New title' } },
            yaxis3: { overlaying: 'y' },
          },
        },
      ],
    };
    const original = structuredClone(input);
    const output = preparePlotlyFigure(input);
    expect(output.layout).toEqual({
      xaxis2: { overlaying: 'x' },
      template: {
        layout: {
          xaxis2: { tickmode: 'sync' },
          yaxis2: { overlaying: 'y', tickmode: 'auto' },
        },
      },
    });
    expect(output.frames?.[0].layout).toEqual({
      xaxis2: { title: { text: 'New title' } },
      yaxis3: { overlaying: 'y', tickmode: 'auto' },
    });
    expect(input).toEqual(original);
  });

  it('keeps overlay defaults in string, object, and alternate control updates', () => {
    const input = {
      data: [],
      layout: {
        yaxis3: { tickmode: 'sync' },
        updatemenus: [
          {
            buttons: [
              {
                method: 'relayout',
                args: ['yaxis2.overlaying', 'y'],
                args2: [{ yaxis2: { overlaying: 'y', tickmode: 'sync' } }],
              },
              {
                method: 'update',
                args: [{}, { 'xaxis2.overlaying': 'x', 'xaxis2.dtick': 2 }],
              },
              { method: 'relayout', args: [{ 'yaxis3.overlaying': 'y' }] },
            ],
          },
        ],
        sliders: [
          {
            steps: [
              { method: 'relayout', args: [{ yaxis4: { overlaying: 'y' } }] },
            ],
          },
        ],
      },
    };
    const original = structuredClone(input);
    const output = preparePlotlyFigure(input);
    expect(output.layout?.updatemenus).toEqual([
      {
        buttons: [
          {
            method: 'relayout',
            args: [{ 'yaxis2.overlaying': 'y', 'yaxis2.tickmode': 'auto' }],
            args2: [{ yaxis2: { overlaying: 'y', tickmode: 'sync' } }],
          },
          input.layout.updatemenus[0].buttons[1],
          input.layout.updatemenus[0].buttons[2],
        ],
      },
    ]);
    expect(output.layout?.sliders).toEqual([
      {
        steps: [
          {
            method: 'relayout',
            args: [{ yaxis4: { overlaying: 'y', tickmode: 'auto' } }],
          },
        ],
      },
    ]);
    expect(input).toEqual(original);
  });

  it('keeps splom dimensions independent without changing axis IDs or explicit matches', () => {
    const input = {
      data: [
        {
          type: 'splom',
          xaxes: ['x3', 'x4', 'x5'],
          yaxes: ['y3', 'y4', 'y5'],
          dimensions: [
            { label: 'A', values: [1, 2] },
            {
              label: 'B',
              values: [3, 4],
              axis: { type: 'log', matches: true },
            },
            { label: 'C', values: [5, 6], axis: { matches: false } },
          ],
        },
      ],
    };
    const original = structuredClone(input);
    expect(preparePlotlyFigure(input).data).toEqual([
      {
        ...input.data[0],
        dimensions: [
          { ...input.data[0].dimensions[0], axis: { matches: false } },
          input.data[0].dimensions[1],
          input.data[0].dimensions[2],
        ],
      },
    ]);
    expect(input).toEqual(original);
  });

  it('preserves splom template defaults and partial frame updates by trace index', () => {
    const input = {
      data: [
        { type: 'bar' },
        { type: 'splom', dimensions: [{ values: [1, 2] }, { values: [3, 4] }] },
      ],
      layout: {
        template: {
          data: { splom: [{ dimensions: [{ axis: { matches: true } }, {}] }] },
        },
      },
      frames: [
        {
          name: 'next',
          traces: [1],
          data: [
            { dimensions: [{ axis: { type: 'log' } }, { values: [5, 6] }] },
          ],
        },
      ],
    };
    const original = structuredClone(input);
    const output = preparePlotlyFigure(input);
    expect(output.data[1]).toEqual({
      type: 'splom',
      dimensions: [
        { values: [1, 2], axis: { matches: true } },
        { values: [3, 4], axis: { matches: false } },
      ],
    });
    expect(output.layout?.template).toEqual({
      data: {
        splom: [
          {
            dimensions: [
              { axis: { matches: true } },
              { axis: { matches: false } },
            ],
          },
        ],
      },
    });
    expect(output.frames?.[0].data).toEqual([
      {
        dimensions: [
          { axis: { type: 'log', matches: true } },
          { values: [5, 6], axis: { matches: false } },
        ],
      },
    ]);
    expect(input).toEqual(original);
  });

  it('preserves splom defaults in indexed dimension controls and type changes', () => {
    const input = {
      data: [
        { type: 'parcoords', dimensions: [{ values: [1, 2] }] },
        { type: 'splom', dimensions: [{ values: [3, 4] }] },
      ],
      layout: {
        updatemenus: [
          {
            buttons: [
              { method: 'restyle', args: ['type', 'splom', [0]] },
              {
                method: 'restyle',
                args: [
                  'dimensions',
                  [[{ values: [5, 6] }, { axis: { matches: true } }]],
                  [1],
                ],
              },
              {
                method: 'update',
                args: [{ 'dimensions[0].axis': [{ type: 'log' }] }, {}, [1]],
              },
              {
                method: 'restyle',
                args: [{ dimensions: [[{ values: [7, 8] }]] }, [0]],
              },
            ],
          },
        ],
      },
    };
    const original = structuredClone(input);
    const output = preparePlotlyFigure(input);
    expect(output.data[0]).toEqual(input.data[0]);
    expect(output.layout?.updatemenus).toEqual([
      {
        buttons: [
          {
            method: 'restyle',
            args: [
              {
                type: 'splom',
                dimensions: [[{ values: [1, 2], axis: { matches: false } }]],
              },
              [0],
            ],
          },
          {
            method: 'restyle',
            args: [
              'dimensions',
              [
                [
                  { values: [5, 6], axis: { matches: false } },
                  { axis: { matches: true } },
                ],
              ],
              [1],
            ],
          },
          {
            method: 'update',
            args: [
              { 'dimensions[0].axis': [{ type: 'log', matches: false }] },
              {},
              [1],
            ],
          },
          {
            method: 'restyle',
            args: [
              { dimensions: [[{ values: [7, 8], axis: { matches: false } }]] },
              [0],
            ],
          },
        ],
      },
    ]);
    expect(input).toEqual(original);
  });

  it('keeps independent axes when a frame changes a trace to splom', () => {
    const input = {
      data: [{ type: 'parcoords', dimensions: [{ values: [1, 2] }] }],
      frames: [{ name: 'matrix', data: [{ type: 'splom' }] }],
    };
    const original = structuredClone(input);
    expect(preparePlotlyFigure(input).frames?.[0].data).toEqual([
      {
        type: 'splom',
        dimensions: [{ values: [1, 2], axis: { matches: false } }],
      },
    ]);
    expect(input).toEqual(original);
  });

  it.each([
    { current: false, template: true, expected: true },
    { current: true, template: false, expected: false },
    { current: true, template: undefined, expected: false },
  ])(
    'uses template matches when a control replaces dimensions: %j',
    ({ current, template, expected }) => {
      const input = {
        data: [
          {
            type: 'splom',
            dimensions: [{ values: [1, 2], axis: { matches: current } }],
          },
        ],
        layout: {
          template: {
            data: {
              splom: [{ dimensions: [{ axis: { matches: template } }] }],
            },
          },
          updatemenus: [
            {
              buttons: [
                {
                  method: 'restyle',
                  args: ['dimensions', [[{ values: [3, 4] }]]],
                  args2: [{ 'dimensions[0].axis': [{ type: 'log' }] }],
                },
              ],
            },
          ],
        },
      };
      const original = structuredClone(input);
      const output = preparePlotlyFigure(input);
      expect(output.layout?.updatemenus).toEqual([
        {
          buttons: [
            {
              method: 'restyle',
              args: [
                'dimensions',
                [[{ values: [3, 4], axis: { matches: expected } }]],
              ],
              args2: [
                { 'dimensions[0].axis': [{ type: 'log', matches: expected }] },
              ],
            },
          ],
        },
      ]);
      expect(input).toEqual(original);
    },
  );

  it('retains indexed splom template defaults in template and frame controls', () => {
    const control = {
      method: 'restyle',
      args: [{ 'dimensions[0]': [{ values: [5, 6] }] }, [1]],
    };
    const input = {
      data: [
        {
          type: 'splom',
          dimensions: [{ values: [1, 2], axis: { matches: false } }],
        },
        {
          type: 'splom',
          dimensions: [{ values: [3, 4], axis: { matches: false } }],
        },
      ],
      layout: {
        template: {
          data: {
            splom: [
              { dimensions: [{ axis: { matches: false } }] },
              { dimensions: [{ axis: { matches: true } }] },
            ],
          },
          layout: { updatemenus: [{ buttons: [control] }] },
        },
      },
      frames: [
        { name: 'next', layout: { updatemenus: [{ buttons: [control] }] } },
      ],
    };
    const original = structuredClone(input);
    const output = preparePlotlyFigure(input);
    const expected = [
      {
        buttons: [
          {
            method: 'restyle',
            args: [
              {
                'dimensions[0]': [{ values: [5, 6], axis: { matches: true } }],
              },
              [1],
            ],
          },
        ],
      },
    ];
    expect(output.frames?.[0].layout?.updatemenus).toEqual(expected);
    expect(
      (output.layout?.template as { layout: { updatemenus: unknown } }).layout
        .updatemenus,
    ).toEqual(expected);
    expect(input).toEqual(original);
  });
});

describe('saved Python Plotly colors', () => {
  it('converts sector and mesh color arrays without changing numeric entries', () => {
    const output = preparePlotlyFigure({
      data: [
        { type: 'pie', marker: { colors: ['F00', 'hsv(120, 100%, 100%)'] } },
        {
          type: 'mesh3d',
          facecolor: ['fff'],
          vertexcolor: ['abc', [255, 0, 0, 0.5]],
        },
        { type: 'treemap', marker: { colors: [1, 2, 3] } },
      ],
    });
    expect(output.data).toEqual([
      { type: 'pie', marker: { colors: ['#F00', 'rgb(0, 255, 0)'] } },
      {
        type: 'mesh3d',
        facecolor: ['#fff'],
        vertexcolor: ['#abc', [255, 0, 0, 0.5]],
      },
      { type: 'treemap', marker: { colors: [1, 2, 3] } },
    ]);
  });

  it.each([
    ['hsv(120, 100%, 100%)', 'rgb(0, 255, 0)'],
    ['hsv(240, 100, 100)', 'rgb(0, 0, 255)'],
    ['hsv(0, 1.0, 1.0)', 'rgb(255, 0, 0)'],
    ['hsva(60, 100%, 100%, 0.25)', 'rgba(255, 255, 0, 0.25)'],
    ['F00', '#F00'],
    ['abcd', '#abcd'],
    ['12aBcD', '#12aBcD'],
    ['12345678', '#12345678'],
    ['rgb(0.5, 0.25, 0.75)', 'rgb(128, 64, 191)'],
    ['rgba(0.5, 0.25, 0.75, 0.4)', 'rgba(128, 64, 191, 0.4)'],
    ['rgb(0.5, 1, 0)', 'rgb(0.5, 1, 0)'],
    ['rgb(255, 0, 0)', 'rgb(255, 0, 0)'],
    ['rgb(50%, 25%, 75%)', 'rgb(50%, 25%, 75%)'],
    ['hsl(120, 100%, 50%)', 'hsl(120, 100%, 50%)'],
    ['rebeccapurple', 'rebeccapurple'],
    ['not-a-color', 'not-a-color'],
  ])('preserves the old rendering of %s', (color, expected) => {
    const output = preparePlotlyFigure({
      data: [{ type: 'bar', marker: { color } }],
    });
    expect(output.data[0]).toEqual({
      type: 'bar',
      marker: { color: expected },
    });
  });

  it('changes only schema color fields and preserves numeric data and user content', () => {
    const input = {
      data: [
        {
          type: 'scatter',
          x: ['fff', 'hsv(120, 100%, 100%)'],
          y: [1, 2],
          name: 'F00',
          text: ['rgb(0.5, 0.5, 0.5)'],
          customdata: [{ marker: { color: 'F00' }, color: 'fff' }],
          meta: { font: { color: 'F00' } },
          marker: {
            color: [1, 2, 3],
            line: { color: ['F00', 'rgb(0.5, 0.5, 0.5)'] },
            colorscale: [
              [0, '000'],
              [1, 'hsv(120, 100%, 100%)'],
            ],
          },
        },
      ],
      layout: {
        title: { text: 'fff', font: { color: 'F00' } },
        colorway: ['F00', 'hsv(120, 100%, 100%)'],
        colorscale: {
          sequential: [
            [0, '000'],
            [1, 'fff'],
          ],
        },
        xaxis2: { gridcolor: 'abc' },
        annotations: [{ text: 'F00', font: { color: 'abc' } }],
        meta: { color: 'fff' },
      },
    };
    const original = structuredClone(input);
    const output = preparePlotlyFigure(input);
    expect(output.data[0]).toEqual({
      ...input.data[0],
      marker: {
        color: [1, 2, 3],
        line: { color: ['#F00', 'rgb(128, 128, 128)'] },
        colorscale: [
          [0, '#000'],
          [1, 'rgb(0, 255, 0)'],
        ],
      },
    });
    expect(output.layout).toEqual({
      ...input.layout,
      title: { text: 'fff', font: { color: '#F00' } },
      colorway: ['#F00', 'rgb(0, 255, 0)'],
      colorscale: {
        sequential: [
          [0, '#000'],
          [1, '#fff'],
        ],
      },
      xaxis2: { gridcolor: '#abc' },
      annotations: [{ text: 'F00', font: { color: '#abc' } }],
    });
    expect(input).toEqual(original);
  });

  it('converts colors in templates, frames, and controls while preserving their labels', () => {
    const input = {
      data: [{ type: 'scatter', marker: { color: 'fff' } }],
      layout: {
        template: {
          data: { scatter: [{ marker: { color: 'F00' } }] },
          layout: { font: { color: 'fff' } },
        },
        updatemenus: [
          {
            buttons: [
              {
                label: 'F00',
                method: 'restyle',
                args: ['marker.color', ['F00']],
                args2: [{ 'marker.color': [['fff', '000']] }],
              },
              {
                method: 'update',
                args: [
                  { line: { color: 'abc' } },
                  { 'title.font.color': 'abc' },
                ],
              },
            ],
          },
        ],
        sliders: [
          {
            steps: [
              {
                method: 'relayout',
                args: ['annotations[0].font.color', 'F00'],
              },
            ],
          },
        ],
      },
      frames: [
        {
          name: 'fff',
          data: [{ marker: { color: ['F00'] } }],
          layout: { paper_bgcolor: 'fff' },
        },
      ],
    };
    const original = structuredClone(input);
    const output = preparePlotlyFigure(input);
    expect(output.layout).toEqual({
      template: {
        data: { scatter: [{ marker: { color: '#F00' } }] },
        layout: { font: { color: '#fff' } },
      },
      updatemenus: [
        {
          buttons: [
            {
              label: 'F00',
              method: 'restyle',
              args: ['marker.color', ['#F00']],
              args2: [{ 'marker.color': [['#fff', '#000']] }],
            },
            {
              method: 'update',
              args: [
                { line: { color: '#abc' } },
                { 'title.font.color': '#abc' },
              ],
            },
          ],
        },
      ],
      sliders: [
        {
          steps: [
            { method: 'relayout', args: ['annotations[0].font.color', '#F00'] },
          ],
        },
      ],
    });
    expect(output.frames).toEqual([
      {
        name: 'fff',
        data: [{ marker: { color: ['#F00'] } }],
        layout: { paper_bgcolor: '#fff' },
      },
    ]);
    expect(input).toEqual(original);
  });
});

describe('saved Python Plotly geographic bounds', () => {
  it('keeps world bounds for geographic subplots reached through indexed controls', () => {
    const input = {
      data: [{ type: 'bar' }, { type: 'scatter' }],
      layout: {
        updatemenus: [
          {
            buttons: [
              { method: 'restyle', args: ['type', 'scattergeo', [0]] },
              {
                method: 'update',
                args: [{ type: 'choropleth', geo: 'geo2' }, {}, [1]],
              },
            ],
          },
        ],
      },
    };
    const original = structuredClone(input);
    expect(preparePlotlyFigure(input).layout).toEqual({
      ...input.layout,
      geo: { fitbounds: false },
      geo2: { fitbounds: false },
    });
    expect(input).toEqual(original);
  });

  it('retains explicit geographic bounds in templates and alternate slider actions', () => {
    const input = {
      data: [{ type: 'bar' }],
      layout: {
        template: { layout: { geo2: { fitbounds: 'locations' } } },
        sliders: [
          {
            steps: [
              {
                method: 'restyle',
                args: ['type', 'bar'],
                args2: [{ type: 'scattergeo', geo: 'geo2' }],
              },
            ],
          },
        ],
      },
    };
    expect(preparePlotlyFigure(input).layout).toEqual(input.layout);
  });

  it('keeps the world view for implicit and numbered geographic subplots', () => {
    const input = {
      data: [
        { type: 'scattergeo', lat: [40], lon: [-74] },
        { type: 'choropleth', geo: 'geo2', locations: ['USA'], z: [1] },
      ],
    };
    const original = structuredClone(input);
    expect(preparePlotlyFigure(input).layout).toEqual({
      geo: { fitbounds: false },
      geo2: { fitbounds: false },
    });
    expect(input).toEqual(original);
  });

  it('keeps explicit bounds and view settings in layouts and frames', () => {
    const input = {
      data: [{ type: 'scattergeo' }, { type: 'choropleth', geo: 'geo2' }],
      layout: {
        geo: { fitbounds: 'locations', center: { lat: 20, lon: 30 } },
        geo2: { projection: { scale: 2 }, lonaxis: { range: [-90, 0] } },
      },
      frames: [
        {
          name: 'next',
          layout: {
            geo: { center: { lat: 30, lon: 40 } },
            geo2: { fitbounds: 'geojson' },
          },
        },
      ],
    };
    const original = structuredClone(input);
    const output = preparePlotlyFigure(input);
    expect(output.layout).toEqual({
      geo: input.layout.geo,
      geo2: { ...input.layout.geo2, fitbounds: false },
    });
    expect(output.frames?.[0].layout).toEqual(input.frames[0].layout);
    expect(input).toEqual(original);
  });

  it('preserves template bounds and frame-only geographic subplots', () => {
    const input = {
      data: [{ type: 'scattergeo' }],
      layout: {
        geo: {},
        template: {
          layout: { geo: { fitbounds: 'locations' }, geo2: { bgcolor: 'fff' } },
        },
      },
      frames: [
        {
          name: 'next',
          data: [{ type: 'choropleth', geo: 'geo2' }],
          layout: { geo2: { center: { lat: 10 } } },
        },
      ],
    };
    const original = structuredClone(input);
    const output = preparePlotlyFigure(input);
    expect(output.layout).toEqual({
      geo: {},
      template: {
        layout: {
          geo: { fitbounds: 'locations' },
          geo2: { bgcolor: '#fff', fitbounds: false },
        },
      },
    });
    expect(output.frames?.[0].layout).toEqual(input.frames[0].layout);
    expect(input).toEqual(original);
  });
});

describe('saved Python Plotly map figures', () => {
  it.each(['scattermapbox', 'choroplethmapbox', 'densitymapbox'])(
    'keeps the initial bounds of %s without an explicit map layout',
    (type) => {
      const input = { data: [{ type }, { type, subplot: 'mapbox2' }] };
      const original = structuredClone(input);
      expect(preparePlotlyFigure(input).layout).toEqual({
        map: { fitbounds: false },
        map2: { fitbounds: false },
      });
      expect(input).toEqual(original);
    },
  );

  it('preserves explicit map bounds inherited from templates and frames', () => {
    const input = {
      data: [{ type: 'scattermapbox', subplot: 'mapbox2' }],
      layout: {
        template: {
          layout: {
            mapbox2: { fitbounds: true, center: { lat: 12, lon: 23 } },
          },
        },
      },
      frames: [{ name: 'next', layout: { mapbox2: { zoom: 4 } } }],
    };
    const original = structuredClone(input);
    const output = preparePlotlyFigure(input);
    expect(output.layout).toEqual({
      template: {
        layout: { map2: { fitbounds: true, center: { lat: 12, lon: 23 } } },
      },
    });
    expect(output.frames?.[0].layout).toEqual({ map2: { zoom: 4 } });
    expect(input).toEqual(original);
  });

  it('keeps legacy bounds when controls replace map settings and preserves explicit control values', () => {
    const output = preparePlotlyFigure({
      data: [{ type: 'scattermapbox' }],
      layout: {
        updatemenus: [
          {
            buttons: [
              {
                method: 'relayout',
                args: ['mapbox', { style: 'white-bg' }],
                args2: [{ mapbox: { style: 'white-bg', fitbounds: true } }],
              },
            ],
          },
        ],
      },
    });
    expect(output.layout).toEqual({
      map: { fitbounds: false },
      updatemenus: [
        {
          buttons: [
            {
              method: 'relayout',
              args: ['map', { style: 'white-bg', fitbounds: false }],
              args2: [{ map: { style: 'white-bg', fitbounds: true } }],
            },
          ],
        },
      ],
    });
    expect(
      preparePlotlyFigure({ data: [{ type: 'scattermap' }] }).layout,
    ).toBeUndefined();
  });

  it.each([
    {
      type: 'scattermapbox',
      symbol: 'airport',
      color: ['red', 'blue'],
      expected: 'black',
    },
    {
      type: 'scattermapbox',
      symbol: ['circle', 'airport'],
      color: ['red', 'blue'],
      expected: 'black',
    },
    {
      type: 'scattermapbox',
      symbol: 'circle',
      color: ['red', 'blue'],
      expected: ['red', 'blue'],
    },
    { type: 'scattermap', symbol: 'airport', color: 'red', expected: 'red' },
  ])(
    'preserves legacy icon colors without recoloring circle or modern markers: %j',
    ({ type, symbol, color, expected }) => {
      const input = { data: [{ type, marker: { symbol, color, size: 10 } }] };
      const original = structuredClone(input);
      expect(preparePlotlyFigure(input).data).toEqual([
        { type: 'scattermap', marker: { symbol, color: expected, size: 10 } },
      ]);
      expect(input).toEqual(original);
    },
  );

  it('preserves legacy icon identity in template defaults and partial frame updates', () => {
    const input = {
      data: [
        {
          type: 'scattermapbox',
          marker: { symbol: 'circle', color: ['red', 'blue'] },
        },
      ],
      layout: {
        template: {
          data: {
            scattermapbox: [{ marker: { symbol: 'airport', color: 'red' } }],
          },
        },
      },
      frames: [
        {
          name: 'icon',
          data: [{ marker: { symbol: 'airport', color: 'green' } }],
        },
        {
          name: 'modern',
          data: [
            {
              type: 'scattermap',
              subplot: 'map2',
              marker: { symbol: 'airport', color: 'green' },
            },
          ],
        },
      ],
    };
    const original = structuredClone(input);
    const output = preparePlotlyFigure(input);
    expect(output.data[0]).toEqual({
      type: 'scattermap',
      marker: { symbol: 'circle', color: ['red', 'blue'] },
    });
    expect(output.layout?.template).toEqual({
      data: { scattermap: [{ marker: { symbol: 'airport', color: 'black' } }] },
    });
    expect(output.frames?.[0].data).toEqual([
      { marker: { symbol: 'airport', color: 'black' } },
    ]);
    expect(output.frames?.[1].data).toEqual([
      {
        type: 'scattermap',
        subplot: 'map2',
        marker: { symbol: 'airport', color: 'green' },
      },
    ]);
    expect(input).toEqual(original);
  });

  it('keeps icon changes black in controls and restores colored circle markers', () => {
    const input = {
      data: [
        {
          type: 'scattermapbox',
          marker: { symbol: 'circle', color: ['red', 'blue'] },
        },
        {
          type: 'scattermap',
          subplot: 'map2',
          marker: { symbol: 'airport', color: 'green' },
        },
      ],
      layout: {
        updatemenus: [
          {
            buttons: [
              {
                method: 'restyle',
                args: ['marker.symbol', 'airport', [0]],
                args2: ['marker.symbol', 'circle', [0]],
              },
              {
                method: 'restyle',
                args: [
                  {
                    'marker.symbol': ['airport', 'airport'],
                    'marker.color': ['red', 'green'],
                  },
                  [0, 1],
                ],
              },
            ],
          },
        ],
      },
    };
    const original = structuredClone(input);
    const output = preparePlotlyFigure(input);
    expect(output.layout?.updatemenus).toEqual([
      {
        buttons: [
          {
            method: 'restyle',
            args: [
              { 'marker.symbol': 'airport', 'marker.color': 'black' },
              [0],
            ],
            args2: [
              { 'marker.symbol': 'circle', 'marker.color': [['red', 'blue']] },
              [0],
            ],
          },
          {
            method: 'restyle',
            args: [
              {
                'marker.symbol': ['airport', 'airport'],
                'marker.color': ['black', 'green'],
              },
              [0, 1],
            ],
          },
        ],
      },
    ]);
    expect(input).toEqual(original);
  });

  it.each([
    { method: 'restyle', args: ['type', 'scattermapbox'] },
    { method: 'restyle', args: [{ type: ['scattermapbox'] }] },
    { method: 'update', args: [{ type: 'densitymapbox' }, {}] },
    {
      method: 'restyle',
      args: ['type', 'bar'],
      args2: ['type', 'choroplethmapbox'],
    },
  ])(
    'rejects unsupported styles activated by a chart control: %j',
    (button) => {
      expect(() =>
        preparePlotlyFigure({
          data: [{ type: 'bar' }],
          layout: {
            mapbox: { style: 'mapbox://styles/private/map' },
            updatemenus: [{ buttons: [button] }],
          },
        }),
      ).toThrow('Mapbox style or resource');
    },
  );

  it('checks numbered maps activated through indexed slider updates', () => {
    const input = {
      data: [{ type: 'bar' }, { type: 'scatter' }],
      layout: {
        mapbox2: { style: 'light' },
        // The first trace stays a bar, so this map remains inactive.
        mapbox3: { style: 'mapbox://styles/private/inactive' },
        sliders: [
          {
            steps: [
              {
                label: 'Map',
                method: 'update',
                args: [
                  {
                    type: ['scattermapbox', 'bar'],
                    subplot: ['mapbox2', 'mapbox3'],
                  },
                  {},
                  [1, 0],
                ],
              },
            ],
          },
        ],
      },
    };
    const original = structuredClone(input);
    const output = preparePlotlyFigure(input);
    expect(output.layout?.sliders).toEqual([
      {
        steps: [
          {
            label: 'Map',
            method: 'update',
            args: [
              { type: ['scattermap', 'bar'], subplot: ['map2', 'map3'] },
              {},
              [1, 0],
            ],
          },
        ],
      },
    ]);
    expect(input).toEqual(original);
    expect(() =>
      preparePlotlyFigure({
        ...input,
        layout: {
          ...input.layout,
          mapbox2: { layers: [{ source: ['mapbox://tiles/private'] }] },
        },
      }),
    ).toThrow('Mapbox style or resource');
  });

  it('combines sequential controls on the same trace without mixing different trace indices', () => {
    const figure = (target: number) => ({
      data: [{ type: 'bar' }, { type: 'bar' }],
      layout: {
        mapbox: { style: 'light' },
        mapbox2: { style: 'mapbox://styles/private/map' },
        updatemenus: [
          {
            buttons: [
              { method: 'restyle', args: ['type', 'scattermapbox', [0]] },
              { method: 'restyle', args: [{ subplot: ['mapbox2'] }, [target]] },
            ],
          },
        ],
      },
    });
    // The subplot control only changes a bar on trace 1.
    expect(() => preparePlotlyFigure(figure(1))).not.toThrow();
    // On trace 0, both actions can be used to reach the unsupported map.
    expect(() => preparePlotlyFigure(figure(0))).toThrow(
      'Mapbox style or resource',
    );
  });

  it('validates maps reached through template and frame controls', () => {
    const button = {
      method: 'restyle',
      args: [{ type: 'scattermapbox', subplot: 'mapbox2' }, -1],
    };
    for (const location of ['template', 'frame']) {
      const controls = { updatemenus: [{ buttons: [button] }] };
      const layout = { mapbox2: { style: 'mapbox://styles/private/map' } };
      expect(() =>
        preparePlotlyFigure({
          data: [{ type: 'bar' }, { type: 'scatter' }],
          ...(location === 'template'
            ? { layout: { template: { layout: { ...layout, ...controls } } } }
            : {
                frames: [{ name: 'next', layout: { ...layout, ...controls } }],
              }),
        }),
      ).toThrow('Mapbox style or resource');
    }
  });

  it('uses legacy template defaults when only a control activates their map type', () => {
    const output = preparePlotlyFigure({
      data: [{ type: 'bar' }],
      layout: {
        template: {
          data: {
            scattermapbox: [{ marker: { size: 12 } }],
            scattermap: [{ marker: { size: 4 } }],
          },
          layout: {
            mapbox2: { style: 'stamen-toner' },
            map2: { style: 'dark' },
          },
        },
        updatemenus: [
          {
            buttons: [
              {
                method: 'restyle',
                args: [{ type: 'scattermapbox', subplot: 'mapbox2' }],
              },
            ],
          },
        ],
      },
    });
    expect(output.layout?.template).toEqual({
      data: { scattermap: [{ marker: { size: 12 } }] },
      layout: { map2: { style: 'carto-positron', fitbounds: false } },
    });
  });

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
                args: [{}, { map2: { style: replacement, fitbounds: false } }],
              },
            ],
          },
        ],
        sliders: [
          {
            steps: [
              {
                method: 'relayout',
                args: ['map2', { style: replacement, fitbounds: false }],
              },
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
    const convertedMap = { style: 'light', zoom: 3, fitbounds: false };

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
      map: { fitbounds: false },
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
      map: { fitbounds: false },
      map2: { fitbounds: false },
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
      map: { fitbounds: false },
      map2: { fitbounds: false },
      map3: { fitbounds: false },
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
