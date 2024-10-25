import { useEffect, useRef, useState } from "preact/hooks";
import * as Phaser from "phaser";
import Example from "./phaser";
import {
  browserGetCanvas,
  browserLoadCanvas,
  browserLoadImage,
  getLoc,
} from "../../lib/util";
import { tileify } from "../../lib/tileify";
import { getNadir } from "../../lib/rectify";
import { usePan } from "./usePan";
const TILE_WIDTH = 256;
const TILE_COUNT = 6;

const CENTRE_OFFSET = (TILE_COUNT * TILE_WIDTH) / 4 + TILE_WIDTH / 4;

export default function WorldPreview({ dims, svg, zoom }) {
  const gameRoot = useRef();
  const [game, setGame] = useState();
  const [isLoaded, setIsLoaded] = useState();
  const [sprite, setSprite] = useState();
  const [handlers, translate, setTranslate] = usePan([0, 0], zoom);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    game.scene.scenes[0].cameras.main.setZoom(zoom);
  }, [zoom, isLoaded]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    console.log("translating", translate);
    game.scene.scenes[0].cameras.main.setScroll(...translate);
  }, [translate, isLoaded]);

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      scene: Example,
      parent: gameRoot.current,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 200, x: 0 },
        },
      },
    });
    setGame(game);
    game.events.once("ready", async () => {
      const scene = game.scene.scenes[0];

      const baseTileUrl = await browserLoadCanvas({ src: "/tile.png" })
        .then(tileify)
        .then((canvas) => canvas.convertToBlob())
        .then((blob) => URL.createObjectURL(blob));

      const loader = scene.load.image("baseTile", baseTileUrl);

      scene.load.start();
      loader.once("complete", () => {
        console.log("completed loading basetile");
        for (let x = 0; x < TILE_COUNT; x++) {
          for (let y = 0; y < TILE_COUNT; y++) {
            const [tileX, tileY] = getLoc(TILE_WIDTH, x, y, 0);
            const sprite = scene.add.image(
              tileX + CENTRE_OFFSET,
              tileY,
              "baseTile"
            );
            sprite.setOrigin(0.5, 1);
          }
        }

        setIsLoaded(true);
      });
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    browserLoadImage({ svg })
      .then(browserGetCanvas)
      .then((canvas) => canvas.convertToBlob())
      .then((blob) => URL.createObjectURL(blob))
      .then(async (spriteUrl) => {
        const scene = game.scene.scenes[0];
        const nadir = await getNadir(svg);
        console.log({ nadir });
        if (sprite) {
          sprite.destroy();
          scene.textures.remove("sprite");
        }

        const loader = scene.load.image("sprite", spriteUrl);
        scene.load.start();
        loader.once("complete", () => {
          const { width, height } = scene.textures.get("sprite").frames.__BASE;
          const [spriteX, spriteY] = getLoc(TILE_WIDTH, 3, 3, 0);
          const emitter1 = scene.add.particles(
            spriteX + CENTRE_OFFSET,
            spriteY - height / 2,
            "particle-dust",
            {
              speed: 20,
              scale: {
                start: 0,
                end: Math.max(1, height / 50),
              },
              alpha: { start: 0.6, end: 0 },
              stopAfter: 6,
              lifespan: 2000,
            }
          );
          const sprite = scene.add.image(
            spriteX + CENTRE_OFFSET,
            spriteY,
            "sprite"
          );
          sprite.setOrigin(...nadir);
          setSprite(sprite);

          sprite.alpha = 0;
          sprite.scale = 0.9;

          scene.add.tween({
            targets: sprite,
            alpha: 1,
            scale: 1,
            duration: 500,
            delay: 200,
            ease: "Cubic",
          });

          const emitter2 = scene.add.particles(
            spriteX + CENTRE_OFFSET,
            spriteY - height / 2,
            "particle-yellow",
            {
              frequency: 5,
              speed: 150,
              scale: {
                start: 1,
                end: 0,
              },
              //   alpha: { start: 1, end: 0 },
              stopAfter: 15,
              blendMode: "SCREEN",
              lifespan: 1000,
              gravityX: 0,
              gravityY: 200,
              delay: 150,
            }
          );
          const emitter3 = scene.add.particles(
            spriteX + CENTRE_OFFSET,
            spriteY - height / 2,
            "particle-yellow",
            {
              frequency: 2,
              speed: 200,
              scale: {
                start: 0.5,
                end: 0,
              },
              stopAfter: 32,
              blendMode: "SCREEN",
              gravityX: 0,
              gravityY: 200,
            }
          );
          emitter1.on("complete", () => {
            emitter1.destroy();
            emitter2.destroy();
            emitter3.destroy();
          });
        });
      });
  }, [isLoaded, svg]);

  useEffect(() => {
    if (game) {
      game.scale.resize(dims.width, dims.height);
    }
  }, [game, dims]);

  return <div class="game-root" ref={gameRoot} {...handlers} />;
}
