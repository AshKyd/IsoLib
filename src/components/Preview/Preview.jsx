import { useEffect, useState } from "preact/hooks";
import { paint } from "../../lib/paint";

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

    // Closure to capture the file information.
    reader.onload = (function (theFile) {
      return function (e) {
        setFile(e.target.result);
        setStatus("done");
      };
    })(files[0]);

    // Read in the image file as a data URL.
    reader.readAsText(files[0]);
  }

  return [onDrag, onDrop, file, status];
}

export function Preview({ opts }) {
  const [onDrag, onDrop, svg, status] = useDragDrop();

  const [recolouredFile, setRecolouredFile] = useState(null);

  useEffect(() => {
    if (!svg) {
      return;
    }

    const newFile = paint(svg, opts);
    setRecolouredFile(newFile);
  }, [svg, opts]);

  return (
    <div
      style={{
        minHeight: 256,
        minWidth: 256,
        border:
          status === "dragging"
            ? "1px solid cyan"
            : "1px solid var(--il-panel-border)",
        transform: opts.flip ? "scaleX(-1)" : "",
        transition: "border 0.5s",
      }}
      onDragOver={onDrag}
      onDrop={onDrop}
      dangerouslySetInnerHTML={{ __html: recolouredFile || "" }}
    ></div>
  );
}
