import * as Phaser from "phaser";

export default class Example extends Phaser.Scene {
  preload() {
    this.load.image("particle-dust", "/particle-dust.webp");
    this.load.image("particle-yellow", "/particle-yellow.webp");
  }

  create() {
    this.events.emit("ready");
  }
}
