
'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { investmentStrategyGenerator } from '@/ai/flows/investment-strategy-generator';
import { InvestmentStrategyInputSchema, type InvestmentStrategyInput } from '@/ai/flows/investment-strategy-validator';
import { Loader2 } from 'lucide-react';

const formSchema = InvestmentStrategyInputSchema;

const formFields = [
    { name: 'retirementHorizon', label: '1. 은퇴 시기', options: ['이미 은퇴함', '5년 미만', '5-10년', '10-20년', '20년 이상'] },
    { name: 'incomeNeed', label: '2. 현금흐름 필요성', options: ['월 소득 필요 없음', '월 0원 - 100만 원', '월 101만 원-300만 원', '월 301만 원-500만 원', '월 500만 원 이상'] },
    { name: 'assetsSize', label: '3. 투자 자산 규모', options: ['5천만 원 미만', '5천만 원-2억 5천만 원 미만', '2억 5천만 원-10억 원 미만', '10억 원-50억 원 미만', '50억 원 이상'] },
    { name: 'taxSensitivity', label: '4. 세금 민감도', options: ['매우 민감한', '다소 민감함', '민감하지 않음'] },
    { name: 'themePreference', label: '5. 투자 테마 선호도', options: ['배당', '성장', 'ESG(환경, 사회, 지배구조)', '국내 중심', '해외 중심', '균형/분산'] },
    { name: 'regionPreference', label: '6. 투자 지역 선호도', options: ['국내 주식 중심', '미국 주식 중심', '기타 선진국 주식 중심(유럽, 일본 등)', '신흥국 주식 중심(중국, 인도 등)', '글로벌 분산 투자'] },
    { name: 'managementStyle', label: '7. 관리 스타일', options: ['적극적(직접 관리 선호)', '소극적/자동화(설정 후 신경 쓰지 않는 방식 선호)'] },
    { name: 'riskTolerance', label: '8. 위험 감수 수준', options: ['보수적(자본 보존 우선)', '다소 보수적', '중립적(위험과 수익 균형)', '다소 공격적', '공격적(높은 수익 추구, 높은 위험 감수)'] },
];

const loadingMessages = [
    "제출된 정보를 분석 중입니다...",
    "AI가 투자 성향을 파악하고 있습니다...",
    "맞춤형 포트폴리오를 구성하고 있습니다...",
    "추천 종목을 선정하는 중입니다...",
    "거의 다 됐습니다. 잠시만 기다려주세요...",
];

export function SurveyForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingMessage(loadingMessages[0]); // Reset to the first message on new loading
      let messageIndex = 0;
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 3000); // Change message every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      retirementHorizon: undefined,
      incomeNeed: undefined,
      assetsSize: undefined,
      taxSensitivity: undefined,
      themePreference: undefined,
      regionPreference: undefined,
      managementStyle: undefined,
      riskTolerance: undefined,
      retirementGoals: '',
      otherAssets: '',
      name: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await investmentStrategyGenerator(values as InvestmentStrategyInput);
      localStorage.setItem('strategyResult', JSON.stringify(result));
      localStorage.setItem('userName', values.name);
      
      // Set a flag in sessionStorage to indicate successful generation
      sessionStorage.setItem('strategyGenerated', 'true');

      // Navigate to the strategy page. The toast will be shown there.
      router.push('/strategy');
    } catch (error: any) {
      console.error('Error generating strategy:', error);
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: error.message || "전략 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
       setIsLoading(false);
    }
    // No finally block to set isLoading to false, because the component will unmount on successful navigation.
    // It is set to false only on error.
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {formFields.map((fieldInfo) => (
                <FormField
                    key={fieldInfo.name}
                    control={form.control}
                    name={fieldInfo.name as keyof z.infer<typeof formSchema>}
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="font-bold text-lg">{fieldInfo.label}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="선택해주세요" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {fieldInfo.options.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            ))}
        </div>
        
        <FormField
          control={form.control}
          name="retirementGoals"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">9. 은퇴 목표 및 우려 사항</FormLabel>
              <FormControl>
                <Textarea placeholder="은퇴 후 이루고 싶은 목표나 자금 운용에 대한 걱정이 있다면 자유롭게 작성해주세요. (예: 20년 후 자산이 고갈되지 않았으면 합니다.)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="otherAssets"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">10. 기타 자산</FormLabel>
              <FormControl>
                <Textarea placeholder="보유하고 계신 기타 자산에 대해 설명해주세요 (부동산, 암호화폐, 예술품 등)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">11. 이름</FormLabel>
              <FormControl>
                <Input placeholder="이름을 입력해주세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading} size="lg" className="font-bold text-lg px-8 py-6">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {loadingMessage}
                    </>
                ) : '내 전략 생성하기'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
