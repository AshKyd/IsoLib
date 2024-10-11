import { render } from "preact";

import "./style.css";
import { Preview } from "./components/Preview/Preview";
import Toolbar from "./components/Toolbar/Toolbar";
import { useState } from "preact/hooks";

export function App() {
  const [opts, setOpts] = useState({});
  return (
    <div class="isolib-app">
      <Toolbar value={opts} onChange={setOpts} />
      <div class="isolib-app__main">
        <Preview opts={opts} />
      </div>
    </div>
  );
}

render(<App />, document.getElementById("app"));
