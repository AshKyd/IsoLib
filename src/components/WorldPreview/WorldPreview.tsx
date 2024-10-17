import { useEffect, useRef, useState } from "preact/hooks";
import { browserLoadCanvas, getLoc, browserLoadImage } from "../../lib/util";
import { getDims, getNadir } from "../../lib/rectify";
import { tileify } from "../../lib/tileify";
import { usePan } from "./usePan";

const TILE_WIDTH = 256;

/**
 * Draw an isometric grid from the given nadir.
 * This is a bit dodgy but works well enough for the purposes.
 */
function drawGrid(canvas, ctx, from, zoom) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#005555";

  const gridWidth = GRID_WIDTH * zoom;

  for (
    let i = 0 - (canvas.width % gridWidth) * 2;
    i < canvas.width % gridWidth;
    i++
  ) {
    const xStart = (from[0] % gridWidth) + gridWidth * i;
    const yStart = from[1] % gridWidth;
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xStart + canvas.height * 2, yStart + canvas.height);
    ctx.stroke();
  }

  for (let i = 0; i < (canvas.width % gridWidth) * 2.5; i++) {
    const xStart = (from[0] % gridWidth) + gridWidth * i;
    const yStart = from[1] % gridWidth;
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xStart - canvas.height * 2, yStart + canvas.height);
    ctx.stroke();
  }
}

function renderSprites({ context, sprites = [], zoom, translate = [0, 0] }) {
  const tileWidth = TILE_WIDTH * zoom;
  sprites.forEach((sprite) => {
    const imgWidth = sprite.width * zoom;
    const imgHeight = sprite.height * zoom;

    const [x, y] = getLoc(tileWidth, ...sprite.coord, 0, translate);

    const destX = x - imgWidth * sprite.nadir[0];
    const destY = y - imgHeight * sprite.nadir[1];

    context.drawImage(sprite.sprite, destX, destY, imgWidth, imgHeight);
  });
}

export default function WorldPreview({ dims, svg, zoom }) {
  const canvasRef = useRef();
  const [imgDims, setImgDims] = useState([0, 0]);
  const [handlers, translate, setTranslate] = usePan([0, 0], zoom);

  const [baseTile, setBaseTile] = useState(document.createElement("img"));
  useEffect(() => {
    browserLoadCanvas({ src: "/tile.png" }).then((baseTileSrc) =>
      setBaseTile(tileify(baseTileSrc))
    );
  }, []);

  useEffect(() => {
    setTranslate([0, 0]);
  }, imgDims);

  useEffect(() => {
    getDims(svg).then(setImgDims);
  }, [svg]);

  // draw graphic
  useEffect(() => {
    if (!canvasRef.current) return;
    (async () => {
      const img = await browserLoadImage({ svg });
      const nadir = await getNadir(svg);
      const baseTileDef = {
        width: baseTile.width,
        height: baseTile.height,
        sprite: baseTile,
        nadir: [0.5, 1],
      };

      const context = canvasRef.current.getContext("2d");

      context.fillStyle = "black";
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const tiles = [];
      const tileCount = 6;
      for (let x = 0; x < tileCount; x++) {
        for (let y = 0; y < tileCount; y++) {
          tiles.push({ coord: [x, y], ...baseTileDef });
        }
      }

      const newTranslate = [
        ((img.width * nadir[0]) / 2) * zoom + dims.width / 2 - translate[0],
        (img.height - TILE_WIDTH * 1.5) * zoom - translate[1],
      ];

      renderSprites({
        context,
        zoom,
        translate: newTranslate,
        sprites: [
          ...tiles,
          {
            coord: [3, 3],
            width: img.width,
            height: img.height,
            nadir: nadir,
            sprite: img,
          },
        ],
      });
    })();
  }, [svg, dims, zoom, baseTile, translate]);
  return (
    <canvas
      ref={canvasRef}
      width={dims.width}
      height={dims.height}
      {...handlers}
      style={{
        width: dims.width / 2 + "px",
        height: dims.height / 2 + "px",
      }}
    />
  );
}
