import "./App.scss";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { IdePanel } from "./components/IdePanel/IdePanel";
import { WorkshopPanel } from "./components/WorkshopPanel/WorkshopPanel";
import { WorkshopContextProvider } from "./WorkshopContext";

function App() {
  return (
    <WorkshopContextProvider>
      <PanelGroup direction="horizontal">
        <Panel defaultSize={50} minSize={20} className="resizable-panel">
          <div className="overflow-auto position-relative">
            <WorkshopPanel />
          </div>
        </Panel>
        <PanelResizeHandle className="panel-resize-handle">
          <svg viewBox="0 0 24 24" data-direction="horizontal">
            <path
              fill="currentColor"
              d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2m-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2"
            ></path>
          </svg>
        </PanelResizeHandle>
        <Panel defaultSize={50} minSize={20} className="resizable-panel d-flex">
          <IdePanel />
        </Panel>
      </PanelGroup>
    </WorkshopContextProvider>
  );
}

export default App;
