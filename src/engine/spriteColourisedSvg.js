import { paint } from "../lib/recolour";
import { getNadir } from "../lib/rectify";
import { getBase64Url, svg2Canvas } from "../lib/util";

const renderCache = {};

export async function render(sprite, engine) {
  if (renderCache[sprite.url]) {
    return { ...sprite, url: renderCache[sprite.sourceUrl] };
  }

  const { primary, secondary, alwaysLightUp } = sprite.opts;

  console.log("starting", sprite.sourceUrl);
  const svg = await fetch(sprite.sourceUrl).then((res) => res.text());

  const paintedSvg = paint(svg, {
    flip: false,
    primary,
    secondary,
    time: engine.time,
    alwaysLightUp: alwaysLightUp,
  });
  const canvas = await svg2Canvas(paintedSvg);
  const nadir = getNadir(canvas);
  const url = await canvas
    .convertToBlob()
    .then((blob) => URL.createObjectURL(blob));

  return { ...sprite, origin: nadir, url };
}
