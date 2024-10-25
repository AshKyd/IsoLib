import { useRef, useState } from "preact/hooks";

export function usePan(initialTranslate = [0, 0], zoom = 1) {
  const [translate, setTranslate] = useState([...initialTranslate]);
  const startPos = useRef(null);
  const startTime = useRef(null);
  const inputEvent = useRef(null);

  function handler(e, action) {
    const target = e.touches?.[0] || e;
    const cursorPos = [target.clientX, target.clientY];
    console.log({ e });
    switch (action) {
      case "start":
        startTime.current = Date.now();
        startPos.current = cursorPos;
        e.preventDefault();
        break;
      case "stop":
      case "move":
        if (!startPos.current) return false;

        const xOffset = startPos.current[0] - cursorPos[0];
        const yOffset = startPos.current[1] - cursorPos[1];
        setTranslate((translate) => [
          translate[0] + xOffset / zoom,
          translate[1] + yOffset / zoom,
        ]);

        if (xOffset || yOffset) {
          inputEvent.current = "move";
        }

        startPos.current = cursorPos;
        if (action == "stop") {
          startPos.current = null;
        }
        break;
      case "click":
        if (inputEvent.current != "move") {
          console.log("click");
        }

        inputEvent.current = undefined;
        break;
    }
    e.preventDefault();
  }

  const handlers = {
    onMouseDown: (e) => handler(e, "start"),
    onMouseUp: (e) => handler(e, "stop"),
    onMouseOut: (e) => handler(e, "stop"),
    onMouseMove: (e) => handler(e, "move"),
    onClick: (e) => handler(e, "click"),
    onTouchStart: (e) => handler(e, "start"),
    onTouchStop: (e) => handler(e, "stop"),
    onTouchMove: (e) => handler(e, "move"),
  };

  return [handlers, translate, setTranslate];
}
