import React, { useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import Papa from "papaparse";

interface CandlestickData {
  x: number;
  y: [number, number, number, number];
}

interface TradeMarker {
  x: number;
  y: number;
  marker: {
    size: number;
    fillColor: string;
    shape: string;
  };
}

interface TradeLine {
  name: string;
  data:{
      x: number;
      y: number;
    }[];
  type: string;
}

const CandlestickChart: React.FC = () => {
  const [ohlcData, setOhlcData] = useState<CandlestickData[]>([]);
  const [annotations, setAnnotations] = useState<TradeMarker[]>([]);
  const [tradeLines, setTradeLines] = useState<TradeLine[]>([]);

  const parseDatetime = (datetime: string): number => {
    const localDate = new Date(datetime);
    return localDate.getTime();
  };

  const handleOHLCUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsedData = result.data as {
          Open: string;
          High: string;
          Low: string;
          Close: string;
          Datetime: string;
        }[];

        const formattedData: CandlestickData[] = parsedData.map((row) => ({
          x: parseDatetime(row.Datetime),
          y: [
            parseFloat(row.Open),
            parseFloat(row.High),
            parseFloat(row.Low),
            parseFloat(row.Close),
          ],
        }));

        setOhlcData(formattedData);
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
              x: parseDatetime(trade.EntryTime),
              y: parseFloat(trade.EntryPrice),
            },
            {
              x: parseDatetime(trade.ExitTime),
              y: parseFloat(trade.ExitPrice),
            },
          ],
          name: `trade-${trade.Id}`,
          type: "line",
        }));

        const entryAnnotations = parsedTrades.map((trade) => ({
          x: parseDatetime(trade.EntryTime),
          y: parseFloat(trade.EntryPrice),
          marker: {
            size: 5,
            fillColor: trade.Type === "B" ? "green" : "red",
            shape: "sparkle",
          },
        }));
        
        const exitAnnotations = parsedTrades.map((trade) => ({
          x: parseDatetime(trade.ExitTime),
          y: parseFloat(trade.ExitPrice),
          marker: {
            size: 5,
            fillColor: trade.Type === "B" ? "green" : "red",
            shape: "diamond",
          },
        }));

        setTradeLines(allTradeLines)

        const tradeAnnotations = [...entryAnnotations, ...exitAnnotations];
        setAnnotations(tradeAnnotations);
      },
    });
  };

  const options = {
    chart: {
      type: "candlestick",
      height: 400,
    },
    title: {
      align: "left",
    },
    xaxis: {
      type: "datetime",
      labels: {
        format: "dd MMM HH:mm",
      },
    },
    annotations: {
      points: annotations,
    },
    stroke: {
      curve: "straight",
      width: [1, ...tradeLines.map(() => 3)],
    },
    colors: ["#008FFB", ...tradeLines.map(() => "#FF4560")],
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div>
      <h2>Upload Files</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleOHLCUpload}
      />
      <input
        type="file"
        accept=".csv"
        onChange={handleTradesUpload}
        style={{ marginLeft: "10px" }}
      />

      {ohlcData.length > 0 && (
        <Chart
          options={options}
          series={[
            { name: "Candlestick", type: "candlestick", data: ohlcData },
            ...tradeLines,
          ]}
          type="candlestick"
          height={400}
        />
      )}
    </div>
  );
};

export default CandlestickChart;
