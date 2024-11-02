import { paint } from "../lib/recolour";
import { getBase64Url, svg2Canvas } from "../lib/util";

const renderCache = {};

export async function render(sprite, engine) {
  if (renderCache[sprite.url]) {
    return { ...sprite, url: renderCache[sprite.sourceUrl] };
  }

  const { primary, secondary, alwaysLightUp } = sprite.opts;

  console.log("starting", sprite.sourceUrl);
  const url = await fetch(sprite.sourceUrl)
    .then((res) => res.text())
    .then((svg) =>
      paint(svg, {
        flip: false,
        primary,
        secondary,
        time: engine.time,
        alwaysLightUp: alwaysLightUp,
      })
    )
    .then(svg2Canvas)
    .then((canvas) => canvas.convertToBlob())
    .then((blob) => URL.createObjectURL(blob));
  console.log("url", url);

  return { ...sprite, url };
}
