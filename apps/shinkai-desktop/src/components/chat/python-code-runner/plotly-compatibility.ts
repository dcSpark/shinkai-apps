import { type Data, type Frame, type Layout } from 'plotly.js';

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
  if (
    hasMapboxResource(value) ||
    (isObject(value) &&
      typeof value.accesstoken === 'string' &&
      value.accesstoken.length > 0)
  ) {
    throw new Error(
      'This figure uses a Mapbox style or access token. Use a MapLibre style or an HTTPS map style URL without mapbox:// resources.',
    );
  }
}

function mapTraceType(type: string): string {
  return hasOwn(legacyMapTypes, type) ? legacyMapTypes[type] : type;
}

function convertTrace(value: unknown): unknown {
  if (!isObject(value)) return value;
  const trace = { ...value };
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
    return Array.isArray(value) ? value.map(convert) : convert(value);
  };
  const convertUpdate = (update: unknown, layout: boolean): unknown => {
    if (!isObject(update)) return update;
    return Object.fromEntries(
      Object.entries(update).map(([key, item]) => {
        if (layout && /^mapbox\d*(\.|$)/.test(key)) {
          assertMapStyleSupported(item);
          if (
            /\.accesstoken$/.test(key) &&
            typeof item === 'string' &&
            item.length > 0
          ) {
            assertMapStyleSupported({ accesstoken: item });
          }
        }
        return [
          layout ? layoutKey(key) : key,
          layout ? item : traceValue(key, item),
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
        convertUpdate({ [key]: args[1] }, true);
        return [layoutKey(key), ...args.slice(1)];
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
  const layout = { ...value };
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
      if (activeMaps.has(key)) assertMapStyleSupported(map);
      // Plotly 4 fits map bounds by default. Keep the previous initial view.
      layout[target] = { ...map, fitbounds: map.fitbounds ?? false };
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
        if (mapTraceType(key) === key) data.set(key, traces);
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

/** Keep saved Python Plotly 3 map figures usable with the patched Plotly 4 renderer. */
export function preparePlotlyFigure(value: unknown): PlotlyFigure {
  if (!isObject(value) || !Array.isArray(value.data)) {
    throw new Error('This chart does not contain Plotly data.');
  }
  const activeMaps = new Set<string>();
  const modernMaps = new Set<string>();
  const activeTypes = new Set<string>();
  const modernTypes = new Set<string>();
  const frameTraces = Array.isArray(value.frames)
    ? value.frames.flatMap((frame) =>
        isObject(frame) && Array.isArray(frame.data) ? frame.data : [],
      )
    : [];
  for (const trace of [...value.data, ...frameTraces]) {
    if (!isObject(trace)) continue;
    const type = typeof trace.type === 'string' ? trace.type : '';
    const subplot = typeof trace.subplot === 'string' ? trace.subplot : '';
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
  const figure = {
    ...value,
    data: value.data.map(convertTrace),
    layout: convertLayout(value.layout, activeMaps, activeTypes),
    frames: Array.isArray(value.frames)
      ? value.frames.map((frame) =>
          isObject(frame)
            ? {
                ...frame,
                data: Array.isArray(frame.data)
                  ? frame.data.map(convertTrace)
                  : frame.data,
                layout: convertLayout(frame.layout, activeMaps, activeTypes),
              }
            : frame,
        )
      : value.frames,
  };
  return figure as unknown as PlotlyFigure;
}
