import { useEffect, useRef, useState } from "preact/hooks";
import { paint } from "../../lib/recolour";
import WorldPreview from "../WorldPreview/WorldPreview";

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

  // update dims on window resize
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
      {recolouredFile && (
        <WorldPreview dims={dims} svg={recolouredFile} zoom={zoom} />
      )}
    </div>
  );
}
