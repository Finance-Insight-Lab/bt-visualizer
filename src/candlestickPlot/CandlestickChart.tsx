import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  createSeriesMarkers,
  LineSeries,
  IChartApi,
  UTCTimestamp,
} from "lightweight-charts";
import Papa from "papaparse";

interface CandlestickData {
  open: number;
  high: number;
  low: number;
  close: number;
  time: UTCTimestamp;
}

interface CandlestickDataRaw {
  open: string;
  high: string;
  low: string;
  close: string;
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

const CandlestickChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartApiRef = useRef<IChartApi>();
  const [data, setData] = useState<CandlestickData[]>([]);
  const [annotations, setAnnotations] = useState<TradeMarker[]>([]);
  const [tradeLines, setTradeLines] = useState<TradeLine[]>([]);

  const parseDatetime = (datetime: string): UTCTimestamp => {
    const localDate = new Date(datetime);
    return (localDate.getTime() / 1000) as UTCTimestamp;
  };

  const handleOHLCUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result: any) => {
        const parsedData = result.data as CandlestickDataRaw[];

        const formattedData: CandlestickData[] = parsedData.map((row) => ({
          time: parseDatetime(row.time),
          open: parseFloat(row.open),
          high: parseFloat(row.high),
          low: parseFloat(row.low),
          close: parseFloat(row.close),
        }));

        setData(formattedData);
      },
    });
  };

  const handleTradesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 400,
    });

    chartApiRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#4caf50",
      downColor: "#f44336",
      borderVisible: false,
      wickUpColor: "#4caf50",
      wickDownColor: "#f44336",
    });
    candleSeries.setData(data);

    const drawLine = (
      data: { time: UTCTimestamp; value: number }[],
      color = "blue",
      dashed = false
    ) => {
      const series = chart.addSeries(LineSeries, {
        color,
        lineWidth: 2,
        lineStyle: dashed ? 2 : 0, // 0 solid, 1 dotted, 2 dashed
        lastValueVisible: false,
        priceLineVisible: false,
      });
      series.setData(data);
    };

    tradeLines.forEach(({ data, color, dashed }) => {
      drawLine(data, color, dashed);
    });

    const drawTradeArrow = (
      time: UTCTimestamp,
      color: string = "blue",
      position = "aboveBar",
      shape = "arrowDown"
    ) => {
      const seriesMarkers = createSeriesMarkers(candleSeries, [
        {
          color: color,
          position: position,
          shape: shape,
          time: time,
        },
      ]);
    };

    annotations.forEach(({ time, color, position, shape }) => {
      drawTradeArrow(time, color, position, shape);
    });

    return () => chart.remove();
  }, [data, tradeLines]);

  return (
    <>
      <h2>Upload Files</h2>
      <input type="file" accept=".csv" onChange={handleOHLCUpload} />
      <input
        type="file"
        accept=".csv"
        onChange={handleTradesUpload}
        style={{ marginLeft: "10px" }}
      />

      <div ref={chartRef} style={{ width: "100%", height: "400px" }} />
    </>
  );
};

export default CandlestickChart;
