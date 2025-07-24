
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
import { financialQnA, FinancialQnAOutput, FinancialQnAInputSchema } from '@/ai/flows/financial-qa-flow';
import { Loader2, Bot, MessageSquare, Sparkles } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function FinancialQnA() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FinancialQnAOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FinancialQnAInputSchema>>({
    resolver: zodResolver(FinancialQnAInputSchema),
    defaultValues: {
      question: "",
    }
  });

  async function onSubmit(values: z.infer<typeof FinancialQnAInputSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const insight = await financialQnA(values);
      setResult(insight);
    } catch (error) {
      console.error('Error in Financial Q&A:', error);
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: "AI 답변 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary">
          금융 Q&amp;A
        </h2>
        <p className="mt-2 text-lg text-muted-foreground">
          투자에 대해 궁금한 점이 있으신가요? AI에게 무엇이든 물어보세요.
        </p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="예: 지금 주식시장 조정이 왔는데 제 전략을 바꿔야 할까요?"
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
                      답변 생성 중...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      AI 답변 받기
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
                <Skeleton className="h-24 w-full" />
            </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-card/50 border-border/50 animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-headline text-primary">
              <Bot className="h-8 w-8" /> AI의 답변
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                <p className="text-muted-foreground whitespace-pre-line">{result.answer}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
