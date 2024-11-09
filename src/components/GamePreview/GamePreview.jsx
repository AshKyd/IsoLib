import { useEffect, useRef, useState } from "preact/hooks";
import { EngineInterface } from "../../engine";
import { usePan } from "../WorldPreview/usePan";
let alreadyLoaded = false;

export default function GamePreview({ fileUrl, opts }) {
  const gameRoot = useRef();
  const [engine, setEngine] = useState();
  const [handlers, translate, setTranslate] = usePan([0, 0], opts.zoom);

  useEffect(() => {
    if (alreadyLoaded) {
      location.reload();
    }
    alreadyLoaded = true;
  }, []);

  useEffect(() => {
    if (!engine) return;
    const { flip, time, zoom } = opts;
    console.log("setting time", opts.time);
    engine.setProps({ flip, time, zoom, translate });
    engine.scene.cameras.main.setScroll(...translate);
  }, [translate[0], translate[1], opts.time, opts.flip, opts.zoom, engine]);

  useEffect(() => {
    if (fileUrl && engine) {
      const { primary, secondary, alwaysLightUp } = opts;
      engine.request("addSprite", {
        type: "colourisedSvg",
        id: "main",
        sourceUrl: fileUrl,
        origin: [0.5, 1],
        tilePos: [4, 4],
        opts: {
          primary,
          secondary,
          alwaysLightUp,
        },
      });
    }
  }, [fileUrl, opts]);

  useEffect(() => {
    const engine = new EngineInterface(gameRoot.current, {
      tileWidth: 256,
      tilecount: 7,
    });
    setEngine(() => engine);
  }, [gameRoot]);
  return <div ref={gameRoot} {...handlers}></div>;
}
