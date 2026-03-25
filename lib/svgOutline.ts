import { svgPathProperties as SvgPathProperties } from 'svg-path-properties';

export type SvgOutline = {
  viewBox: { minX: number; minY: number; width: number; height: number };
  paths: { d: string; strokeWidth?: number }[];
};

function parseViewBox(svgXml: string): SvgOutline['viewBox'] {
  const m = svgXml.match(/viewBox\s*=\s*"([^"]+)"/i);
  const parts = (m?.[1] ?? '0 0 512 512').trim().split(/\s+/).map(Number);
  const [minX, minY, width, height] = parts.length === 4 && parts.every((n) => Number.isFinite(n)) ? parts : [0, 0, 512, 512];
  return { minX, minY, width, height };
}

function parsePaths(svgXml: string): SvgOutline['paths'] {
  const matches = svgXml.match(/<path\b[^>]*>/gi) ?? [];
  const out: SvgOutline['paths'] = [];
  for (const tag of matches) {
    const d = tag.match(/\sd\s*=\s*"([^"]+)"/i)?.[1];
    if (!d) continue;
    // Try to read stroke-width if present; fall back to undefined.
    const swRaw = tag.match(/stroke-width\s*=\s*"([^"]+)"/i)?.[1];
    const strokeWidth = swRaw ? Number(swRaw) : undefined;
    out.push({ d, strokeWidth: Number.isFinite(strokeWidth) ? strokeWidth : undefined });
  }
  return out;
}

export function parseSvgOutline(svgXml: string): SvgOutline {
  return {
    viewBox: parseViewBox(svgXml),
    paths: parsePaths(svgXml),
  };
}

export type SampledPolyline = {
  points: { x: number; y: number }[];
  totalLength: number;
  // cumulative length at each point (same length as points)
  cum: number[];
};

export function samplePathToPolyline(d: string, stepPx = 14): SampledPolyline {
  const props = new SvgPathProperties(d);
  const total = props.getTotalLength();
  const count = Math.max(2, Math.ceil(total / Math.max(2, stepPx)));
  const points: { x: number; y: number }[] = [];
  const cum: number[] = [];
  for (let i = 0; i < count; i++) {
    const l = (i / (count - 1)) * total;
    const p = props.getPointAtLength(l);
    points.push({ x: p.x, y: p.y });
    cum.push(l);
  }
  return { points, totalLength: total, cum };
}

