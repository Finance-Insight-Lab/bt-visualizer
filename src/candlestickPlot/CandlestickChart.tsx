import React, { useState } from "react";
import Chart from "react-apexcharts";
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
    shape: "triangle";
  };
}

const CandlestickChart: React.FC = () => {
  const [ohlcData, setOhlcData] = useState<CandlestickData[]>([]);
  const [annotations, setAnnotations] = useState<TradeMarker[]>([]);

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
        const parsedData = result.data as { Open: string; High: string; Low: string; Close: string; Datetime: string }[];

        const formattedData: CandlestickData[] = parsedData.map((row) => ({
          x: parseDatetime(row.Datetime),
          y: [parseFloat(row.Open), parseFloat(row.High), parseFloat(row.Low), parseFloat(row.Close)],
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
      complete: (result) => {
        const parsedTrades = result.data as { Datetime: string; Type: string; Price: string }[];

        const tradeAnnotations = parsedTrades.map((trade) => ({
          x: parseDatetime(trade.Datetime),
          y: parseFloat(trade.Price),
          marker: {
            size: 9,
            fillColor: trade.Type === "B" ? "green" : "red",
            shape: "square",
          },
        }));

        setAnnotations(tradeAnnotations);
      },
    });
  };

  const options = {
    chart: {
      type: "candlestick",
      height: 400,
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
  };

  return (
    <div>
      <h2>Upload Files</h2>
      <input type="file" accept=".csv" onChange={handleOHLCUpload} />
      <input type="file" accept=".csv" onChange={handleTradesUpload} style={{ marginLeft: "10px" }} />

      {ohlcData.length > 0 && (
        <Chart
          options={options}
          series={[{ name: "Candlestick", type: "candlestick", data: ohlcData }]}
          type="candlestick"
          height={400}
        />
      )}
    </div>
  );
};

export default CandlestickChart;
