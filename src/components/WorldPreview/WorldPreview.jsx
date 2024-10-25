import { useEffect, useRef, useState } from "preact/hooks";
import * as Phaser from "phaser";
import Example from "./phaser";
import {
  browserGetCanvas,
  browserLoadCanvas,
  browserLoadImage,
  getBase64Url,
  getLoc,
} from "../../lib/util";
import { tileify } from "../../lib/tileify";
import { getNadir } from "../../lib/rectify";
import { usePan } from "./usePan";
const TILE_WIDTH = 256;
const TILE_COUNT = 6;

const CENTRE_OFFSET = (TILE_COUNT * TILE_WIDTH) / 4 + TILE_WIDTH / 4;

export default function WorldPreview(props) {
  console.log("props", props, arguments);
  const { dims, svg, zoom, svgKey } = props;
  const gameRoot = useRef();
  const [game, setGame] = useState();
  const [isLoaded, setIsLoaded] = useState();
  const [sprite, setSprite] = useState();
  const [handlers, translate, setTranslate] = usePan([0, 0], zoom);
  const [oldSvgKey, setOldSvgKey] = useState();
  const [spriteIndex, setSpriteIndex] = useState(0);
  const ceilZoom = Math.ceil(zoom) * window.devicePixelRatio;

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
    (async () => {
      const spriteUrl = getBase64Url(svg);
      const scene = game.scene.scenes[0];
      const nadir = await getNadir(svg);

      const spriteName = "sprite" + spriteIndex;
      const loader = scene.load.svg(spriteName, spriteUrl, { scale: ceilZoom });
      setSpriteIndex(spriteIndex + 1);
      scene.load.start();
      loader.once("complete", () => {
        if (sprite) {
          sprite.destroy();
          // FIXME: potential memory leak when race condition hit
          scene.textures.remove("sprite" + (spriteIndex - 1));
        }

        const { width, height } = scene.textures.get("sprite").frames.__BASE;
        const [spriteX, spriteY] = getLoc(TILE_WIDTH, 3, 3, 0);
        const transition = oldSvgKey !== svgKey;
        const emitter1 =
          transition &&
          scene.add.particles(
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
        const newSprite = scene.add.image(
          spriteX + CENTRE_OFFSET,
          spriteY,
          spriteName
        );
        newSprite.setOrigin(...nadir);
        newSprite.scale = 1 / ceilZoom;
        setSprite(newSprite);

        if (transition) {
          newSprite.alpha = 0;

          scene.add.tween({
            targets: newSprite,
            alpha: 1,
            duration: 500,
            delay: 200,
            ease: "Cubic",
          });
        }
        const emitter2 =
          transition &&
          scene.add.particles(
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
        const emitter3 =
          transition &&
          scene.add.particles(
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
        if (transition) {
          emitter1.on("complete", () => {
            emitter1.destroy();
            emitter2.destroy();
            emitter3.destroy();
          });
        }
        setOldSvgKey(svgKey);
      });
    })();
  }, [isLoaded, svg, ceilZoom]);

  useEffect(() => {
    if (game) {
      game.scale.resize(dims.width, dims.height);
    }
  }, [game, dims]);

  return <div class="game-root" ref={gameRoot} {...handlers} />;
}
