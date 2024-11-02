import * as Phaser from "phaser";

export class EngineScene extends Phaser.Scene {
  preload() {
    this.load.image("particle-dust", "/particle-dust.webp");
    this.load.image("particle-yellow", "/particle-yellow.webp");
  }

  create() {
    this.events.emit("ready");
  }
}

export class EngineInterface {
  spritesById = {};
  constructor(gameRoot) {
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      scene: EngineScene,
      parent: gameRoot,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 200, x: 0 },
        },
      },
    });
    this.worker = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });
    this.worker.addEventListener("message", (message) => {
      console.log("received message");
      const [method, payload] = message.data;
      this[method](payload);
    });
  }

  get scene() {
    return this.game.scene.scenes[0];
  }

  request(method, payload) {
    this.worker.postMessage([method, JSON.stringify(payload)]);
  }

  async loadTexture(textureName, url) {
    return new Promise((resolve) => {
      const { scene } = this;

      const loader = scene.load.image(textureName, url);
      scene.load.start();
      loader.once("complete", () => {
        resolve(loader);
      });
    });
  }

  /** Place or replace a sprite in the world */
  async placeSprite({ id, url, pos, origin }) {
    const { scene } = this;
    const textureName = String(url);

    await this.loadTexture(textureName, url);

    const existingSprite = this.spritesById[id];
    if (existingSprite) {
      existingSprite.sprite.destroy();
      // FIXME: this works for now, but in future we must first check if another sprite is using the same texture.
      scene.textures.remove(existingSprite.texture);
    }
    const newSprite = scene.add.image(pos[0], pos[1], textureName);
    newSprite.setOrigin(...origin);
    this.spritesById[id] = { sprite: newSprite, texture: textureName };
  }
}
