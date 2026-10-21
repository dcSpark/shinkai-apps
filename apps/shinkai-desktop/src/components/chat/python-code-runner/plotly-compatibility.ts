import { type Data, type Frame, type Layout } from 'plotly.js';

import { normalizePlotlyColors } from './plotly-color-compatibility';

type JsonObject = Record<string, unknown>;

export interface PlotlyFigure {
  data: Data[];
  layout?: Partial<Layout>;
  frames?: Frame[];
}

const legacyMapTypes: Record<string, string> = {
  scattermapbox: 'scattermap',
  choroplethmapbox: 'choroplethmap',
  densitymapbox: 'densitymap',
};

// Plotly 4 removed the Stamen aliases. These substitutes need no provider token;
// they keep saved maps usable, but do not reproduce the original Stamen artwork.
// https://plotly.com/javascript/maplibre-migration/
const legacyMapStyles: Record<string, string> = {
  'stamen-terrain': 'outdoors',
  'stamen-toner': 'carto-positron',
  'stamen-watercolor': 'carto-voyager',
};

const legacyMapButtons: Record<string, string> = {
  zoomInMapbox: 'zoomInMap',
  zoomOutMapbox: 'zoomOutMap',
  resetViewMapbox: 'resetViewMap',
};

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasMapboxResource(value: unknown): boolean {
  if (typeof value === 'string') return value.startsWith('mapbox://');
  if (Array.isArray(value)) return value.some(hasMapboxResource);
  return isObject(value) && Object.values(value).some(hasMapboxResource);
}

function hasOwn(value: JsonObject, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function assertMapStyleSupported(value: unknown): void {
  if (hasMapboxResource(value)) {
    throw new Error(
      'This figure uses an unsupported Mapbox style or resource. Use a MapLibre style or an HTTPS map style URL without mapbox:// resources.',
    );
  }
}

function mapTraceType(type: string): string {
  return hasOwn(legacyMapTypes, type) ? legacyMapTypes[type] : type;
}

function convertMapStyle(value: unknown): unknown {
  return typeof value === 'string' && hasOwn(legacyMapStyles, value)
    ? legacyMapStyles[value]
    : value;
}

function convertMapSettings(value: unknown): unknown {
  if (!isObject(value)) return value;
  const map = { ...value };
  // Plotly 4 removed this field; its presence does not require Mapbox tiles.
  delete map.accesstoken;
  if (hasOwn(map, 'style')) map.style = convertMapStyle(map.style);
  return map;
}

function convertModebarButtons(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(convertModebarButtons);
  return typeof value === 'string' && hasOwn(legacyMapButtons, value)
    ? legacyMapButtons[value]
    : value;
}

function convertModebar(value: unknown): unknown {
  if (!isObject(value)) return value;
  const modebar = { ...value };
  for (const key of ['add', 'remove']) {
    if (hasOwn(modebar, key))
      modebar[key] = convertModebarButtons(modebar[key]);
  }
  return modebar;
}

function convertTrace(value: unknown): unknown {
  if (!isObject(value)) return value;
  const trace = normalizePlotlyColors(value, false) as JsonObject;
  if (typeof trace.type === 'string') {
    trace.type = mapTraceType(trace.type);
  }
  if (typeof trace.subplot === 'string') {
    trace.subplot = trace.subplot.replace(/^mapbox(\d*)$/, 'map$1');
  }
  return trace;
}

function convertAction(value: unknown): unknown {
  if (!isObject(value)) return value;
  const method = value.method;
  if (method !== 'relayout' && method !== 'restyle' && method !== 'update')
    return value;
  const layoutKey = (key: string) =>
    key.replace(/^mapbox(\d*)(\.|$)/, 'map$1$2');
  const traceValue = (key: string, value: unknown): unknown => {
    const convert = (entry: unknown) => {
      if (typeof entry !== 'string') return entry;
      if (key === 'type') return mapTraceType(entry);
      if (key === 'subplot') return entry.replace(/^mapbox(\d*)$/, 'map$1');
      return entry;
    };
    return normalizePlotlyColors(
      Array.isArray(value) ? value.map(convert) : convert(value),
      false,
      key,
    );
  };
  const convertUpdate = (update: unknown, layout: boolean): unknown => {
    if (!isObject(update)) return update;
    return Object.fromEntries(
      Object.entries(update).flatMap(([key, item]) => {
        if (layout && /^mapbox\d*\.accesstoken$/.test(key)) return [];
        let converted = item;
        if (layout && /^mapbox\d*(\.|$)/.test(key)) {
          if (/^mapbox\d*\.style$/.test(key)) {
            converted = convertMapStyle(item);
          } else if (/^mapbox\d*$/.test(key)) {
            converted = convertMapSettings(item);
          }
          assertMapStyleSupported(converted);
        } else if (layout && key === 'modebar') {
          converted = convertModebar(item);
        } else if (layout && /^modebar\.(add|remove)$/.test(key)) {
          converted = convertModebarButtons(item);
        }
        return [
          [
            layout ? layoutKey(key) : key,
            layout
              ? normalizePlotlyColors(converted, true, layoutKey(key))
              : traceValue(key, item),
          ],
        ];
      }),
    );
  };
  const convertArgs = (args: unknown): unknown => {
    if (!Array.isArray(args)) return args;
    if (
      typeof args[0] === 'string' &&
      (method === 'relayout' || method === 'restyle')
    ) {
      const key = args[0];
      if (method === 'relayout') {
        const update = convertUpdate({ [key]: args[1] }, true) as JsonObject;
        // A control that only sets the removed token becomes a no-op relayout.
        if (!hasOwn(update, layoutKey(key))) return [update];
        const converted = [...args];
        converted[0] = layoutKey(key);
        if (args.length > 1) converted[1] = update[layoutKey(key)];
        return converted;
      }
      return [key, traceValue(key, args[1]), ...args.slice(2)];
    }
    return args.map((arg, index) => {
      if (method === 'relayout' && index === 0) return convertUpdate(arg, true);
      if ((method === 'restyle' || method === 'update') && index === 0)
        return convertUpdate(arg, false);
      if (method === 'update' && index === 1) return convertUpdate(arg, true);
      return arg;
    });
  };
  return {
    ...value,
    args: convertArgs(value.args),
    ...(value.args2 ? { args2: convertArgs(value.args2) } : {}),
  };
}

function convertLayout(
  value: unknown,
  activeMaps: Set<string>,
  activeTypes: Set<string>,
  isTemplate = false,
): unknown {
  if (!isObject(value)) return value;
  const layout = normalizePlotlyColors(value, true) as JsonObject;
  if (hasOwn(layout, 'modebar'))
    layout.modebar = convertModebar(layout.modebar);
  for (const [collection, actions] of [
    ['updatemenus', 'buttons'],
    ['sliders', 'steps'],
  ]) {
    if (Array.isArray(layout[collection])) {
      layout[collection] = (layout[collection] as unknown[]).map((group) =>
        isObject(group) && Array.isArray(group[actions])
          ? { ...group, [actions]: group[actions].map(convertAction) }
          : group,
      );
    }
  }
  for (const [key, map] of Object.entries(value)) {
    if (!/^mapbox\d*$/.test(key)) continue;
    const target = key.replace(/^mapbox/, 'map');
    if (hasOwn(layout, target) && isTemplate && !activeMaps.has(key)) {
      delete layout[key];
      continue;
    }
    if (hasOwn(layout, target) && !isTemplate) {
      throw new Error(
        `This figure has both ${key} and ${target} settings. Use one map layout.`,
      );
    }
    if (isObject(map)) {
      const settings = normalizePlotlyColors(
        convertMapSettings(map),
        true,
        target,
      ) as JsonObject;
      if (activeMaps.has(key)) assertMapStyleSupported(settings);
      // Plotly 4 fits map bounds by default. Keep the previous initial view.
      layout[target] = {
        ...settings,
        fitbounds: map.fitbounds ?? false,
      };
    } else {
      layout[target] = map;
    }
    delete layout[key];
  }
  if (isObject(layout.template)) {
    const template = { ...layout.template };
    if (isObject(template.data)) {
      const data = new Map<string, unknown>();
      // Modern defaults are retained unless an active legacy trace needs its old defaults.
      for (const [key, traces] of Object.entries(template.data)) {
        if (mapTraceType(key) === key)
          data.set(
            key,
            Array.isArray(traces) ? traces.map(convertTrace) : traces,
          );
      }
      for (const [key, traces] of Object.entries(template.data)) {
        const target = mapTraceType(key);
        if (target === key || (data.has(target) && !activeTypes.has(key)))
          continue;
        data.set(
          target,
          Array.isArray(traces) ? traces.map(convertTrace) : traces,
        );
      }
      template.data = Object.fromEntries(data);
    }
    template.layout = convertLayout(
      template.layout,
      activeMaps,
      activeTypes,
      true,
    );
    layout.template = template;
  }
  return layout;
}

function preserveGeoBounds(
  value: unknown,
  activeGeos: Set<string>,
  inheritedLayout?: unknown,
  addMissing = false,
): unknown {
  if (!isObject(value) && !addMissing) return value;
  if (!isObject(value) && activeGeos.size === 0) return value;
  const layout: JsonObject = isObject(value) ? { ...value } : {};
  if (isObject(layout.template)) {
    layout.template = {
      ...layout.template,
      layout: preserveGeoBounds(layout.template.layout, activeGeos),
    };
  }
  const hasBounds = (candidate: unknown, key: string): boolean => {
    if (!isObject(candidate)) return false;
    const geo = candidate[key];
    return isObject(geo) && geo.fitbounds != null;
  };
  const templateLayout = isObject(layout.template)
    ? layout.template.layout
    : undefined;
  const inheritedTemplate =
    isObject(inheritedLayout) && isObject(inheritedLayout.template)
      ? inheritedLayout.template.layout
      : undefined;
  const keys = new Set([
    ...Object.keys(layout).filter((key) => /^geo\d*$/.test(key)),
    ...(addMissing ? activeGeos : []),
  ]);
  for (const key of keys) {
    if (
      hasBounds(layout, key) ||
      hasBounds(templateLayout, key) ||
      hasBounds(inheritedLayout, key) ||
      hasBounds(inheritedTemplate, key)
    )
      continue;
    if (layout[key] !== undefined && !isObject(layout[key])) continue;
    // Plotly 3 kept the world view; Plotly 4 defaults to fitting locations.
    layout[key] = {
      ...(layout[key] as JsonObject | undefined),
      fitbounds: false,
    };
  }
  return layout;
}

/** Keep saved Python Plotly 3 figures usable with the patched Plotly 4 renderer. */
export function preparePlotlyFigure(value: unknown): PlotlyFigure {
  if (!isObject(value) || !Array.isArray(value.data)) {
    throw new Error('This chart does not contain Plotly data.');
  }
  const activeMaps = new Set<string>();
  const modernMaps = new Set<string>();
  const activeTypes = new Set<string>();
  const modernTypes = new Set<string>();
  const activeGeos = new Set<string>();
  const frameTraces = Array.isArray(value.frames)
    ? value.frames.flatMap((frame) =>
        isObject(frame) && Array.isArray(frame.data) ? frame.data : [],
      )
    : [];
  for (const trace of [...value.data, ...frameTraces]) {
    if (!isObject(trace)) continue;
    const type = typeof trace.type === 'string' ? trace.type : '';
    const subplot = typeof trace.subplot === 'string' ? trace.subplot : '';
    if (
      type === 'scattergeo' ||
      type === 'choropleth' ||
      typeof trace.geo === 'string'
    ) {
      activeGeos.add(
        typeof trace.geo === 'string' && /^geo\d*$/.test(trace.geo)
          ? trace.geo
          : 'geo',
      );
    }
    if (hasOwn(legacyMapTypes, type)) {
      activeTypes.add(type);
      activeMaps.add(/^mapbox\d*$/.test(subplot) ? subplot : 'mapbox');
    } else if (/^mapbox\d*$/.test(subplot)) {
      activeMaps.add(subplot);
    } else if (Object.values(legacyMapTypes).includes(type)) {
      modernTypes.add(type);
      modernMaps.add(/^map\d*$/.test(subplot) ? subplot : 'map');
    }
  }
  for (const subplot of activeMaps) {
    if (modernMaps.has(subplot.replace(/^mapbox/, 'map'))) {
      throw new Error(
        'This figure mixes old and new map traces on the same map. Use separate map subplots.',
      );
    }
  }
  const templateData =
    isObject(value.layout) &&
    isObject(value.layout.template) &&
    isObject(value.layout.template.data)
      ? value.layout.template.data
      : {};
  for (const type of activeTypes) {
    const modernType = mapTraceType(type);
    if (
      modernTypes.has(modernType) &&
      hasOwn(templateData, type) &&
      hasOwn(templateData, modernType) &&
      JSON.stringify(templateData[type]) !==
        JSON.stringify(templateData[modernType])
    ) {
      throw new Error(
        'This figure has different old and new map defaults. Use one map trace type in the template.',
      );
    }
  }
  const layout = preserveGeoBounds(
    convertLayout(value.layout, activeMaps, activeTypes),
    activeGeos,
    undefined,
    true,
  );
  const figure = {
    ...value,
    data: value.data.map(convertTrace),
    layout,
    frames: Array.isArray(value.frames)
      ? value.frames.map((frame) =>
          isObject(frame)
            ? {
                ...frame,
                data: Array.isArray(frame.data)
                  ? frame.data.map(convertTrace)
                  : frame.data,
                layout: preserveGeoBounds(
                  convertLayout(frame.layout, activeMaps, activeTypes),
                  activeGeos,
                  layout,
                ),
              }
            : frame,
        )
      : value.frames,
  };
  return figure as unknown as PlotlyFigure;
}
