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

// Plotly 4 links splom dimensions and synchronizes overlay ticks by default.
// https://plotly.com/javascript/guides/migrating-to-v4/
function dimensionWithIndependentAxes(
  value: unknown,
  inherited?: unknown,
): unknown {
  if (!isObject(value)) return value;
  const axis = isObject(value.axis) ? value.axis : {};
  const inheritedAxis =
    isObject(inherited) && isObject(inherited.axis) ? inherited.axis : {};
  if (axis.matches != null) return value;
  return {
    ...value,
    axis: { ...axis, matches: inheritedAxis.matches ?? false },
  };
}

function axisSettings(layout: unknown, key: string): JsonObject {
  if (!isObject(layout)) return {};
  const template =
    isObject(layout.template) && isObject(layout.template.layout)
      ? layout.template.layout[key]
      : undefined;
  return {
    ...(isObject(template) ? template : {}),
    ...(isObject(layout[key]) ? layout[key] : {}),
  };
}

function axisLayout(inherited: unknown, value: JsonObject): JsonObject {
  const layout = { ...(isObject(inherited) ? inherited : {}), ...value };
  const keys = new Set([
    ...Object.keys(isObject(inherited) ? inherited : {}),
    ...Object.keys(value),
  ]);
  for (const key of keys) {
    if (/^[xy]axis\d*$/.test(key))
      layout[key] = {
        ...axisSettings(inherited, key),
        ...axisSettings(value, key),
      };
  }
  return layout;
}

function needsIndependentTicks(axis: JsonObject): boolean {
  return (
    typeof axis.overlaying === 'string' &&
    /^[xy]\d*$/.test(axis.overlaying) &&
    axis.tickmode == null &&
    !axis.dtick &&
    axis.tickvals == null
  );
}

function preserveOverlayTicks(
  value: JsonObject,
  inherited?: unknown,
): JsonObject {
  const layout = { ...value };
  for (const [key, axis] of Object.entries(value)) {
    if (!/^[xy]axis\d*$/.test(key) || !isObject(axis)) continue;
    if (
      needsIndependentTicks({
        ...axisSettings(inherited, key),
        ...axisSettings(value, key),
      })
    )
      layout[key] = { ...axis, tickmode: 'auto' };
  }
  return layout;
}

function preserveOverlayUpdate(
  value: JsonObject,
  layout?: unknown,
): JsonObject {
  const update = { ...value };
  for (const [key, item] of Object.entries(value)) {
    if (/^[xy]axis\d*$/.test(key) && isObject(item)) {
      const template =
        isObject(layout) && isObject(layout.template)
          ? layout.template.layout
          : undefined;
      if (needsIndependentTicks({ ...axisSettings(template, key), ...item }))
        update[key] = { ...item, tickmode: 'auto' };
    } else if (
      /^[xy]axis\d*\.(overlaying|tickmode|dtick|tickvals)$/.test(key)
    ) {
      const axisKey = key.split('.')[0];
      const axis = axisSettings(layout, axisKey);
      for (const property of ['overlaying', 'tickmode', 'dtick', 'tickvals']) {
        if (hasOwn(value, `${axisKey}.${property}`))
          axis[property] = value[`${axisKey}.${property}`];
      }
      if (needsIndependentTicks(axis)) update[`${axisKey}.tickmode`] = 'auto';
    }
  }
  return update;
}

function legacyIconMarker(
  marker: JsonObject,
  inherited: JsonObject,
  restoreCircle = false,
): JsonObject | undefined {
  const symbol = marker.symbol ?? inherited.symbol ?? 'circle';
  // Plotly uses the circle layer only for the scalar 'circle'. Symbol arrays,
  // including mixed arrays, use the icon layer and do not support color arrays.
  if (
    (typeof symbol === 'string' && symbol !== 'circle' && symbol.length > 0) ||
    (Array.isArray(symbol) && symbol.length > 0)
  )
    return { ...marker, color: 'black' };
  if (restoreCircle && marker.symbol === 'circle' && marker.color === undefined)
    return { ...marker, color: inherited.color ?? null };
  return undefined;
}

function convertTrace(
  value: unknown,
  typeHint?: string,
  inherited?: unknown,
  originalMarker?: JsonObject,
): unknown {
  if (!isObject(value)) return value;
  const trace = normalizePlotlyColors(value, false) as JsonObject;
  if ((value.type ?? typeHint) === 'scattermapbox') {
    const marker = legacyIconMarker(
      isObject(trace.marker) ? trace.marker : {},
      originalMarker ??
        (isObject(inherited) && isObject(inherited.marker)
          ? inherited.marker
          : {}),
      originalMarker !== undefined,
    );
    if (marker) trace.marker = normalizePlotlyColors(marker, false, 'marker');
  }
  if (typeof trace.type === 'string') {
    trace.type = mapTraceType(trace.type);
  }
  if (typeof trace.subplot === 'string') {
    trace.subplot = trace.subplot.replace(/^mapbox(\d*)$/, 'map$1');
  }
  if ((trace.type ?? typeHint) === 'splom') {
    const dimensions =
      isObject(inherited) && Array.isArray(inherited.dimensions)
        ? inherited.dimensions
        : [];
    const input = Array.isArray(trace.dimensions)
      ? trace.dimensions
      : trace.type === 'splom'
        ? dimensions
        : undefined;
    if (input?.length)
      trace.dimensions = input.map((dimension, index) =>
        dimensionWithIndependentAxes(dimension, dimensions[index]),
      );
  }
  return trace;
}

function convertAction(
  value: unknown,
  layoutContext?: unknown,
  traces: unknown[] = [],
): unknown {
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
  const splomUpdate = (update: JsonObject, targets: unknown[]): JsonObject => {
    const converted = { ...update };
    const at = (item: unknown, index: number) =>
      Array.isArray(item) ? item[index % item.length] : item;
    const isSplom = (index: number) => {
      const trace = targets[index % targets.length];
      return (
        (hasOwn(update, 'type')
          ? at(update.type, index)
          : isObject(trace)
            ? trace.type
            : undefined) === 'splom'
      );
    };
    const templateDimensions = (index: number): unknown[] => {
      const template =
        isObject(layoutContext) && isObject(layoutContext.template)
          ? layoutContext.template.data
          : undefined;
      const defaults =
        isObject(template) && Array.isArray(template.splom)
          ? template.splom
          : [];
      const target = targets[index % targets.length];
      const position = traces.indexOf(target);
      const ordinal = traces
        .slice(0, Math.max(position, 0))
        .filter((trace) => isObject(trace) && trace.type === 'splom').length;
      const trace = defaults[ordinal % defaults.length];
      return isObject(trace) && Array.isArray(trace.dimensions)
        ? trace.dimensions
        : [];
    };
    const dimensions = (item: unknown, index: number) =>
      Array.isArray(item)
        ? item.map((dimension, dimensionIndex) =>
            dimensionWithIndependentAxes(
              dimension,
              templateDimensions(index)[dimensionIndex],
            ),
          )
        : item;
    for (const [key, item] of Object.entries(update)) {
      if (!/^dimensions(?:\[\d+\](?:\.axis)?)?$/.test(key)) continue;
      const convert = (value: unknown, index: number) => {
        if (!isSplom(index)) return value;
        if (key === 'dimensions') return dimensions(value, index);
        const dimensionIndex = Number(key.match(/\[(\d+)\]/)?.[1]);
        const inherited = templateDimensions(index)[dimensionIndex];
        if (key.endsWith('.axis')) {
          return isObject(value) && value.matches == null
            ? {
                ...value,
                matches:
                  isObject(inherited) && isObject(inherited.axis)
                    ? (inherited.axis.matches ?? false)
                    : false,
              }
            : value;
        }
        return dimensionWithIndependentAxes(value, inherited);
      };
      converted[key] = Array.isArray(item)
        ? item.map(convert)
        : convert(item, 0);
    }
    if (
      hasOwn(update, 'type') &&
      !hasOwn(update, 'dimensions') &&
      targets.some(
        (trace, index) =>
          isSplom(index) && isObject(trace) && Array.isArray(trace.dimensions),
      )
    ) {
      converted.dimensions = targets.map((trace, index) =>
        isObject(trace) && isSplom(index)
          ? dimensions(trace.dimensions, index)
          : isObject(trace)
            ? trace.dimensions
            : undefined,
      );
    }
    return converted;
  };
  const iconUpdate = (
    update: JsonObject,
    original: JsonObject,
    targets: unknown[],
  ): JsonObject => {
    if (
      !['type', 'marker', 'marker.symbol', 'marker.color'].some((key) =>
        hasOwn(original, key),
      )
    )
      return update;
    const at = (item: unknown, index: number) =>
      Array.isArray(item) ? item[index % item.length] : item;
    let changed = false;
    const colors: unknown[] = [];
    const markers = targets.map((target, index) => {
      const replacement = at(update.marker, index);
      const marker: JsonObject = isObject(replacement)
        ? { ...replacement }
        : {};
      for (const key of ['symbol', 'color']) {
        if (hasOwn(update, `marker.${key}`))
          marker[key] = at(update[`marker.${key}`], index);
      }
      const legacy = hasOwn(original, 'type')
        ? at(original.type, index) === 'scattermapbox'
        : isObject(target) && target.legacyScattermapbox === true;
      const templateData =
        isObject(layoutContext) &&
        isObject(layoutContext.template) &&
        isObject(layoutContext.template.data)
          ? layoutContext.template.data
          : {};
      const defaults = legacy
        ? (templateData.scattermapbox ?? templateData.scattermap)
        : templateData.scattermap;
      const ordinal = traces
        .slice(0, Math.max(0, traces.indexOf(target)))
        .filter(
          (trace) => isObject(trace) && trace.legacyScattermapbox === true,
        ).length;
      const template = Array.isArray(defaults)
        ? defaults[ordinal % defaults.length]
        : undefined;
      const inherited = {
        ...(isObject(template) && isObject(template.marker)
          ? template.marker
          : {}),
        ...(!hasOwn(original, 'marker') &&
        isObject(target) &&
        isObject(target.marker)
          ? target.marker
          : {}),
      };
      const converted = legacy
        ? legacyIconMarker(marker, inherited, true)
        : undefined;
      changed ||= converted !== undefined;
      colors.push(
        normalizePlotlyColors(
          converted?.color ?? marker.color ?? inherited.color ?? null,
          false,
          'marker.color',
        ),
      );
      return converted ?? replacement;
    });
    if (!changed) return update;
    if (hasOwn(update, 'marker')) {
      return {
        ...update,
        marker:
          targets.length === 1 && !Array.isArray(update.marker)
            ? markers[0]
            : markers,
      };
    }
    return {
      ...update,
      'marker.color':
        colors.length === 1 &&
        !Array.isArray(colors[0]) &&
        !Array.isArray(update['marker.color'])
          ? colors[0]
          : colors,
    };
  };
  const convertUpdate = (
    update: unknown,
    layout: boolean,
    targets: unknown[] = [],
  ): unknown => {
    if (!isObject(update)) return update;
    const converted = Object.fromEntries(
      Object.entries(update).flatMap(([key, item]) => {
        if (layout && /^mapbox\d*\.accesstoken$/.test(key)) return [];
        let converted = item;
        if (layout && /^mapbox\d*(\.|$)/.test(key)) {
          if (/^mapbox\d*\.style$/.test(key)) {
            converted = convertMapStyle(item);
          } else if (/^mapbox\d*$/.test(key)) {
            const target = layoutKey(key);
            const defaults = isObject(layoutContext)
              ? { template: layoutContext.template }
              : undefined;
            const updated = preserveMapBounds(
              { [target]: convertMapSettings(item) },
              new Set([target]),
              defaults,
            ) as JsonObject;
            converted = updated[target];
          }
          assertMapStyleSupported(converted);
        } else if (layout && /^geo\d*$/.test(key) && isObject(item)) {
          const defaults = isObject(layoutContext)
            ? { template: layoutContext.template }
            : undefined;
          converted = (
            preserveGeoBounds(
              { [key]: item },
              new Set(),
              defaults,
            ) as JsonObject
          )[key];
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
    return layout
      ? preserveOverlayUpdate(converted, layoutContext)
      : iconUpdate(splomUpdate(converted, targets), update, targets);
  };
  const convertArgs = (args: unknown): unknown => {
    if (!Array.isArray(args)) return args;
    const stringForm = typeof args[0] === 'string' && method === 'restyle';
    const indices = args[method === 'update' || stringForm ? 2 : 1];
    const targets =
      indices === undefined
        ? traces
        : (Array.isArray(indices) ? indices : [indices]).flatMap((index) =>
            typeof index === 'number' &&
            Number.isInteger(index) &&
            traces.at(index) !== undefined
              ? [traces.at(index)]
              : [],
          );
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
        if (Object.keys(update).length > 1) return [update, ...args.slice(2)];
        if (args.length > 1) converted[1] = update[layoutKey(key)];
        return converted;
      }
      const update = convertUpdate(
        { [key]: args[1] },
        false,
        targets,
      ) as JsonObject;
      return Object.keys(update).length > 1
        ? [update, ...args.slice(2)]
        : [key, update[key], ...args.slice(2)];
    }
    return args.map((arg, index) => {
      if (method === 'relayout' && index === 0) return convertUpdate(arg, true);
      if ((method === 'restyle' || method === 'update') && index === 0)
        return convertUpdate(arg, false, targets);
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
  inheritedLayout?: unknown,
  traces: unknown[] = [],
): unknown {
  if (!isObject(value)) return value;
  const convertedMaps = new Set<string>();
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
          ? {
              ...group,
              [actions]: group[actions].map((action) =>
                convertAction(
                  action,
                  axisLayout(inheritedLayout, value),
                  traces,
                ),
              ),
            }
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
    convertedMaps.add(target);
    if (isObject(map)) {
      const settings = normalizePlotlyColors(
        convertMapSettings(map),
        true,
        target,
      ) as JsonObject;
      if (activeMaps.has(key)) assertMapStyleSupported(settings);
      layout[target] = settings;
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
            Array.isArray(traces)
              ? traces.map((trace) => convertTrace(trace, key))
              : traces,
          );
      }
      for (const [key, traces] of Object.entries(template.data)) {
        const target = mapTraceType(key);
        if (target === key || (data.has(target) && !activeTypes.has(key)))
          continue;
        data.set(
          target,
          Array.isArray(traces)
            ? traces.map((trace) => convertTrace(trace, key))
            : traces,
        );
      }
      template.data = Object.fromEntries(data);
    }
    template.layout = convertLayout(
      template.layout,
      activeMaps,
      activeTypes,
      true,
      {
        template: {
          data: isObject(value.template) ? value.template.data : template.data,
        },
      },
      traces,
    );
    layout.template = template;
  }
  return preserveMapBounds(
    preserveOverlayTicks(layout, inheritedLayout),
    new Set([
      ...convertedMaps,
      ...[...activeMaps].map((key) => key.replace(/^mapbox/, 'map')),
    ]),
    inheritedLayout,
  );
}

function preserveMapBounds(
  value: unknown,
  maps: Set<string>,
  inherited?: unknown,
  addMissing = false,
): unknown {
  if (!isObject(value) && (!addMissing || maps.size === 0)) return value;
  const layout = isObject(value) ? { ...value } : {};
  const bounds = (candidate: unknown, key: string): unknown => {
    if (!isObject(candidate)) return undefined;
    const settings = candidate[key] ?? candidate[key.replace(/^map/, 'mapbox')];
    return isObject(settings) ? settings.fitbounds : undefined;
  };
  const template = (candidate: unknown) =>
    isObject(candidate) && isObject(candidate.template)
      ? candidate.template.layout
      : undefined;
  for (const key of maps) {
    if (!addMissing && layout[key] === undefined) continue;
    if (layout[key] === undefined && bounds(template(layout), key) != null)
      continue;
    if (layout[key] !== undefined && !isObject(layout[key])) continue;
    const inheritedBounds = [
      bounds(template(layout), key),
      bounds(inherited, key),
      bounds(template(inherited), key),
    ].find((setting) => setting != null);
    if (
      bounds(layout, key) != null ||
      (inheritedBounds != null && inheritedBounds !== false)
    )
      continue;
    layout[key] = {
      ...(layout[key] as JsonObject | undefined),
      fitbounds: false,
    };
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

function controlMapTraces(
  figure: JsonObject,
  onReachable?: (trace: JsonObject, index: number) => void,
): JsonObject[] {
  const traces = figure.data as unknown[];
  const states = traces.map((trace) => [isObject(trace) ? trace : {}]);
  const updates = traces.map(() => [] as JsonObject[]);
  const selection = (value: unknown): number[] => {
    if (value === undefined) return traces.map((_, index) => index);
    return (Array.isArray(value) ? value : [value]).flatMap((index) => {
      if (typeof index !== 'number' || !Number.isInteger(index)) return [];
      const target = index < 0 ? traces.length + index : index;
      return target >= 0 && target < traces.length ? [target] : [];
    });
  };
  const addAction = (action: unknown) => {
    if (
      !isObject(action) ||
      !['restyle', 'update'].includes(String(action.method))
    )
      return;
    for (const args of [action.args, action.args2]) {
      if (!Array.isArray(args)) continue;
      const stringForm =
        action.method === 'restyle' && typeof args[0] === 'string';
      const update = stringForm ? { [args[0]]: args[1] } : args[0];
      if (
        !isObject(update) ||
        !['type', 'subplot', 'geo'].some((key) => hasOwn(update, key))
      )
        continue;
      const indices = selection(
        args[action.method === 'update' || stringForm ? 2 : 1],
      );
      indices.forEach((target, position) => {
        const identity: JsonObject = {};
        for (const key of ['type', 'subplot', 'geo']) {
          const value = Array.isArray(update[key])
            ? update[key][position % update[key].length]
            : update[key];
          if (typeof value === 'string') identity[key] = value;
          else if (value === null) identity[key] = '';
        }
        updates[target].push(identity);
      });
    }
  };
  const addLayout = (layout: unknown) => {
    if (!isObject(layout)) return;
    for (const [collection, actions] of [
      ['updatemenus', 'buttons'],
      ['sliders', 'steps'],
    ]) {
      if (!Array.isArray(layout[collection])) continue;
      for (const group of layout[collection]) {
        if (isObject(group) && Array.isArray(group[actions]))
          group[actions].forEach(addAction);
      }
    }
    if (isObject(layout.template)) addLayout(layout.template.layout);
  };
  addLayout(figure.layout);
  if (Array.isArray(figure.frames)) {
    for (const frame of figure.frames) {
      if (!isObject(frame)) continue;
      addLayout(frame.layout);
      if (!Array.isArray(frame.data)) continue;
      const indices = Array.isArray(frame.traces)
        ? selection(frame.traces)
        : traces.map((_, index) => index);
      frame.data.forEach((trace, position) => {
        const target = indices[position];
        if (isObject(trace) && target !== undefined)
          states[target].push({ ...states[target][0], ...trace });
      });
    }
  }
  // Controls can be used in sequence. Keep type/subplot updates on the same
  // trace together, and apply later updates to every reachable identity.
  const reachable: JsonObject[] = [];
  states.forEach((traceStates, traceIndex) => {
    const identity = (trace: JsonObject) =>
      JSON.stringify([trace.type, trace.subplot, trace.geo]);
    const seen = new Set(traceStates.map(identity));
    for (let index = 0; index < traceStates.length; index += 1) {
      onReachable?.(traceStates[index], traceIndex);
      for (const update of updates[traceIndex]) {
        const trace = { ...traceStates[index], ...update };
        const key = identity(trace);
        if (seen.has(key)) continue;
        seen.add(key);
        traceStates.push(trace);
        reachable.push(trace);
      }
    }
  });
  return reachable;
}

/** Keep saved Python Plotly 3 figures usable with the patched Plotly 4 renderer. */
export function preparePlotlyFigure(value: unknown): PlotlyFigure {
  if (!isObject(value) || !Array.isArray(value.data)) {
    throw new Error('This chart does not contain Plotly data.');
  }
  const sourceData = value.data;
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
  const controlSplomIndices = new Set<number>();
  const controlLegacyMapIndices = new Set<number>();
  for (const trace of controlMapTraces(value, (trace, index) => {
    if (trace.type === 'splom') controlSplomIndices.add(index);
    if (trace.type === 'scattermapbox') controlLegacyMapIndices.add(index);
    if (trace.type === 'scattergeo' || trace.type === 'choropleth') {
      activeGeos.add(
        typeof trace.geo === 'string' && /^geo\d*$/.test(trace.geo)
          ? trace.geo
          : 'geo',
      );
    }
  })) {
    const type = typeof trace.type === 'string' ? trace.type : '';
    const subplot = typeof trace.subplot === 'string' ? trace.subplot : '';
    if (hasOwn(legacyMapTypes, type)) {
      activeTypes.add(type);
      activeMaps.add(/^mapbox\d*$/.test(subplot) ? subplot : 'mapbox');
    } else if (
      Object.values(legacyMapTypes).includes(type) &&
      /^mapbox\d*$/.test(subplot)
    ) {
      activeMaps.add(subplot);
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
  const templateCounts = new Map<string, number>();
  const originalMarkers: JsonObject[] = [];
  const data = value.data.map((trace) => {
    const type =
      isObject(trace) && typeof trace.type === 'string' ? trace.type : '';
    const defaults = templateData[type];
    const index = templateCounts.get(type) ?? 0;
    templateCounts.set(type, index + 1);
    const inherited = Array.isArray(defaults)
      ? defaults[index % defaults.length]
      : undefined;
    originalMarkers.push({
      ...(isObject(inherited) && isObject(inherited.marker)
        ? inherited.marker
        : {}),
      ...(isObject(trace) && isObject(trace.marker) ? trace.marker : {}),
    });
    return convertTrace(trace, type, inherited);
  });
  const controlTraces = data.map((trace, index) =>
    isObject(trace)
      ? {
          ...trace,
          ...(controlSplomIndices.has(index) ? { type: 'splom' } : {}),
          ...(controlLegacyMapIndices.has(index)
            ? { legacyScattermapbox: true, marker: originalMarkers[index] }
            : {}),
        }
      : trace,
  );
  const layout = preserveGeoBounds(
    preserveMapBounds(
      convertLayout(
        value.layout,
        activeMaps,
        activeTypes,
        false,
        undefined,
        controlTraces,
      ),
      new Set([...activeMaps].map((key) => key.replace(/^mapbox/, 'map'))),
      undefined,
      true,
    ),
    activeGeos,
    undefined,
    true,
  );
  const figure = {
    ...value,
    data,
    layout,
    frames: Array.isArray(value.frames)
      ? value.frames.map((frame) => {
          if (!isObject(frame)) return frame;
          const frameData = Array.isArray(frame.data)
            ? frame.data.map((trace, index) => {
                const target = Array.isArray(frame.traces)
                  ? frame.traces[index]
                  : index;
                const inherited =
                  typeof target === 'number' ? data[target] : undefined;
                const type =
                  typeof target === 'number' &&
                  isObject(sourceData[target]) &&
                  sourceData[target].type === 'scattermapbox'
                    ? 'scattermapbox'
                    : isObject(inherited) && typeof inherited.type === 'string'
                      ? inherited.type
                      : undefined;
                return convertTrace(
                  trace,
                  type,
                  inherited,
                  typeof target === 'number'
                    ? originalMarkers[target]
                    : undefined,
                );
              })
            : frame.data;
          return {
            ...frame,
            data: frameData,
            layout: preserveGeoBounds(
              convertLayout(
                frame.layout,
                activeMaps,
                activeTypes,
                false,
                layout,
                controlTraces,
              ),
              activeGeos,
              layout,
            ),
          };
        })
      : value.frames,
  };
  return figure as unknown as PlotlyFigure;
}
