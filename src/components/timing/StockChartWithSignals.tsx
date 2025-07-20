
'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceDot } from 'recharts';
import { format, parseISO } from 'date-fns';
import type { HistoricalDataPoint } from '@/services/stockService';

export type HistoricalSignal = {
    date: string;
    close: number;
    signal: '매수' | '매도';
    rationale: string;
};

interface StockChartProps {
    historicalData: HistoricalDataPoint[];
    historicalSignals: HistoricalSignal[];
}

const SignalShape = (props: any) => {
  const { cx, cy, payload } = props;

  if (!payload || !payload.signal) {
    return null;
  }
  
  const isBuySignal = payload.signal.includes('매수');
  const fill = isBuySignal ? '#22c55e' : '#ef4444'; // 초록(매수), 빨강(매도)
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

    const dataMap = new Map(historicalData.map(d => [d.date, d]));
    
    // 1. 신호에 해당하는 날짜가 실제 데이터에 존재하는지 확인하고 close 가격 추가
    const validSignalsWithClose = historicalSignals
      .map(s => {
        const dataPoint = dataMap.get(s.date);
        return dataPoint ? { ...s, close: dataPoint.close } : null;
      })
      .filter((s): s is HistoricalSignal => s !== null);

    // 2. 날짜순으로 정렬
    validSignalsWithClose.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 3. 연속된 동일 신호 필터링 (매수 -> 매도 -> 매수 ... 순으로)
    const filtered: HistoricalSignal[] = [];
    let lastSignalType: '매수' | '매도' | null = null;
    
    for (const signal of validSignalsWithClose) {
        const currentSignalType = signal.signal;
        if (currentSignalType !== lastSignalType) {
            filtered.push(signal);
            lastSignalType = currentSignalType;
        }
    }
    
    // 4. 차트 데이터에 신호 정보 결합
    const signalMap = new Map(filtered.map(s => [s.date, s]));
    const augmentedData = historicalData.map(d => ({
        ...d,
        signalInfo: signalMap.get(d.date)
    }));
    
    return { chartData: augmentedData, processedSignals: filtered };

  }, [historicalData, historicalSignals]);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2 text-sm bg-background/80 border border-border rounded-md shadow-lg text-foreground">
          <p className="font-bold">{format(parseISO(label), "yyyy-MM-dd")}</p>
          <p style={{ color: "hsl(var(--primary))" }}>
            {`종가: ${data.close.toFixed(2)}`}
          </p>
          {data.signalInfo && (
            <div className="mt-2 pt-2 border-t border-border/50">
                <p className={`font-bold ${data.signalInfo.signal.includes('매수') ? 'text-green-500' : 'text-red-500'}`}>
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
              tickFormatter={(value) => value.toFixed(2)}
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
    </Card>
  );
}
