import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { format } from 'date-fns';
import { MarketHistory } from '../types';

interface AssetChartProps {
  data: MarketHistory[];
  symbol: string;
}

export function AssetChart({ data, symbol }: AssetChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const isPositive = data.length > 1 && data[data.length - 1].price >= data[0].price;
    const strokeColor = isPositive ? '#22c55e' : '#ef4444';

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#64748b',
      },
      grid: {
        vertLines: { color: 'rgba(51, 65, 85, 0.4)', visible: false },
        horzLines: { color: 'rgba(51, 65, 85, 0.4)', visible: true },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#334155',
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
    });
    
    chartRef.current = chart;

    const lineSeries = chart.addAreaSeries({
      lineColor: strokeColor,
      topColor: `${strokeColor}40`,
      bottomColor: `${strokeColor}00`,
      lineWidth: 2,
    });

    const chartData = data.map(item => ({
      time: new Date(item.time).getTime() / 1000 as any,
      value: item.price,
    }));
    
    lineSeries.setData(chartData);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, symbol]);

  return (
    <div className="w-full h-full flex flex-col pt-3 px-3">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2 shrink-0">
        <div>
          <h2 className="text-white font-bold text-lg">{symbol} / USD <span className="text-slate-500 font-normal ml-2">${data[data.length - 1]?.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span></h2>
        </div>
        <div className="flex space-x-2 text-[10px]">
          <span className="px-2 py-1 bg-slate-800 rounded text-slate-300 cursor-pointer hover:bg-slate-700 hidden sm:block">1M</span>
          <span className="px-2 py-1 bg-blue-600 rounded text-white cursor-pointer">5M</span>
          <span className="px-2 py-1 bg-slate-800 rounded text-slate-300 cursor-pointer hover:bg-slate-700 hidden sm:block">15M</span>
          <span className="px-2 py-1 bg-slate-800 rounded text-slate-300 cursor-pointer hover:bg-slate-700">1H</span>
        </div>
      </div>
      <div className="flex-1 min-h-[250px] relative w-full h-full" ref={chartContainerRef}>
      </div>
    </div>
  );
}
