import { useEffect, useRef, useState } from "preact/hooks";
import { paint } from "../../lib/paint";
import * as Canvg from "canvg";
import { getDims, getNadir } from "../../lib/rectify";

const GRID_WIDTH = 64;

function useDragDrop() {
  const [status, setStatus] = useState("ready");
  const [file, setFile] = useState(null);

  function onDrag(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setStatus("dragging");
  }
  function onDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    const files = e.dataTransfer.files;

    const reader = new FileReader();

    reader.onload = function (e) {
      setFile(e.target.result);
      setStatus("done");
    };

    reader.readAsText(files[0]);
  }
  function onDragLeave() {
    setStatus("ready");
  }

  return [onDrag, onDragLeave, onDrop, file, status];
}

function drawGrid(canvas, ctx, from, zoom) {
  console.log("drawing from", from);
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
    console.log(xStart, yStart);
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xStart - canvas.height * 2, yStart + canvas.height);
    ctx.stroke();
  }
}

export function Preview({ opts, setFile }) {
  const [onDrag, onDragLeave, onDrop, svg, status] = useDragDrop();
  const zoom = opts.zoom || 1;

  const [recolouredFile, setRecolouredFile] = useState(null);
  const canvasRef = useRef();

  const [dims, setDims] = useState({ width: 100, height: 100 });

  useEffect(() => setFile(svg), [svg]);

  useEffect(() => {
    if (!svg) {
      return;
    }

    const newFile = paint(svg, opts);
    setRecolouredFile(newFile);
  }, [svg, opts]);

  useEffect(() => {
    const listener = () => {
      const rect = document
        .querySelector(".isolib-app__main")
        .getBoundingClientRect();
      setDims({
        width: rect.width * window.devicePixelRatio,
        height: rect.height * window.devicePixelRatio,
      });
    };
    listener();
    window.addEventListener("resize", listener);

    return () => window.removeEventListener("resize", listener);
  }, []);

  useEffect(() => {
    if (!recolouredFile) {
      return;
    }
    (async () => {
      if (!recolouredFile) {
        return;
      }
      const img = await new Promise((resolve, reject) => {
        const img = document.createElement("img");
        img.addEventListener("error", (e) => {
          console.error("image failed to load", e);
          reject(e);
        });
        img.addEventListener("load", () => resolve(img));
        img.src = "data:image/svg+xml;base64," + btoa(recolouredFile || "");
      });

      const context = canvasRef.current.getContext("2d");

      const imgWidth = img.width * zoom;
      const imgHeight = img.height * zoom;

      const x = dims.width / 2 - imgWidth / 2;
      const y = dims.height / 2 - imgHeight / 2;
      context.fillStyle = "black";
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const nadir = await getNadir(recolouredFile);
      drawGrid(
        canvasRef.current,
        context,
        [nadir[0] * zoom + x, nadir[1] * zoom + y],
        zoom
      );
      context.drawImage(img, x, y, imgWidth, imgHeight);
    })();
  }, [recolouredFile, dims, zoom]);

  console.log();
  return (
    <div
      style={{
        minHeight: 256,
        minWidth: 256,
        background: status === "dragging" ? "cyan" : "transparent",
        transform: opts.flip ? "scaleX(-1)" : "",
        transition: "background 0.5s",
      }}
      onDragOver={onDrag}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <canvas
        ref={canvasRef}
        width={dims.width}
        height={dims.height}
        style={{
          width: dims.width / 2 + "px",
          height: dims.height / 2 + "px",
        }}
      />
    </div>
  );
}
