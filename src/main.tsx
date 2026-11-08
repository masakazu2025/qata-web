import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { createApi } from "./api";
import "./styles.css";

const root = createRoot(document.getElementById("root")!);

if (import.meta.env.MODE === "demo") {
  // デモ版（npm run build:demo）。ブラウザの中の偽の server を使う。普通のビルドには入らない。
  void import("./demo").then(({ DemoApp, createDemo }) =>
    root.render(
      <StrictMode>
        <DemoApp demo={createDemo()} />
      </StrictMode>,
    ),
  );
} else {
  // /api は vite が qata-server に中継する（vite.config.ts）。
  const api = createApi(`${window.location.origin}/api`);
  root.render(
    <StrictMode>
      <App api={api} pollMs={3000} />
    </StrictMode>,
  );
}
