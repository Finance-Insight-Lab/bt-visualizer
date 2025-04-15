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

interface TradeData {
  Id: string;
  EntryTime: UTCTimestamp;
  ExitTime: UTCTimestamp;
  EntryPrice: number;
  ExitPrice: number;
  Size: number;
  PnL: string;
  TP: string | null;
  SL: string | null;
  ReturnPct: string;
}

type markerPosition = "belowBar" | "aboveBar";
type markerShape = "arrowUp" | "arrowDown"

interface TradeMarker {
  time: UTCTimestamp;
  price: number;
  exitTime: UTCTimestamp;
  color: string;
  position: markerPosition;
  shape: markerShape;
  id: string;
  tradeType: string;
  entryPrice: number;
  exitPrice: number;
  Size: number;
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

interface precisionPrice {
  minMove : number,
  precision: number,
}

const CandlestickChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartApiRef = useRef<IChartApi>(null);
  const [data, setData] = useState<CandlestickData[]>([]);
  const [annotations, setAnnotations] = useState<TradeMarker[]>([]);
  const [tradeLines, setTradeLines] = useState<TradeLine[]>([]);
  const [width, setWidth] = useState(window.innerWidth);

  const parseDatetime = (datetime: string): UTCTimestamp => {
    const localDate = new Date(datetime);
    return (localDate.getTime() / 1000) as UTCTimestamp;
  };

  const findKey = (row: Record<string, any>, target: string): string => {
    return Object.keys(row).find((key) => key.trim().toLowerCase() === target.toLowerCase()) || '';
  };

  const parseOhlc = (file: File | string) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result: any) => {
        const parsedData = result.data as Record<string, string>[];
  
        const formattedData: CandlestickData[] = parsedData.map((row) => {
          const keys = Object.keys(row);
          const timeKey = keys.find((key) => key.trim().toLowerCase() === 'time') || keys[0];

          return {
            time: parseDatetime(row[timeKey]),
            open: parseFloat(row[findKey(row, 'open')] || '0'),
            high: parseFloat(row[findKey(row, 'high')] || '0'),
            low: parseFloat(row[findKey(row, 'low')] || '0'),
            close: parseFloat(row[findKey(row, 'close')] || '0'),
          };
        });
        setData(formattedData);
      },
    });
  }

  const handleOHLCUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    parseOhlc(file);
    event.target.value = '';
  };

  const parseTrades = (file: File | string) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result: any) => {
        const parsedData = result.data as Record<string, string>[];

        const parsedTrades: TradeData[] = parsedData.map((row) => {
          const keys = Object.keys(row);
          const idKey = keys.find((key) => key.trim().toLowerCase() === 'id') || keys[0];

          return {
            Id: row[idKey],
            EntryTime: parseDatetime(row[findKey(row, 'EntryTime')]),
            ExitTime: parseDatetime(row[findKey(row, 'ExitTime')]),
            EntryPrice: parseFloat(row[findKey(row, 'EntryPrice')] || '0'),
            ExitPrice: parseFloat(row[findKey(row, 'ExitPrice')] || '0'),
            Type: row[findKey(row, 'Type')],
            Size: parseFloat(row[findKey(row, 'Size')]),
            PnL: row[findKey(row, 'PnL')],
            TP: row[findKey(row, 'TP')],
            SL: row[findKey(row, 'SL')],
            ReturnPct: row[findKey(row, 'ReturnPct')],
          };
        });

        const allTradeLines = parsedTrades.map((trade) => ({
          data: [
            {
              time: trade.EntryTime,
              value: trade.EntryPrice,
            },
            {
              time: trade.ExitTime,
              value: trade.ExitPrice,
            },
          ],
          color: trade.Size > 0 ? "green" : "red",
          dashed: true,
        }));

        const entryAnnotations = parsedTrades.map((trade) => ({
          time: trade.EntryTime,
          price: trade.EntryPrice,
          exitTime: trade.ExitTime,
          size: 1.5,
          color: trade.Size > 0 ? "green" : "red",
          position: trade.Size > 0 ? "belowBar" : "aboveBar" as markerPosition,
          shape: trade.Size > 0 ? "arrowUp" : "arrowDown" as markerShape,
          id: trade.Id,
          entryPrice: trade.EntryPrice,
          exitPrice: trade.ExitPrice,
          tradeType: trade.Size > 0 ? "Buy" : "Sell",
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
  }

  const handleTradesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    parseTrades(file);
    event.target.value = '';
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
      ID: ${trade.id}<br/>
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

  const zoomAroundTrade = (
    chart: IChartApi,
    data: CandlestickData[],
    trade: TradeMarker
  ) => {
    const entryIndex = data.findIndex((c) => c.time === trade.time);
    let fromTime = trade.time;
    if (entryIndex !== -1){
      const fromIndex = Math.max(0, entryIndex - 10);
      fromTime = data[fromIndex].time;
    }

    const exitIndex = data.findIndex((c) => c.time === trade.exitTime);
    let toTime = trade.exitTime;
    if (exitIndex !== -1){
      const exit = exitIndex !== -1 ? exitIndex : entryIndex + 10;
      const toIndex = Math.min(data.length - 1, exit + 10);
      toTime = data[toIndex].time;
    }

    chart.timeScale().setVisibleRange({
      from: fromTime,
      to: toTime,
    });
  };

  const getPrecision = (value: number): precisionPrice => {
    const valueStr = value.toString();
  
    if (!valueStr.includes('.')) {
      return {
        minMove : 1,
        precision: 1,
      };
    };
  
    const decimalPlaces = valueStr.split('.')[1].length;
    return {
      minMove : Math.pow(10, -decimalPlaces),
      precision: decimalPlaces,
    }
  };
  
  const getRandomPrecisionFromData = (data: CandlestickData[]): precisionPrice => {
    if (data.length === 0) {
      return {
        minMove : 1,
        precision: 1,
      };
    };

    const randomRow = data[Math.floor(Math.random() * data.length)];
    const sampleValue = randomRow.close;
    return getPrecision(sampleValue);
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

    const precisionInfo = getRandomPrecisionFromData(data)

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
        precision: precisionInfo.precision,
        minMove: precisionInfo.minMove,
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
        lineWidth: 4,
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
      if (param.hoveredObjectId) {        
        const matchingTrade = annotations.find(trade => trade.id === param.hoveredObjectId);

        if (matchingTrade) {
          showTradeTooltip(matchingTrade, param.point.x, param.point.y);
        } else {
          hideTooltip();
        }
      }else hideTooltip();

    });

    chart.subscribeClick(param => {
      if (!param || !param.time) return;
      if (param.hoveredObjectId) {
        const clickedTrade = annotations.find(trade => trade.id === param.hoveredObjectId);
        if (clickedTrade) {
          zoomAroundTrade(chart, data, clickedTrade);
        }
      }
    });

    chart.subscribeDblClick(param => {
      if (!param) return;
      chart.timeScale().fitContent();
    });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      chart.remove();
    };
  }, [data, tradeLines]);

  useEffect(() => {
    fetch('/bt-visualizer/ohlc.csv')
      .then((res) => res.text())
      .then((text) => {
        parseOhlc(text);
      });
    fetch('/bt-visualizer/trades.csv')
      .then((res) => res.text())
      .then((text) => {
        parseTrades(text);
      });
  }, []);

  return (
    <>
      <div className="flex justify-center items-center gap-2 sm:gap-4 flex-wrap">
        <label className="cursor-pointer text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm transition-colors">
          Upload OHLC CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleOHLCUpload}
            className="hidden"
          />
        </label>

        <label className="cursor-pointer text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm transition-colors">
          Upload Trades CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleTradesUpload}
            className="hidden"
          />
        </label>

        <label className="cursor-pointer text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm transition-colors">
          Reset Data
          <button
            onClick={() => {
              setData([])
              setAnnotations([])
              setTradeLines([])
            }}
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
