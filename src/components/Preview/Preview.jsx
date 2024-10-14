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

function drawGrid(canvas, ctx, from) {
  console.log("drawing from", from);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#005555";

  for (
    let i = 0 - (canvas.width % GRID_WIDTH) * 2;
    i < canvas.width % GRID_WIDTH;
    i++
  ) {
    const xStart = (from[0] % GRID_WIDTH) + GRID_WIDTH * i;
    const yStart = from[1] % GRID_WIDTH;
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xStart + canvas.height * 2, yStart + canvas.height);
    ctx.stroke();
  }

  for (let i = 0; i < (canvas.width % GRID_WIDTH) * 2.5; i++) {
    const xStart = (from[0] % GRID_WIDTH) + GRID_WIDTH * i;
    const yStart = from[1] % GRID_WIDTH;
    ctx.beginPath();
    console.log(xStart, yStart);
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xStart - canvas.height * 2, yStart + canvas.height);
    ctx.stroke();
  }
}

export function Preview({ opts, setFile }) {
  const [onDrag, onDragLeave, onDrop, svg, status] = useDragDrop();

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
      console.log(canvasRef.current.width, canvasRef.current.height);

      const x = dims.width / 2 - img.width / 2;
      const y = dims.height / 2 - img.height / 2;
      context.fillStyle = "black";
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const nadir = await getNadir(recolouredFile);
      drawGrid(canvasRef.current, context, [nadir[0] + x, nadir[1] + y]);
      context.drawImage(img, x, y);
    })();
  }, [recolouredFile, dims]);

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
