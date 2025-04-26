import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

class BtVisualizer extends HTMLElement {
  mountPoint: HTMLDivElement;

  constructor() {
    super();
    this.mountPoint = document.createElement("div");

    const shadowRoot = this.attachShadow({ mode: "open" });

    // Inject CSS file into shadow DOM
    const linkEl = document.createElement("link");
    linkEl.setAttribute("rel", "stylesheet");
    linkEl.setAttribute("href", new URL("./bt-visualizer.css", import.meta.url).toString());

    shadowRoot.appendChild(linkEl);
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
      const response = await fetch(input, {
        mode: 'no-cors'
      });
      return await response.text();
    }
    return input;
  }
}

customElements.define("bt-visualizer", BtVisualizer);
(window as any).BtVisualizer = BtVisualizer;
export default BtVisualizer;
