
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
import { convertToTicker } from '@/ai/flows/ticker-converter';
import { getHistoricalData, HistoricalDataPoint } from '@/services/stockService';
import { Loader2, Wand2, Bell, Mail, AreaChart, Search } from 'lucide-react';
import { Separator } from '../ui/separator';
import { StockChartWithSignals, HistoricalSignal } from './StockChartWithSignals';
import { calculateSignals } from '@/services/indicatorService';

const signalFormSchema = z.object({
  query: z.string().min(1, { message: '종목명 또는 티커를 입력해주세요.' }),
  tradingStrategy: z.string().optional(),
});

const emailFormSchema = z.object({
  email: z.string().email({ message: '올바른 이메일 주소를 입력해주세요.' }),
});

const getSignalStyle = (signal: string) => {
    switch(signal) {
        case '강한 매수':
        case '매수':
            return 'text-green-500 border-green-500';
        case '강한 매도':
        case '매도':
            return 'text-red-500 border-red-500';
        default: // '보류'
            return 'text-gray-400 border-gray-400';
    }
}

type AnalysisResult = StockSignalOutput & { 
  ticker: string; 
  tradingStrategy?: string;
  historicalData: HistoricalDataPoint[];
  historicalSignals: HistoricalSignal[];
};

export function TimingAnalysis() {
  const [isSignalLoading, setIsSignalLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const signalForm = useForm<z.infer<typeof signalFormSchema>>({
    resolver: zodResolver(signalFormSchema),
    defaultValues: {
      query: '',
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
    let finalTicker = '';
    let historicalData: HistoricalDataPoint[] = [];

    try {
      // Step 1: Try fetching data with the user's query directly
      try {
        toast({ title: '주가 데이터 조회 중...', description: `${values.query}의 데이터를 직접 조회합니다.` });
        historicalData = await getHistoricalData(values.query);
        finalTicker = values.query.toUpperCase();
        toast({ title: '데이터 조회 성공!', description: `입력하신 '${finalTicker}'에 대한 분석을 시작합니다.` });

      } catch (e) {
        // Step 2: If direct fetch fails, use AI for ticker conversion
        toast({ title: '티커 변환 중...', description: `'${values.query}'가 티커가 아닌 것 같습니다. AI로 변환을 시도합니다.` });
        const conversionResult = await convertToTicker({ query: values.query });

        if (!conversionResult.success || !conversionResult.ticker) {
          toast({
            variant: "destructive",
            title: "티커 변환 실패",
            description: `AI가 '${values.query}'에 대한 티커를 찾지 못했습니다. 더 정확한 회사명이나 티커를 입력해주세요.`,
          });
          setIsSignalLoading(false);
          return;
        }

        finalTicker = conversionResult.ticker;
        toast({ title: '티커 변환 완료', description: `'${values.query}' -> '${finalTicker}'로 변환되었습니다. 데이터를 다시 조회합니다.` });
        
        // Step 3: Fetch data again with the converted ticker
        try {
            historicalData = await getHistoricalData(finalTicker);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "데이터 조회 실패",
                description: `AI가 변환한 티커 '${finalTicker}'로도 데이터를 찾을 수 없습니다. 더 정확한 회사명이나 티커를 입력해주세요.`
            });
            setIsSignalLoading(false);
            return;
        }
      }

      // If we reach here, we have a valid ticker and historical data.
      signalForm.setValue('query', finalTicker);

      // Step 4: AI selects indicators and parameters
      toast({ title: 'AI 분석 중...', description: '최적의 기술 지표를 선택하고 있습니다.' });
      const signalResult = await generateStockSignal({
        ticker: finalTicker,
        tradingStrategy: values.tradingStrategy,
        historicalData,
      });

      // Step 5: Application calculates signals based on AI's strategy
      toast({ title: '과거 신호 계산 중...', description: '차트에 표시할 과거 매매 신호를 계산합니다.' });
      const historicalSignals = calculateSignals(
        historicalData,
        signalResult.recommendedIndicators
      );

      // Step 6: Inject AI's detailed rationale into the most recent signal for the tooltip
      if (historicalSignals.length > 0) {
        const lastSignal = historicalSignals.reduce((latest, current) => 
            new Date(latest.date) > new Date(current.date) ? latest : current
        );
        lastSignal.rationale = signalResult.rationale; // Overwrite with AI's explanation
      }

      setResult({ 
        ...signalResult, 
        ticker: finalTicker, 
        tradingStrategy: values.tradingStrategy,
        historicalData,
        historicalSignals
      });
      
      toast({ title: '분석 완료!', description: `${finalTicker}에 대한 매매 신호 분석이 완료되었습니다.` });

    } catch (error: any) {
      console.error('Error during signal generation process:', error);
      toast({
        variant: "destructive",
        title: "분석 중 오류 발생",
        description: error.message || "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsSignalLoading(false);
    }
  }

  async function onEmailSubmit(values: z.infer<typeof emailFormSchema>) {
    if (!result) return;
    setIsEmailLoading(true);

    try {
        const indicatorsForEmail = result.recommendedIndicators.map(ind => `${ind.fullName} (${ind.name})`);

        const response = await subscribeToSignals({
            email: values.email,
            ticker: result.ticker,
            tradingStrategy: result.tradingStrategy,
            indicators: indicatorsForEmail,
        });

        toast({
            title: response.success ? "알림 신청 완료" : "오류 발생",
            description: response.message,
            variant: response.success ? "default" : "destructive",
        });

        if(response.success) {
            emailForm.reset();
        }
    } catch (error: any) {
        console.error('Error subscribing to signals:', error);
        toast({
            variant: "destructive",
            title: "오류 발생",
            description: error.message || "알림 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        });
    } finally {
        setIsEmailLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
            <CardTitle>AI 기술 지표 추천</CardTitle>
            <CardDescription>분석하고 싶은 주식의 이름(예: 애플) 또는 티커(예: AAPL)와 매매 전략을 입력하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...signalForm}>
            <form onSubmit={signalForm.handleSubmit(onSignalSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={signalForm.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>종목명 또는 티커</FormLabel>
                      <FormControl>
                        <Input placeholder="예: 삼성전자, Apple, META" {...field} />
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
                    <><Search className="mr-2 h-4 w-4" /> AI 분석 시작하기</>
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
            <CardDescription>{result.rationale}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                {result.recommendedIndicators.map((indicator, index) => (
                    <div key={index} className="p-4 bg-background/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">추천 지표 {index + 1}</p>
                        <p className="font-bold text-lg text-foreground">{indicator.fullName}</p>
                        <p className="text-xs text-muted-foreground">({indicator.name})</p>
                    </div>
                ))}
            </div>
            <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">종합 매매 신호 (최신)</p>
                <p className={`font-bold text-3xl font-headline border-2 rounded-full inline-block px-6 py-2 ${getSignalStyle(result.finalSignal)}`}>
                    {result.finalSignal}
                </p>
            </div>
            
            <Separator className="bg-border/40 my-6" />

            <div className="space-y-4">
                <h3 className="font-bold text-xl flex items-center gap-2"><AreaChart className="h-5 w-5 text-accent"/>주가 차트 분석 (과거 신호 포함)</h3>
                 <StockChartWithSignals 
                    historicalData={result.historicalData}
                    historicalSignals={result.historicalSignals}
                 />
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
