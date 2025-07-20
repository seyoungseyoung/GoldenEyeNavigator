
'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceDot } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format, parseISO } from 'date-fns';
import type { StockSignalOutput as AIResult } from '@/ai/flows/stock-signal-generator';

export type HistoricalSignal = {
    date: string;
    close: number;
    signal: '매수' | '매도';
    rationale: string;
};

interface StockChartProps {
    historicalData: AIResult['historicalData'];
    historicalSignals: HistoricalSignal[];
}

// 커스텀 ReferenceDot 렌더링을 위한 컴포넌트
const SignalShape = (props: any) => {
  const { cx, cy, payload } = props;

  if (!payload || !payload.signal) {
    return null;
  }
  
  const isBuySignal = payload.signal.includes('매수');

  // 매수: 파란색 위쪽 삼각형, 매도: 빨간색 아래쪽 삼각형
  const fill = isBuySignal ? '#3b82f6' : '#ef4444'; 
  const d = isBuySignal ? "M 0 -8 L 8 8 L -8 8 Z" : "M 0 8 L 8 -8 L -8 -8 Z";

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <path d={d} fill={fill} />
    </g>
  );
};


export function StockChartWithSignals({ historicalData, historicalSignals }: StockChartProps) {
  const chartConfig = {
    close: {
      label: "종가",
      color: "hsl(var(--primary))",
    },
  };
  
  const { chartData, processedSignals } = useMemo(() => {
    if (!historicalData || historicalData.length === 0) {
      return { chartData: [], processedSignals: [] };
    }

    const signalMap = new Map(historicalSignals.map(s => [s.date, s]));
    
    const augmentedData = historicalData.map(d => ({
        ...d,
        signalInfo: signalMap.get(d.date) // 해당 날짜에 신호 정보 추가
    }));
    
    // 연속 신호 필터링
    const sortedSignals = [...historicalSignals].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const filtered: HistoricalSignal[] = [];
    let lastSignalType: '매수' | '매도' | null = null;
  
    for (const signal of sortedSignals) {
      const currentSignalType = signal.signal;
  
      if (currentSignalType !== lastSignalType) {
        filtered.push(signal);
        lastSignalType = currentSignalType;
      }
    }

    return { chartData: augmentedData, processedSignals: filtered };

  }, [historicalData, historicalSignals]);

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2 text-sm bg-background/80 border border-border rounded-md shadow-lg">
          <p className="font-bold">{format(parseISO(label), "yyyy-MM-dd")}</p>
          <p style={{ color: chartConfig.close.color }}>
            {`종가: ${data.close.toFixed(2)}`}
          </p>
          {data.signalInfo && (
            <div className="mt-2 pt-2 border-t border-border/50">
                <p className={`font-bold ${data.signalInfo.signal.includes('매수') ? 'text-blue-500' : 'text-red-500'}`}>
                    {`${data.signalInfo.signal}: ${data.signalInfo.rationale}`}
                </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };


  return (
    <Card className="bg-background/30 p-4 pt-8 text-center h-[400px]">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20, right: 20, left: -10, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => format(parseISO(value), "yy-MM-dd")}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="close"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              name="종가"
            />
            {processedSignals.map((signal, index) => (
                <ReferenceDot 
                    key={index} 
                    x={signal.date} 
                    y={signal.close}
                    r={8} 
                    ifOverflow="extendDomain"
                    shape={<SignalShape payload={signal} />}
                />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  );
}
