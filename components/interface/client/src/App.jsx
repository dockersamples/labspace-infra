import "./App.scss";
import { BrowserRouter, Route, Routes } from "react-router";
import AppRoute from "./AppRoute";
import { ConfigProvider } from "./ConfigContext";

function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route path=":sectionId?" element={<AppRoute />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
