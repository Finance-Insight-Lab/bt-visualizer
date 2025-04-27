import "./index.css";
import css from "./index.css?inline";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

class BtVisualizer extends HTMLElement {
  mountPoint: HTMLDivElement;

  constructor() {
    super();
    this.mountPoint = document.createElement("div");

    const shadowRoot = this.attachShadow({ mode: "open" });

    const styleEl = document.createElement("style");
    styleEl.textContent = css;
    shadowRoot.appendChild(styleEl);
    shadowRoot.appendChild(this.mountPoint);
  }

  connectedCallback() {
    const equityAttr = this.getAttribute("equity") || "";
    const statsAttr = this.getAttribute("stats") || "";
    const ohlcAttr = this.getAttribute("ohlc") || "";
    const tradesAttr = this.getAttribute("trades") || "";
  
    Promise.all([
      this.loadData(equityAttr),
      this.loadData(statsAttr),
      this.loadData(ohlcAttr),
      this.loadData(tradesAttr),
    ]).then(([equity, stats, ohlc, trades]) => {
      const root = createRoot(this.mountPoint);
      root.render(
        <React.StrictMode>
          <App equity={equity} stats={stats} ohlc={ohlc} trades={trades} />
        </React.StrictMode>
      );
    });
  }
  
  async loadData(input: string): Promise<string> {
    if (input.trim().startsWith("http") || input.trim().startsWith("./")) {
      const response = await fetch(input);
      return await response.text();
    }
    return input;
  }
}

customElements.define("bt-visualizer", BtVisualizer);
(window as any).BtVisualizer = BtVisualizer;
export default BtVisualizer;
