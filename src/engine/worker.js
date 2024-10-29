import { tileify } from "../lib/tileify";
import { browserGetCanvas, fetchAsImageBitmap, getLoc } from "../lib/util";

const TILE_WIDTH = 256;
const TILE_COUNT = 6;
const CENTRE_OFFSET = (TILE_COUNT * TILE_WIDTH) / 4 + TILE_WIDTH / 4;

class Engine {
  sprites = [];
  time = Date.now();
  constructor() {
    this.init();
  }
  async init() {
    const baseTileUrl = await fetchAsImageBitmap({ src: "/tile.png" })
      .then(browserGetCanvas)
      .then(tileify)
      .then((canvas) => canvas.convertToBlob())
      .then((blob) => URL.createObjectURL(blob));

    for (let x = 0; x < TILE_COUNT; x++) {
      for (let y = 0; y < TILE_COUNT; y++) {
        const pos = getLoc(TILE_WIDTH, x, y, 0);
        this.addSprite({
          id: String((x + 1) * 1000 + y),
          url: baseTileUrl,
          origin: [0.5, 1],
          pos,
        });
      }
    }
  }
  addSprite(sprite) {
    this.sprites.push(sprite);
    postMessage(["placeSprite", sprite]);
  }
}

const engine = new Engine();

addEventListener("message", (message) => {
  const [method, payload] = message.data;
  if (!engine[method])
    throw new Error(`Method "${method}" not found in worker engine`);
  engine[method](payload);
});
