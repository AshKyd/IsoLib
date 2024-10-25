import * as Phaser from "phaser";
console.log({ Phaser });

export default class Example extends Phaser.Scene {
  preload() {
    this.load.image("particle-dust", "/particle-dust.webp");
    this.load.image("particle-yellow", "/particle-yellow.webp");
  }

  create() {
    // this.add.image(400, 300, "sky");

    // const logo = this.physics.add.image(400, 100, "logo");

    // logo.setVelocity(100, 200);
    // logo.setBounce(1, 1);
    // logo.setCollideWorldBounds(true);

    // particles.startFollow(logo);
    this.events.emit("ready");
  }
}
