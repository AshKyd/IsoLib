export function getBase64Url(svg) {
  return "data:image/svg+xml;base64," + btoa(svg || "");
}
export function browserLoadImage({ src, svg }) {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.addEventListener("error", (e) => {
      console.error("image failed to load", e);
      reject(e);
    });
    img.addEventListener("load", () => resolve(img));
    img.src = src || getBase64Url(svg);
  });
}

export function browserGetCanvas(img) {
  const canvas = new OffscreenCanvas(img.width, img.height);
  const context = canvas.getContext("2d");
  context.drawImage(img, 0, 0);
  return canvas;
}

export async function browserLoadCanvas(props) {
  const img = await browserLoadImage(props);
  return browserGetCanvas(img);
}

export async function fetchAsImageBitmap({ src }) {
  const response = await fetch(src);
  const blob = await response.blob();
  const imageBitmap = await createImageBitmap(blob);
  return imageBitmap;
}

/**
 * Get x,y coordinates of a tile location.
 */
export function getLoc(tw, tx, ty, tz = 0, translate = [0, 0], zoom = 1) {
  const tileWidth = tw * zoom;
  const px = (tx * tileWidth) / 2 - (ty * tileWidth) / 2 + translate[0];
  const py = (ty * tileWidth) / 4 + (tx * tileWidth) / 4 + translate[1] - tz;
  return [px, py];
}
