import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./app/store.ts";
import { BrowserRouter, Route, Routes } from "react-router";
import { TableView } from "./components/table_view.tsx";
import { Layout } from "./layouts/layout.tsx";
import { CanvasView } from "./components/graph/canvas_view.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<App />} />
            <Route path="/table" element={<TableView />} />
            <Route path="/graph" element={<CanvasView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
