/**
 * Model downloads, shared and started early. Kept free of three.js so a component can begin fetching the file
 * before the (much larger) 3D engine chunk has even loaded; the engine then parses the same bytes.
 */
export const MODEL_URLS = {
  oyster: '/models/oyster.glb',
  perfume: '/models/perfume.glb',
  diamond: '/models/diamond.glb',
} as const;

const downloads = new Map<string, Promise<ArrayBuffer>>();

export function prefetchModel(url: string): Promise<ArrayBuffer> {
  let download = downloads.get(url);
  if (!download) {
    download = fetch(url).then((response) => {
      if (!response.ok) throw new Error(`model ${response.status}`);
      return response.arrayBuffer();
    });
    // A failed download must not stick: the next attempt starts over.
    download.catch(() => downloads.delete(url));
    downloads.set(url, download);
  }
  return download;
}
