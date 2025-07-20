'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { InvestmentStrategyOutput } from '@/ai/flows/investment-strategy-generator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MarketAnalysis } from '@/components/strategy/MarketAnalysis';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, CheckCircle, BarChart, BookOpen, BrainCircuit } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

export default function StrategyPage() {
  const [strategy, setStrategy] = useState<InvestmentStrategyOutput | null>(null);
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedResult = localStorage.getItem('strategyResult');
    const storedName = localStorage.getItem('userName');

    if (storedResult && storedName) {
      try {
        setStrategy(JSON.parse(storedResult));
        setName(storedName);
      } catch (e) {
        console.error("Failed to parse strategy from localStorage", e);
        router.push('/survey');
      }
    } else {
      router.push('/survey');
    }
    setLoading(false);
  }, [router]);

  if (loading || !strategy) {
    return (
      <div>
        <div className="text-center mb-12">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardHeader><Skeleton className="h-8 w-32" /></CardHeader>
                    <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                </Card>
            ))}
        </div>
      </div>
    );
  }

  const allocationData = [
    { name: '주식', value: strategy.assetAllocation.stocks, fill: 'hsl(var(--chart-1))' },
    { name: '채권', value: strategy.assetAllocation.bonds, fill: 'hsl(var(--chart-2))' },
    { name: '현금', value: strategy.assetAllocation.cash, fill: 'hsl(var(--chart-3))' },
  ];

  const chartConfig = {
    value: {
      label: "Value",
    },
    stocks: {
      label: "주식",
      color: "hsl(var(--chart-1))",
    },
    bonds: {
      label: "채권",
      color: "hsl(var(--chart-2))",
    },
    cash: {
      label: "현금",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
          {name}님의 맞춤형 투자 전략
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">AI가 생성한 개인화된 투자 포트폴리오입니다.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center gap-4">
            <BarChart className="w-8 h-8 text-primary shrink-0" />
            <div>
              <CardTitle>자산 배분</CardTitle>
              <CardDescription>추천 포트폴리오 구성</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
             {strategy.assetAllocation ? (
                <ChartContainer config={chartConfig} className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Legend/>
                            <Pie
                                data={allocationData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                labelLine={false}
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                    return (
                                    <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                        {`${(percent * 100).toFixed(0)}%`}
                                    </text>
                                    );
                                }}
                            >
                                {allocationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            ) : <p className="text-muted-foreground">자산 배분 차트를 생성할 수 없습니다.</p>}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center gap-4">
            <TrendingUp className="w-8 h-8 text-primary shrink-0" />
            <div>
              <CardTitle>ETF/주식 추천</CardTitle>
              <CardDescription>성장 가능성이 높은 종목</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {strategy.etfStockRecommendations.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <CheckCircle className="w-5 h-5 text-accent mt-1 shrink-0" />
                <div>
                  <p className="font-bold text-foreground">{item.ticker}</p>
                  <p className="text-sm text-muted-foreground">{item.rationale}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 md:col-span-2">
            <div className="md:grid md:grid-cols-2">
                <div className="p-6">
                    <div className="flex flex-row items-center gap-4 mb-4">
                        <BrainCircuit className="w-8 h-8 text-primary shrink-0" />
                        <div>
                        <h3 className="text-xl font-semibold leading-none tracking-tight">거래 전략</h3>
                        <p className="text-sm text-muted-foreground">포트폴리오 운용 방안</p>
                        </div>
                    </div>
                    <p className="text-muted-foreground whitespace-pre-line">{strategy.tradingStrategy}</p>
                </div>
                <div className="p-6 border-t md:border-t-0 md:border-l border-border/50">
                    <div className="flex flex-row items-center gap-4 mb-4">
                        <BookOpen className="w-8 h-8 text-primary shrink-0" />
                        <div>
                        <h3 className="text-xl font-semibold leading-none tracking-tight">전략 설명</h3>
                        <p className="text-sm text-muted-foreground">AI의 추천 근거</p>
                        </div>
                    </div>
                    <p className="text-muted-foreground whitespace-pre-line">{strategy.strategyExplanation}</p>
                </div>
            </div>
        </Card>
      </div>
      
      <Separator className="my-12 bg-border/40" />

      <MarketAnalysis />
    </div>
  );
}
