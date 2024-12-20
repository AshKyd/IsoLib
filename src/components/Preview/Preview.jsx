import { useEffect, useRef, useState } from "preact/hooks";
import { paint } from "../../lib/recolour";

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

export function Preview({ file, opts, setFile }) {
  const [onDrag, onDragLeave, onDrop, _svg, status] = useDragDrop();
  const [Component, setComponent] = useState();
  const zoom = opts.zoom || 1;

  const [recolouredFile, setRecolouredFile] = useState(null);

  const [dims, setDims] = useState({ width: 100, height: 100 });

  useEffect(() => {
    import("../WorldPreview/WorldPreview").then((imported) => {
      setComponent(() => imported.default);
    });
  }, []);

  useEffect(() => setFile(file), [file]);

  useEffect(() => {
    if (!file) {
      return;
    }

    const newFile = paint(file, opts);
    setRecolouredFile(newFile);
  }, [file, opts]);

  // update dims on window resize
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.contentRect.width) {
          setDims({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      });
    });
    observer.observe(document.querySelector(".isolib-app__main"));
    observer.observe(document.querySelector(".isolib-app__preview"));
    return () => observer.disconnect();
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
      {recolouredFile && Component && (
        <Component dims={dims} svg={recolouredFile} svgKey={file} zoom={zoom} />
      )}
    </div>
  );
}
