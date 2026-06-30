import "./App.scss";
import { BrowserRouter, Route, Routes } from "react-router";
import AppRoute from "./AppRoute";
import ExportRoute from "./ExportRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="export" element={<ExportRoute />} />
        <Route path=":sectionId?" element={<AppRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
