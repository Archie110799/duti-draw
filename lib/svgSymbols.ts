import { Asset } from 'expo-asset';

let cachedRaw: string | null = null;
let cachedPromise: Promise<string> | null = null;

/**
 * Loads the bundled SVG symbol sheet once (raw XML string).
 * Used to compose a single-symbol SVG via `<use href="#symbolId" />`.
 */
export async function loadAnimalsSymbolSheetXml(): Promise<string> {
  if (cachedRaw) return cachedRaw;
  if (cachedPromise) return cachedPromise;

  cachedPromise = (async () => {
    const asset = Asset.fromModule(require('@/assets/vectors/animals-20.symbols.svg'));
    await asset.downloadAsync();
    const uri = asset.localUri ?? asset.uri;
    if (!uri) {
      throw new Error('SVG asset missing localUri');
    }
    const res = await fetch(uri);
    const text = await res.text();
    cachedRaw = text;
    return text;
  })();

  return cachedPromise;
}

export function extractDefsBlock(fullSvgXml: string): string {
  const m = fullSvgXml.match(/<defs>[\s\S]*?<\/defs>/i);
  return m?.[0] ?? '';
}

function extractSymbolInnerXml(fullSvgXml: string, symbolId: string): { viewBox?: string; inner: string } {
  const re = new RegExp(`<symbol\\b[^>]*\\bid\\s*=\\s*"${symbolId}"[^>]*>([\\s\\S]*?)<\\/symbol>`, 'i');
  const m = fullSvgXml.match(re);
  if (!m) {
    throw new Error(`Symbol not found: ${symbolId}`);
  }
  const symbolTagMatch = fullSvgXml.match(
    new RegExp(`<symbol\\b[^>]*\\bid\\s*=\\s*"${symbolId}"[^>]*>`, 'i')
  );
  const symbolTag = symbolTagMatch?.[0] ?? '';
  const viewBox = symbolTag.match(/viewBox\\s*=\\s*"([^"]+)"/i)?.[1];
  return { viewBox, inner: m[1] ?? '' };
}

/**
 * Builds a standalone SVG document that renders one symbol by id.
 */
export function buildSingleSymbolSvgXml(fullSvgXml: string, symbolId: string): string {
  const defs = extractDefsBlock(fullSvgXml);
  const { viewBox, inner } = extractSymbolInnerXml(fullSvgXml, symbolId);

  // Inline the symbol content instead of <use>. This lets us parse <path d="...">
  // for tracing guides and also avoids <use> compatibility quirks across platforms.
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox ?? '0 0 512 512'}">`,
    defs,
    inner,
    `</svg>`,
  ].join('');
}
