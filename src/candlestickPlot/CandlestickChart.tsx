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
  tradeId: number;
  tradeType: string;
  entryPrice: string;
  exitPrice: string;
  Size: string;
  PnL: string;
  TP: string | null;
  SL: string | null;
  ReturnPct: string;
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
  const [width, setWidth] = useState(window.innerWidth);

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
          Size: string;
          PnL: string;
          TP: string | null;
          SL: string | null;
          ReturnPct: string;
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
          tradeId: trade.Id,
          entryPrice: trade.EntryPrice,
          exitPrice: trade.ExitPrice,
          tradeType: trade.Type === "B" ? "Buy" : "Sell",
          Size: trade.Size,
          PnL: trade.PnL,
          TP: trade.TP,
          SL: trade.SL,
          ReturnPct: trade.ReturnPct,
        }));

        setTradeLines(allTradeLines);
        setAnnotations(entryAnnotations);
      },
    });
  };

  const createTooltip = () => {
    const container = document.getElementById('container');
    if (!container) return;
  
    const tooltip = document.createElement('div');
    tooltip.id = 'trade-tooltip';
    tooltip.style.cssText = `
      width: 160px;
      min-height: 80px;
      position: absolute;
      display: none;
      padding: 8px;
      box-sizing: border-box;
      font-size: 12px;
      text-align: left;
      z-index: 1000;
      pointer-events: none;
      border: 1px solid rgb(224, 224, 224);
      border-radius: 2px;
      background: black;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    `;
    container.appendChild(tooltip);
  };  

  const showTradeTooltip = (trade: TradeMarker, x: number, y: number) => {
    const tooltip = document.getElementById("trade-tooltip");
    const container = document.getElementById("container");
    if (!tooltip || !container) return;
  
    const rect = container.getBoundingClientRect();
    tooltip.style.left = `${rect.left + x + 10}px`;
    tooltip.style.top = `${rect.top + y + 10}px`;
    tooltip.style.display = "block";
  
    tooltip.innerHTML = `
      <strong>${trade.tradeType.toUpperCase()}</strong><br/>
      ID: ${trade.tradeId}<br/>
      Entry Price: ${trade.entryPrice}<br/>
      Exit Price: ${trade.exitPrice}<br/>
      Size: ${trade.Size}<br/>
      PnL: ${trade.PnL}<br/>
      TP: ${trade.TP}<br/>
      SL: ${trade.SL}<br/>
      ReturnPct: ${trade.ReturnPct}<br/>
    `;
  };

  const hideTooltip = () => {
    const tooltip = document.getElementById("trade-tooltip");
    if (tooltip) {
      tooltip.style.display = "none";
    }
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
      height: 500,
      autoSize: true,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        minBarSpacing: 0,
      },
    });
    chart.timeScale().fitContent();
    createTooltip()

    chartApiRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#4caf50",
      downColor: "#f44336",
      borderVisible: false,
      wickUpColor: "#4caf50",
      wickDownColor: "#f44336",
      priceLineVisible: false,
      lastValueVisible: false,
      priceFormat: {
        type: "price",
        precision: 5,
        minMove: 0.00001,
      },
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

    createSeriesMarkers(candleSeries, annotations);

    chart.subscribeCrosshairMove(param => {
      // Hide if we're outside of chart
      if (!param || !param.time || !param.point || !param.seriesData) {
        hideTooltip();
        return;
      }
      const hoveredTime = param.time;
      const matchingTrade = annotations.find(trade => trade.time === hoveredTime);

      if (matchingTrade) {
        showTradeTooltip(matchingTrade, param.point.x, param.point.y);
      } else {
        hideTooltip();
      }
      if (matchingTrade?.time !== param.time) hideTooltip()
    });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      chart.remove();
    };
  }, [data, tradeLines]);

  return (
    <>

      <div className="flex justify-center items-center gap-4 flex-wrap">
        <label className="cursor-pointer text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm transition-colors">
          Upload OHLC CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleOHLCUpload}
            className="hidden"
          />
        </label>

        <label className="cursor-pointer text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg shadow-sm transition-colors">
          Upload Trades CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleTradesUpload}
            className="hidden"
          />
        </label>
      </div>
      <div
        id="container"
        ref={chartRef}
        style={{ width: "100%", height: "500px", marginTop: "20px" }}
      />
    </>
  );
};

export default CandlestickChart;
