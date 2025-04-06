import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  createSeriesMarkers,
  LineSeries,
  IChartApi,
  UTCTimestamp,
} from "lightweight-charts";
import Papa from "papaparse";

interface EquityData {
  time: UTCTimestamp;
  value: number;
}

interface EquityDataRaw {
  equity: string;
  time: string;
}

interface TradeMarker {
  time: UTCTimestamp;
  color: string;
  position: string;
  shape: string;
}

interface TradeLine {
  data: {
    time: UTCTimestamp;
    value: number;
  }[];
  color: string;
  dashed: boolean;
}

const EquityChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartApiRef = useRef<IChartApi>();
  const [data, setData] = useState<EquityData[]>([]);
  const [annotations, setAnnotations] = useState<TradeMarker[]>([]);
  const [tradeLines, setTradeLines] = useState<TradeLine[]>([]);
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

        setData(formattedData);
      },
    });
  };

  const handleStatsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result: any) => {
        const parsedTrades = result.data as {
          Id: number;
          EntryTime: string;
          ExitTime: string;
          EntryPrice: string;
          ExitPrice: string;
          Type: string;
        }[];

        const allTradeLines = parsedTrades.map((trade) => ({
          data: [
            {
              time: parseDatetime(trade.EntryTime),
              value: parseFloat(trade.EntryPrice),
            },
            {
              time: parseDatetime(trade.ExitTime),
              value: parseFloat(trade.ExitPrice),
            },
          ],
          color: trade.Type === "B" ? "green" : "red",
          dashed: true,
        }));

        const entryAnnotations = parsedTrades.map((trade) => ({
          time: parseDatetime(trade.EntryTime),
          color: trade.Type === "B" ? "green" : "red",
          position: trade.Type === "B" ? "belowBar" : "aboveBar",
          shape: trade.Type === "B" ? "arrowUp" : "arrowDown",
        }));

        setTradeLines(allTradeLines);
        setAnnotations(entryAnnotations);
      },
    });
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

    chartApiRef.current = chart;

    const series = chart.addSeries(LineSeries, {
      color: 'blue',
      lineWidth: 2,
      lineStyle: 0,
      lastValueVisible: false,
      priceLineVisible: false,
      priceFormat: {
        type: "price",
        precision: 2,
      },
    });
    series.setData(data);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      chart.remove();
    };
  }, [data, tradeLines]);

  return (
    <>
      <label
        style={{
          cursor: "pointer",
          color: "black",
          background: "#D3D3D3",
          padding: "8px 12px",
          borderRadius: "4px",
        }}
      >
        Upload Equity CSV
        <input
          type="file"
          accept=".csv"
          onChange={handleEquityUpload}
          style={{ display: "none" }}
        />
      </label>
      <label
        style={{
          cursor: "pointer",
          color: "black",
          background: "#D3D3D3",
          padding: "8px 12px",
          borderRadius: "4px",
          marginLeft: "10px",
        }}
      >
        Upload Stats CSV
        <input
          type="file"
          accept=".csv"
          onChange={handleStatsUpload}
          style={{ marginLeft: "10px", display: "none" }}
        />
      </label>

      <div
        ref={chartRef}
        style={{ width: "100%", height: "200px", marginTop: "20px" }}
      />
    </>
  );
};

export default EquityChart;
