import React from "react";
import CandlestickChart from "./candlestickPlot/CandlestickChart";

const App: React.FC = () => {
  return (
    <div>
      <h1>Candlestick Chart</h1>
      <CandlestickChart />
    </div>
  );
};

export default App;
