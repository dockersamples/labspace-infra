import "./App.scss";
import { BrowserRouter, Route, Routes } from "react-router";
import AppRoute from "./AppRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path=":sectionId?" element={<AppRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
