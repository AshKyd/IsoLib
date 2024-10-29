export class World {
  sprites = [];
  constructor() {}
  addSprite({ src, x, y }) {
    this.sprites.push({ src, x, y });
  }
}
