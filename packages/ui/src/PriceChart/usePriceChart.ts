import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type Time,
} from 'lightweight-charts';

type UsePriceChartOptions = {
  symbol: string;
  candles: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
  volumeData?: {
    time: number;
    value: number;
    color?: string;
  }[];
};

export function usePriceChart({
  symbol,
  candles,
  volumeData,
}: UsePriceChartOptions) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const initializedRef = useRef(false);

  // Initialize chart when symbol becomes available
  useEffect(() => {
    if (!chartContainerRef.current || initializedRef.current || !symbol) {
      return;
    }

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: '#1a1a1a' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#2d2d2d' },
        horzLines: { color: '#2d2d2d' },
      },
      width: container.clientWidth,
      height: container.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 6,
        fixLeftEdge: false,
        fixRightEdge: false,
      },
      rightPriceScale: {
        scaleMargins: {
          top: 0.1, // 10% padding at top
          bottom: 0.25, // 25% reserved for volume at bottom
        },
      },
      autoSize: true, // Enable auto-sizing
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Empty string = overlay, separate from main price scale
      lastValueVisible: false,
      priceLineVisible: false,
    });

    // Position volume series on a separate scale
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // Volume takes bottom 20% of chart
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;
    initializedRef.current = true;

    return () => {
      chart.remove();
      initializedRef.current = false;
    };
  }, [symbol]);

  // Update chart data when candles change
  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

    if (candles.length > 0) {
      const chartData: CandlestickData[] = candles.map((c) => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      candlestickSeriesRef.current.setData(chartData);

      if (volumeData && volumeData.length > 0) {
        const volData: HistogramData[] = volumeData.map((v) => ({
          time: v.time as Time,
          value: v.value,
          color: v.color,
        }));
        volumeSeriesRef.current.setData(volData);
      }

      // Show last 100 candles by default instead of fitting all
      if (chartRef.current && candles.length > 0) {
        const lastCandleIndex = candles.length - 1;
        const firstVisibleIndex = Math.max(0, lastCandleIndex - 100);

        const firstCandle = candles[firstVisibleIndex];
        const lastCandle = candles[lastCandleIndex];

        if (firstCandle && lastCandle) {
          chartRef.current.timeScale().setVisibleRange({
            from: firstCandle.time as Time,
            to: lastCandle.time as Time,
          });
        }
      }
    }
  }, [candles, volumeData]);

  return { chartContainerRef };
}
