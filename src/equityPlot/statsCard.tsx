import React from "react";
import { TradeStats } from "./tradeStats";

type Props = {
  stats: TradeStats | undefined;
};

const TradeStatsCard: React.FC<Props> = ({ stats }) => {
  if (!stats) return;
  const previewKeys: (keyof TradeStats)[] = [
    "Return",
    "Trades",
    "WinRate",
    "MaxDrawdown",
  ];

  return (
    <div className="relative group w-fit text-xs">
      {/* Visible Compact Summary */}
      <div className="grid grid-cols-4 gap-3 bg-gray-100 text-gray-800 px-4 py-3 rounded-xl shadow-sm border border-gray-300">
        {previewKeys.map((key) => (
          <div
            key={key}
            className="flex flex-col items-center justify-center text-center"
          >
            <span className="text-gray-500 text-[10px] uppercase tracking-wide">
              {key}
            </span>
            <span className="font-bold text-[13px] text-gray-900">
              {stats[key]}
            </span>
          </div>
        ))}
      </div>

      {/* Full Tooltip on Hover */}
      <div className="absolute z-10 top-full mt-2 left-0 hidden group-hover:flex flex-col bg-white rounded-md shadow-lg border p-4 max-w-xs text-xs">
        {Object.entries(stats).map(([key, value]) => (
          <div
            key={key}
            className="flex justify-between gap-2 py-0.5 border-b border-gray-100"
          >
            <span className="text-gray-500">{key}</span>
            <span className="text-gray-800 text-right">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeStatsCard;
