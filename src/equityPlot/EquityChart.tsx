import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  createSeriesMarkers,
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

interface EquityDataRaw {
  equity: string;
  time: string;
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

  const handleEquityUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result: any) => {
        const parsedData = result.data as EquityDataRaw[];

        const formattedData: EquityData[] = parsedData.map((row) => ({
          time: parseDatetime(row.time),
          value: parseFloat(row.equity),
        }));

        setEquityCurve(formattedData);
      },
    });
    event.target.value = '';
  };

  const sanitizeKey = (key: string): string => {
    return key
      .trim()
      .replace(/\s+/g, "") // Remove spaces
      .replace(/[%().]/g, "") // Remove % ( ) . characters
      .replace(/[^a-zA-Z0-9_]/g, ""); // Remove any other non-alphanum/underscore
  };

  const handleStatsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (results: any) => {
        const raw_data = results.data as string[][];
        const parsed: any = {};

        raw_data.forEach(([key, value]) => {
          if (key && value) {
            parsed[sanitizeKey(key)] = value.trim();
          }
        });

        setStats(parsed);
      },
    });
    event.target.value = '';
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

    chart.subscribeDblClick(param => {
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
              setEquityCurve([])
              setStats(undefined)
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
