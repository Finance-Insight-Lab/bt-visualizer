import React from "react";
import CandlestickChart from "./candlestickPlot/CandlestickChart";
import EquityChart from "./equityPlot/EquityChart";

const App: React.FC = () => {
  return (
    <div>
      <h1>Backtest Vistualier</h1>
      <EquityChart />
      <CandlestickChart />
    </div>
  );
};

export default App;
