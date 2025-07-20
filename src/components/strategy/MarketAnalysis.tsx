'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { analyzeMarketInsight, MarketInsightOutput } from '@/ai/flows/market-insight-analyzer';
import { Loader2, Bot, Newspaper, Lightbulb, BarChart3 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  marketNews: z.string().min(10, { message: '최소 10자 이상의 시장 동향을 입력해주세요.' }),
});

export function MarketAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MarketInsightOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marketNews: "",
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const insight = await analyzeMarketInsight(values);
      setResult(insight);
    } catch (error) {
      console.error('Error analyzing market insight:', error);
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: "시장 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary">
          시장 해설 및 AI 인사이트
        </h2>
        <p className="mt-2 text-lg text-muted-foreground">
          최신 시장 뉴스나 동향을 입력하고 AI의 분석을 받아보세요.
        </p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="marketNews"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="예: 미국 연준이 금리를 동결했으며, 기술주 중심의 상승세가 이어지고 있습니다. 반도체 섹터의 실적 발표가 다음 주에 예정되어 있습니다..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      AI 인사이트 받기
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
         <Card className="bg-card/50 border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
                <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-16 w-full" />
                </div>
                <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-12 w-full" />
                </div>
                <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-card/50 border-border/50 animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-headline text-primary">
              <Bot className="h-8 w-8" /> AI 시장 요약 및 제안
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2 mb-2"><Newspaper className="h-5 w-5 text-accent"/>시장 요약</h3>
              <p className="text-muted-foreground whitespace-pre-line">{result.marketSummary}</p>
            </div>
            <Separator className="bg-border/40" />
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2 mb-2"><Lightbulb className="h-5 w-5 text-accent"/>제안 조치</h3>
              <p className="text-muted-foreground whitespace-pre-line">{result.suggestedActions}</p>
            </div>
            <Separator className="bg-border/40" />
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2 mb-2"><BarChart3 className="h-5 w-5 text-accent"/>근거</h3>
              <p className="text-muted-foreground whitespace-pre-line">{result.rationale}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
