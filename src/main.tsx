import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { createApi } from "./api";
import "./styles.css";

// /api は vite が qata-server に中継する（vite.config.ts）。
const api = createApi(`${window.location.origin}/api`);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App api={api} pollMs={3000} />
  </StrictMode>,
);
