import "./App.scss";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import AppRoute from "./AppRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Navigate to="/workbook" replace />} />
        <Route path=":appId/:sectionId?" element={<AppRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
