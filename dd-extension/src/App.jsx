import "./App.scss";
import { DockerContextProvider } from "./DockerContext";
import { Home } from "./Home";

function App() {
  return (
    <DockerContextProvider>
      <Home />
    </DockerContextProvider>
  );
}

export default App;
