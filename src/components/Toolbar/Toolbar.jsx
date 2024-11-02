import { useEffect } from "preact/hooks";
import "./Toolbar.css";
import { DAY, HOUR } from "../../lib/time";
const DEFAULTS = {
  flip: false,
  primary: "#aaaaaa",
  secondary: "#6BBBF5",
  time: 1000 * 60 * 60 * 12,
  alwaysLightUp: false,
  zoom: 1,
};

function getNiceTime(time) {
  const d = new Date(time);
  const hours = d.getUTCHours();
  return `${String(hours).padStart(2, "0")}:${String(
    d.getUTCMinutes()
  ).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
}
export default function Toolbar({
  value,
  onChange,
  sidebarOpen,
  setSidebarOpen,
  setModalOpen,
}) {
  useEffect(() => {
    if (!Object.keys(value).length) onChange(DEFAULTS);
  }, []);

  return (
    <form className="isolib-toolbar">
      <button
        class="isolib-app__sidebar-toggle"
        onClick={(e) => {
          e.preventDefault();
          setSidebarOpen(!sidebarOpen);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-three-dots"
          viewBox="0 0 16 16"
        >
          <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
        </svg>
      </button>
      <h1 className="isolib-toolbar__title">
        <span class="isolib-toolbar__title-a">IsoLib</span>{" "}
        <span class="isolib-toolbar__title-b">recolouriser</span>
      </h1>
      <label for="time" className="isolib-toolbar__item">
        Hour <span class="isolib-toolbar__time">{getNiceTime(value.time)}</span>
        <input
          type="range"
          min="0"
          max={DAY}
          id="time"
          value={value.time}
          onChange={(e) => onChange({ ...value, time: Number(e.target.value) })}
          step={HOUR / 2}
        />
      </label>

      <input
        className="isolib-toolbar__item"
        type="color"
        value={value.primary}
        onChange={(e) => onChange({ ...value, primary: e.target.value })}
        id="col1"
      />

      <input
        className="isolib-toolbar__item"
        type="color"
        value={value.secondary}
        onChange={(e) => onChange({ ...value, secondary: e.target.value })}
        id="col2"
      />

      <label for="flipped" className="isolib-toolbar__item">
        Flip
        <input
          type="checkbox"
          name="flipped"
          checked={value.flip}
          onChange={(e) => onChange({ ...value, flip: e.target.checked })}
        />
      </label>
      <label for="time" className="isolib-toolbar__item">
        Zoom{" "}
        <span style={{ minWidth: "2em", textAlign: "right" }}>
          {value.zoom}
        </span>
        <input
          type="range"
          min="0.5"
          max={5}
          id="zoom"
          value={value.zoom}
          onChange={(e) => onChange({ ...value, zoom: Number(e.target.value) })}
          step={0.1}
        />
      </label>
      <div class="isolib-toolbar__flex"></div>
      <button
        className="isolib-toolbar__button"
        onClick={(e) => {
          e.preventDefault();
          setModalOpen(true);
        }}
      >
        ⓘ
      </button>
    </form>
  );
}
