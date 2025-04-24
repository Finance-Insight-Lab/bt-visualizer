import React from "react";
import CandlestickChart from "./candlestickPlot/CandlestickChart";
import EquityChart from "./equityPlot/EquityChart";

type AppProps = {
  equity: string;
  stats: string;
  ohlc: string;
  trades: string;
};

const App: React.FC<AppProps> = (props) => {
  const { equity, stats, ohlc, trades } = props;

  return (
    <div className="sm:p-0 p-4">
      <div className="relative flex items-center justify-between px-4 py-4 sm:flex-row flex-col gap-4 sm:gap-0">
        <h1 className="text-3xl sm:text-5xl font-bold text-center sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
          Backtest Visualizer
        </h1>
        <a
          href="https://github.com/Finance-Insight-Lab/bt-visualizer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-700 hover:text-black"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
          </svg>
          View on GitHub
        </a>
      </div>

      <EquityChart equityFile={equity} statsFile={stats} />
      <CandlestickChart ohlcFile={ohlc} tradesFile={trades}  />
    </div>
  );
};

export default App;
