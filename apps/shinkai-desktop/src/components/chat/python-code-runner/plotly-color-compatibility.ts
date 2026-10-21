import { layoutColorPaths, traceColorPaths } from './plotly-color-attributes';

type ColorType = 'color' | 'colorlist' | 'colorscale';
type ColorAttributes = { [key: string]: ColorAttributes | ColorType };

function colorAttributes(paths: Record<ColorType, string[]>): ColorAttributes {
  const attributes: ColorAttributes = {};
  for (const [type, names] of Object.entries(paths)) {
    for (const name of names) {
      const parts = name.split('.');
      let current = attributes;
      for (const part of parts.slice(0, -1)) {
        current[part] ??= {};
        current = current[part] as ColorAttributes;
      }
      current[parts[parts.length - 1]] = type as ColorType;
    }
  }
  return attributes;
}

const traceAttributes = colorAttributes(traceColorPaths);
const layoutAttributes = colorAttributes(layoutColorPaths);

// Match the old renderer's fractional RGB rule: every channel must be < 1.
// https://github.com/plotly/plotly.js/blob/v3.3.1/src/components/color/index.js
function normalizeColor(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const color = value.trim();
  if (/^(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(color))
    return `#${color}`;
  const match = /^(rgb|rgba|hsv|hsva)\s*\(([^()]*)\)$/i.exec(color);
  if (!match) return value;
  const kind = match[1].toLowerCase();
  const parts = match[2].trim().split(/\s*,\s*|\s+/);
  const hasAlpha = kind.endsWith('a');
  if (parts.length !== (hasAlpha ? 4 : 3)) return value;
  if (parts.some((part) => !/^[+-]?(?:\d*\.)?\d+%?$/.test(part))) return value;
  const alpha = hasAlpha ? Number(parts[3]) : 1;
  if (!Number.isFinite(alpha) || alpha < 0) return value;
  const opacity = Math.min(alpha, 1);
  let channels: number[];
  if (kind.startsWith('rgb')) {
    channels = parts.slice(0, 3).map(Number);
    if (!channels.every((channel) => channel >= 0 && channel < 1)) return value;
    channels = channels.map((channel) => Math.round(channel * 255));
  } else {
    // Tinycolor, used by Plotly 3, accepts HSV percentages or 0–100 S/V.
    const unit = (part: string, max: number) => {
      const number = /^1\.0+$/.test(part) ? max : parseFloat(part);
      const scaled = part.endsWith('%') ? (number * max) / 100 : number;
      return Math.max(0, Math.min(scaled, max)) / max;
    };
    const hue = unit(parts[0], 360) * 6;
    const saturation = unit(parts[1], 100);
    const brightness = unit(parts[2], 100);
    const chroma = brightness * saturation;
    const secondary = chroma * (1 - Math.abs((hue % 2) - 1));
    const base = brightness - chroma;
    const sectors = [
      [chroma, secondary, 0],
      [secondary, chroma, 0],
      [0, chroma, secondary],
      [0, secondary, chroma],
      [secondary, 0, chroma],
      [chroma, 0, secondary],
    ];
    channels = sectors[Math.floor(hue) % 6].map((channel) =>
      Math.round((channel + base) * 255),
    );
  }
  return hasAlpha
    ? `rgba(${channels.join(', ')}, ${opacity})`
    : `rgb(${channels.join(', ')})`;
}

function normalizeColors(value: unknown): unknown {
  return Array.isArray(value)
    ? value.map(normalizeColors)
    : normalizeColor(value);
}

function normalizeScale(value: unknown): unknown {
  if (!Array.isArray(value)) return value;
  return value.map((stop) => {
    if (Array.isArray(stop) && typeof stop[0] === 'number') {
      const converted = [...stop];
      if (stop.length > 1) converted[1] = normalizeColor(stop[1]);
      return converted;
    }
    return normalizeScale(stop);
  });
}

function attributeAtPath(
  attributes: ColorAttributes,
  path: string,
): ColorAttributes | ColorType | undefined {
  let current: ColorAttributes | ColorType | undefined = attributes;
  for (const part of path.replace(/\[(\d+)\]/g, '.$1').split('.')) {
    if (!current || typeof current === 'string') return undefined;
    const key = /^\d+$/.test(part)
      ? '[]'
      : part.replace(
          /^(xaxis|yaxis|scene|geo|polar|ternary|smith|map|coloraxis)\d+$/,
          '$1',
        );
    current = current[key];
  }
  return current;
}

function normalizeAttributes(
  value: unknown,
  attributes: ColorAttributes | ColorType | undefined,
): unknown {
  if (!attributes) return value;
  if (attributes === 'colorscale') return normalizeScale(value);
  if (typeof attributes === 'string') return normalizeColors(value);
  if (Array.isArray(value)) {
    return value.map((item) => normalizeAttributes(item, attributes['[]']));
  }
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      normalizeAttributes(item, attributeAtPath(attributes, key)),
    ]),
  );
}

export function normalizePlotlyColors(
  value: unknown,
  layout: boolean,
  path?: string,
): unknown {
  const attributes = layout ? layoutAttributes : traceAttributes;
  return normalizeAttributes(
    value,
    path === undefined ? attributes : attributeAtPath(attributes, path),
  );
}
