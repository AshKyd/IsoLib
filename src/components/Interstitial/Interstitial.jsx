import { useEffect, useRef } from "preact/hooks";
import "./Interstitial.css";

export default function Interstitial({ onClose }) {
  const modalEl = useRef();
  useEffect(() => {
    if (!modalEl.current) return;
    modalEl.current.showModal();
  }, [modalEl]);

  return (
    <div class="isolib-interstitial">
      <dialog
        class="isolib-interstitial__modal"
        ref={modalEl}
        onClick={(e) => {
          if (e.target === modalEl.current) {
            onClose();
          }
        }}
      >
        <div class="isolib-interstitial__top">
          <h1>IsoLib</h1>
          <p class="isolib-interstitial__sub">A sprite recolouriser</p>
        </div>
        <div class="isolib-interstitial__content">
          <div class="isolib-interstitial__container">
            <p>
              This app is both a technology preview &amp; showcase for my
              isometric vector art.
            </p>
            <p>
              Artworks are made in Inkscape, and use a specific colour palatte
              that gets replaced with the desired colours, similar to a chroma
              key.
            </p>
            <p>
              The app is built in <a href="https://preactjs.com/">Preact</a> and{" "}
              <a href="https://phaser.io/">Phaser</a>. My intention is to build
              out the tools and Phaser skills to eventually build a small game
              using these assets.{" "}
              <a href="https://github.com/AshKyd/IsoLib">Source code</a> is on
              Github.
            </p>
            <p>Please feel free to browse around and enjoy.</p>
          </div>
        </div>
        <div class="isolib-interstitial__bar">
          <div class="isolib-interstitial__container">
            <button onClick={onClose}>Ok</button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
