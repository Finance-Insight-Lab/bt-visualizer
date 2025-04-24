import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App
      equity="/bt-visualizer/equity_curve.csv"
      stats="/bt-visualizer/stats.csv"
      ohlc="/bt-visualizer/ohlc.csv"
      trades="/bt-visualizer/trades.csv"
    />
  </StrictMode>
);
