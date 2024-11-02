import { tileify } from "../lib/tileify";
import { browserGetCanvas, fetchAsImageBitmap } from "../lib/util";

const renderCache = {};

export async function render(sprite, engine) {
  if (renderCache[sprite.url]) {
    return { ...sprite, url: renderCache[sprite.sourceUrl] };
  }
  const url = await fetchAsImageBitmap({ src: "/tile.png" })
    .then(browserGetCanvas)
    .then(tileify)
    .then((canvas) => canvas.convertToBlob())
    .then((blob) => URL.createObjectURL(blob));

  return { ...sprite, url };
}
