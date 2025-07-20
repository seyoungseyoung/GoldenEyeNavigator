'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generateStockSignal, StockSignalOutput } from '@/ai/flows/stock-signal-generator';
import { subscribeToSignals } from '@/ai/flows/subscribeToSignals';
import { Loader2, Wand2, Bell, Mail, AreaChart } from 'lucide-react';
import { Separator } from '../ui/separator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';

const signalFormSchema = z.object({
  ticker: z.string().min(1, { message: '티커를 입력해주세요.' }).toUpperCase(),
  tradingStrategy: z.string().optional(),
});

const emailFormSchema = z.object({
  email: z.string().email({ message: '올바른 이메일 주소를 입력해주세요.' }),
});

const getSignalStyle = (signal: string) => {
    switch(signal) {
        case '강한 매수':
            return 'text-green-400 border-green-400';
        case '매수':
            return 'text-green-300 border-green-300';
        case '매도':
            return 'text-red-400 border-red-400';
        case '강한 매도':
            return 'text-red-500 border-red-500';
        default: // '보류'
            return 'text-gray-400 border-gray-400';
    }
}

export function TimingAnalysis() {
  const [isSignalLoading, setIsSignalLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [result, setResult] = useState<StockSignalOutput & { ticker: string; tradingStrategy?: string } | null>(null);
  const { toast } = useToast();

  const signalForm = useForm<z.infer<typeof signalFormSchema>>({
    resolver: zodResolver(signalFormSchema),
    defaultValues: {
      ticker: '',
      tradingStrategy: '',
    },
  });

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSignalSubmit(values: z.infer<typeof signalFormSchema>) {
    setIsSignalLoading(true);
    setResult(null);
    try {
      const signalResult = await generateStockSignal(values);
      setResult({ ...signalResult, ticker: values.ticker, tradingStrategy: values.tradingStrategy });
    } catch (error) {
      console.error('Error generating stock signal:', error);
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: "신호 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsSignalLoading(false);
    }
  }

  async function onEmailSubmit(values: z.infer<typeof emailFormSchema>) {
    if (!result) return;
    setIsEmailLoading(true);

    try {
        const response = await subscribeToSignals({
            email: values.email,
            ticker: result.ticker,
            tradingStrategy: result.tradingStrategy,
            indicators: [result.indicator1, result.indicator2, result.indicator3],
        });

        toast({
            title: response.success ? "알림 신청 완료" : "오류 발생",
            description: response.message,
            variant: response.success ? "default" : "destructive",
        });

        if(response.success) {
            emailForm.reset();
        }
    } catch (error) {
        console.error('Error subscribing to signals:', error);
        toast({
            variant: "destructive",
            title: "오류 발생",
            description: "알림 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        });
    } finally {
        setIsEmailLoading(false);
    }
  }

  const chartConfig = {
    close: {
      label: "종가",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
            <CardTitle>AI 기술 지표 추천</CardTitle>
            <CardDescription>분석하고 싶은 주식의 티커와 매매 전략을 입력하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...signalForm}>
            <form onSubmit={signalForm.handleSubmit(onSignalSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={signalForm.control}
                  name="ticker"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>주식 티커</FormLabel>
                      <FormControl>
                        <Input placeholder="예: AAPL, GOOGL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signalForm.control}
                  name="tradingStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>매매 전략/타이밍 (선택 사항)</FormLabel>
                      <FormControl>
                        <Input placeholder="예: 장기적 관점의 저점 매수" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSignalLoading}>
                  {isSignalLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 분석 중...</>
                  ) : (
                    <><Wand2 className="mr-2 h-4 w-4" /> AI 기술 지표 추천받기</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-card/50 border-border/50 animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="text-primary">{result.ticker} 매매 신호 분석</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                {[result.indicator1, result.indicator2, result.indicator3].map((indicator, index) => (
                    <div key={index} className="p-4 bg-background/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">추천 지표 {index + 1}</p>
                        <p className="font-bold text-lg text-foreground">{indicator}</p>
                    </div>
                ))}
            </div>
            <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">종합 매매 신호</p>
                <p className={`font-bold text-3xl font-headline border-2 rounded-full inline-block px-6 py-2 ${getSignalStyle(result.signal)}`}>
                    {result.signal}
                </p>
            </div>
            
            <Separator className="bg-border/40 my-6" />

            <div className="space-y-4">
                <h3 className="font-bold text-xl flex items-center gap-2"><AreaChart className="h-5 w-5 text-accent"/>주가 차트 분석</h3>
                 <Card className="bg-background/30 p-4 text-center h-[400px]">
                  <ChartContainer config={chartConfig} className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={result.historicalData}
                        margin={{
                          top: 5, right: 20, left: -10, bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => format(new Date(value), "yy-MM-dd")}
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
                            labelFormatter={(label) => format(new Date(label), "yyyy-MM-dd")}
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
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-card/50 border-border/50">
             <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell className="h-6 w-6 text-primary" /> 신호 메일로 받기</CardTitle>
                <CardDescription>설정한 종목의 매매 신호가 발생하면 이메일로 알려드립니다. (보류 신호 제외)</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="flex items-center gap-4">
                        <FormField
                        control={emailForm.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="flex-grow">
                            <FormControl>
                                <Input type="email" placeholder="your-email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" disabled={isEmailLoading}>
                            {isEmailLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 신청 중...</>
                            ) : (
                                <><Mail className="mr-2 h-4 w-4" /> 신청하기</>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
