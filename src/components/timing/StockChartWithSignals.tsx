
'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceDot } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format, parseISO } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '../ui/badge';
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

// 커스텀 ReferenceDot 렌더링
const SignalDot = (props: any) => {
  const { cx, cy, payload } = props;
  const isBuySignal = payload.signal.includes('매수');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <svg x={cx - 10} y={cy - (isBuySignal ? 20 : 0)} width="20" height="20" viewBox="0 0 24 24" fill={isBuySignal ? "hsl(var(--primary))" : "hsl(var(--destructive))"} style={{cursor: 'pointer'}}>
          {isBuySignal ? (
            <path d="M12 2L2 22h20L12 2z" /> // Upward Triangle
          ) : (
            <path d="M12 22L2 2h20L12 22z" /> // Downward Triangle
          )}
        </svg>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">신호 상세 정보</h4>
            <p className="text-sm text-muted-foreground">
              {payload.date}에 발생한 신호 분석입니다.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-semibold">날짜</span>
              <span className="col-span-2">{payload.date}</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-semibold">신호</span>
              <Badge variant={isBuySignal ? "default" : "destructive"} className="col-span-2">{payload.signal}</Badge>
            </div>
            <div className="grid grid-cols-3 items-start gap-4">
               <span className="font-semibold pt-1">근거</span>
               <p className="col-span-2 text-sm text-muted-foreground">{payload.rationale}</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};


export function StockChartWithSignals({ historicalData, historicalSignals }: StockChartProps) {
  const chartConfig = {
    close: {
      label: "종가",
      color: "hsl(var(--primary))",
    },
  };

  const processedSignals = useMemo(() => {
    if (!historicalSignals || historicalSignals.length === 0) {
        return [];
    }

    // Sort by date to ensure chronological order before filtering
    const sortedSignals = [...historicalSignals].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Filter consecutive signals of the same type
    const filtered: HistoricalSignal[] = [];
    let lastSignalType: '매수' | '매도' | null = null;
  
    for (const signal of sortedSignals) {
      const currentSignalType = signal.signal;
  
      if (currentSignalType !== lastSignalType) {
        filtered.push(signal);
        lastSignalType = currentSignalType;
      }
    }
    return filtered;

  }, [historicalSignals]);


  return (
    <Card className="bg-background/30 p-4 pt-8 text-center h-[400px]">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={historicalData}
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
              cursor={true}
              content={<ChartTooltipContent
                indicator="dot"
                labelFormatter={(label) => format(parseISO(label), "yyyy-MM-dd")}
              />}
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
                    r={10} 
                    shape={<SignalDot />}
                    ifOverflow="extendDomain"
                />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  );
}
