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
  sprites = [];
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

  /** Place or replace a sprite in the world */
  async placeSprite({ id, url, pos, origin }) {
    console.log("placing sprite", arguments[0]);
    const { scene } = this;
    const loader = scene.load.image(id, url);
    scene.load.start();
    loader.once("complete", () => {
      const newSprite = scene.add.image(pos[0], pos[1], id);
      newSprite.setOrigin(...origin);
    });
  }
}
