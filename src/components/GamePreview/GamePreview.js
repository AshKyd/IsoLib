import { useEffect, useRef } from "preact/hooks";
import Example from "../WorldPreview/phaser";
import { EngineInterface, EngineScene } from "../../engine";
import * as Phaser from "phaser";

export default function GamePreview() {
  const gameRoot = useRef();

  useEffect(() => {
    console.log("initialising engine");
    const engine = new EngineInterface(gameRoot.current);
  }, [gameRoot]);
  return <div ref={gameRoot}></div>;
}
