import { getLoc } from "./util";

export function tileify(srcCanvas) {
  const srcContext = srcCanvas.getContext("2d");
  const pixels = srcContext.getImageData(
    0,
    0,
    srcCanvas.width,
    srcCanvas.height
  );
  const newCanvas = new OffscreenCanvas(
    srcCanvas.width,
    Math.round(srcCanvas.height / 2)
  );
  const context = newCanvas.getContext("2d");
  for (let i = 0; i < pixels.data.length; i += 4) {
    const x = (i / 4) % srcCanvas.width;
    const y = Math.floor(i / srcCanvas.width / 4);

    const [dx, dy] = getLoc(1, x, y);
    const colour = `rgba(${pixels.data.slice(i, i + 4).join(",")})`;
    context.fillStyle = colour;
    context.fillRect(dx + newCanvas.width / 2, dy, 1, 1);
  }
  return newCanvas;
}
