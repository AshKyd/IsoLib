import { useEffect } from "preact/hooks";
import "./Toolbar.css";
const DEFAULTS = {
  flip: false,
  primary: "#aaaaaa",
  secondary: "#6BBBF5",
  time: 0,
  alwayslightup: false,
};
export default function Toolbar({ value, onChange }) {
  useEffect(() => {
    if (!Object.keys(value).length) onChange(DEFAULTS);
  }, []);

  return (
    <form className="isolib-toolbar">
      <h1 className="isolib-toolbar__title">
        <span class="isolib-toolbar__title-a">IsoLib</span>{" "}
        <span class="isolib-toolbar__title-b">recolouriser</span>
      </h1>
      <label for="time" className="isolib-toolbar__item">
        Hour <span class="isolib-toolbar__nowrap">(0-23)</span>
        <input
          type="range"
          min="0"
          max="239900"
          id="time"
          value={value.time * 10000}
          onChange={(e) => onChange({ ...value, time: e.target.value / 10000 })}
          step="5000"
        />
      </label>
      <div className="isolib-toolbar__item">
        <input
          type="color"
          value={value.primary}
          onChange={(e) => onChange({ ...value, primary: e.target.value })}
          id="col1"
        />
      </div>

      <div className="isolib-toolbar__item">
        <input
          type="color"
          value={value.secondary}
          onChange={(e) => onChange({ ...value, secondary: e.target.value })}
          id="col2"
        />
      </div>
      <label for="flipped" className="isolib-toolbar__item">
        Flip
        <input
          type="checkbox"
          name="flipped"
          checked={value.flip}
          onChange={(e) => onChange({ ...value, flip: e.target.checked })}
        />
      </label>
    </form>
  );
}
