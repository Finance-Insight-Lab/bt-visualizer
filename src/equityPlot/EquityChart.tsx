import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  LineSeries,
  IChartApi,
  UTCTimestamp,
} from "lightweight-charts";
import Papa from "papaparse";
import TradeStatsCard from "./statsCard";
import { TradeStats } from "./tradeStats";

interface EquityData {
  time: UTCTimestamp;
  value: number;
}

const EquityChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartApiRef = useRef<IChartApi>(null);
  const [equityCurve, setEquityCurve] = useState<EquityData[]>([]);
  const [stats, setStats] = useState<TradeStats>();
  const [width, setWidth] = useState(window.innerWidth);

  const parseDatetime = (datetime: string): UTCTimestamp => {
    const localDate = new Date(datetime);
    return (localDate.getTime() / 1000) as UTCTimestamp;
  };

  const findKey = (row: Record<string, any>, target: string): string => {
    return (
      Object.keys(row).find(
        (key) => key.trim().toLowerCase() === target.toLowerCase()
      ) || ""
    );
  };

  const parseEquity = (file: File | string) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result: any) => {
        const parsedData = result.data as Record<string, string>[];

        const formattedData: EquityData[] = parsedData.map((row) => {
          const keys = Object.keys(row);
          const timeKey =
            keys.find((key) => key.trim().toLowerCase() === "time") || keys[0];

          return {
            time: parseDatetime(row[timeKey]),
            value: parseFloat(row[findKey(row, "Equity")] || "0"),
          };
        });
        setEquityCurve(formattedData);
      },
    });
  };

  const handleEquityUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    parseEquity(file);
    event.target.value = "";
  };

  const sanitizeKey = (key: string): string => {
    return key
      .trim()
      .replace(/\s+/g, "") // Remove spaces
      .replace(/[%().]/g, "") // Remove % ( ) . characters
      .replace(/[^a-zA-Z0-9_]/g, ""); // Remove any other non-alphanum/underscore
  };

  const parseStats = (file: File | string) => {
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (results: any) => {
        const raw_data = results.data as string[][];
        const parsed: any = {};
        const exclude_keys = ["_equity_curve", "_trades"];
        raw_data.forEach(([key, value]) => {
          if (key && value) {
            const sanitizedKey = sanitizeKey(key);
            if (!exclude_keys.find((key) => key === sanitizedKey)) {
              parsed[sanitizeKey(key)] = value.trim();
            }
          }
        });

        setStats(parsed);
      },
    });
  };

  const handleStatsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    parseStats(file);
    event.target.value = "";
  };

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    const handleResize = () => {
      chart.applyOptions({ width: chartRef.current?.clientWidth });
    };

    const chart = createChart(chartRef.current, {
      width: width,
      height: 200,
      autoSize: true,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        minBarSpacing: 0,
      },
    });
    chart.timeScale().fitContent();

    chart.subscribeDblClick((param) => {
      if (!param || !param.time) return;
      chart.timeScale().fitContent();
    });

    chartApiRef.current = chart;

    const series = chart.addSeries(LineSeries, {
      color: "blue",
      lineWidth: 2,
      lineStyle: 0,
      lastValueVisible: false,
      priceLineVisible: false,
      priceFormat: {
        type: "price",
        precision: 2,
      },
    });
    series.setData(equityCurve);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      chart.remove();
    };
  }, [equityCurve, stats]);

  useEffect(() => {
    fetch("/bt-visualizer/equity_curve.csv")
      .then((res) => res.text())
      .then((text) => {
        parseEquity(text);
      });
    fetch("/bt-visualizer/stats.csv")
      .then((res) => res.text())
      .then((text) => {
        parseStats(text);
      });
  }, []);

  return (
    <>
      <div className="flex justify-center items-center gap-4 flex-wrap framer-motion">
        <label className="cursor-pointer text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm transition-colors">
          Upload Equity CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleEquityUpload}
            className="hidden"
          />
        </label>

        <label className="cursor-pointer text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg shadow-sm transition-colors">
          Upload Stats CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleStatsUpload}
            className="hidden"
          />
        </label>
        <label className="cursor-pointer text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg shadow-sm transition-colors">
          Reset Data
          <button
            onClick={() => {
              setEquityCurve([]);
              setStats(undefined);
            }}
            className="hidden"
          />
        </label>
        <TradeStatsCard stats={stats} />
      </div>

      <div
        ref={chartRef}
        style={{ width: "100%", height: "200px", marginTop: "20px" }}
      />
    </>
  );
};

export default EquityChart;
