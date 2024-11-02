import { tileify } from "../lib/tileify";
import { browserGetCanvas, fetchAsImageBitmap, getLoc } from "../lib/util";
import * as tile from "./spriteTile";
import * as colourisedSvg from "./spriteColourisedSvg";
const TILE_WIDTH = 256;
const TILE_COUNT = 6;
const CENTRE_OFFSET = (TILE_COUNT * TILE_WIDTH) / 4 + TILE_WIDTH / 4;

class Engine {
  sprites = [];
  time = Date.now();
  zoom = 1;
  translate = [0, 0];
  spriteTypes = {
    tile,
    colourisedSvg,
  };
  constructor() {
    this.init();
  }
  async init() {
    for (let x = 0; x < TILE_COUNT; x++) {
      for (let y = 0; y < TILE_COUNT; y++) {
        const pos = getLoc(TILE_WIDTH, x, y, 0);
        this.addSprite({
          type: "tile",
          id: String((x + 1) * 1000 + y),
          sourceUrl: "/tile.png",
          origin: [0.5, 1],
          pos,
        });
      }
    }
  }
  async addSprite(sprite) {
    const renderer = this.spriteTypes[sprite.type].render;
    const newSprite = await renderer(sprite, this);
    this.sprites.push(newSprite);
    postMessage(["placeSprite", newSprite]);
  }
  setProps(props) {
    Object.assign(this, props);
  }
}

const engine = new Engine();

addEventListener("message", (message) => {
  const [method, payload] = message.data;
  if (!engine[method])
    throw new Error(`Method "${method}" not found in worker engine`);
  engine[method](JSON.parse(payload));
});
