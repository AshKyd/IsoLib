import { useEffect, useRef, useState } from "preact/hooks";
import { EngineInterface, EngineScene } from "../../engine";
import * as Phaser from "phaser";
import { usePan } from "../WorldPreview/usePan";
import { getBase64Url } from "../../lib/util";

export default function GamePreview({ fileUrl, opts }) {
  const gameRoot = useRef();
  const [engine, setEngine] = useState();
  const [handlers, translate, setTranslate] = usePan([0, 0], opts.zoom);

  useEffect(() => {
    if (!engine) return;
    const { flip, time, zoom } = opts;
    engine.request("setProps", { flip, time, zoom, translate });
    console.log("scrolling", translate);
    engine.scene.cameras.main.setScroll(...translate);
  }, [translate, zoom, engine]);

  useEffect(() => {
    if (fileUrl && engine) {
      const { primary, secondary, alwaysLightUp } = opts;
      engine.request("addSprite", {
        type: "colourisedSvg",
        id: "main",
        sourceUrl: fileUrl,
        origin: [0.5, 1],
        pos: [0, 0],
        opts: {
          primary,
          secondary,
          alwaysLightUp,
        },
      });
    }
  }, [fileUrl]);

  useEffect(() => {
    const engine = new EngineInterface(gameRoot.current);
    setEngine(() => engine);
  }, [gameRoot]);
  return <div ref={gameRoot} {...handlers}></div>;
}
