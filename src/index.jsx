import { render } from "preact";

import "./style.css";
import { Preview } from "./components/Preview/Preview";
import Toolbar from "./components/Toolbar/Toolbar";
import { useEffect, useState } from "preact/hooks";
import Picker from "./components/Picker/Picker";
import Interstitial from "./components/Interstitial/Interstitial";
import { getBase64Url } from "./lib/util";

export function App() {
  const [opts, setOpts] = useState({});
  const [fileUrl, setFileUrl] = useState(null);

  console.log({ fileUrl });
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(
    (() => {
      try {
        return !localStorage.modalDismissed;
      } catch (e) {
        return true;
      }
    })()
  );

  useEffect(() => {
    if (!modalOpen) {
      try {
        localStorage.modalDismissed = true;
      } catch (e) {}
    }
  }, [modalOpen]);

  return (
    <>
      {modalOpen && <Interstitial onClose={() => setModalOpen(false)} />}
      <div class="isolib-app">
        <Toolbar
          value={opts}
          onChange={setOpts}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setModalOpen={setModalOpen}
        />
        <div class="error">{!!error && error.message}</div>
        <div class="isolib-app__main">
          <div
            class={[
              "isolib-app__main-child",
              sidebarOpen && "isolib-app__main-child--sidebar",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div class="isolib-app__sidebar">
              <Picker
                value={fileUrl}
                onChange={(val) => {
                  setFileUrl(val);
                  setSidebarOpen(false);
                }}
                onError={setError}
              />
            </div>
            <div class="isolib-app__preview">
              <Preview
                fileUrl={fileUrl}
                setFile={(file) => {
                  setFileUrl(getBase64Url(file));
                }}
                opts={opts}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

render(<App />, document.getElementById("app"));
