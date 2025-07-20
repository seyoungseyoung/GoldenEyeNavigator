'use client';

import { useState } from 'react';
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
import { investmentStrategyGenerator, InvestmentStrategyInput } from '@/ai/flows/investment-strategy-generator';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  retirementHorizon: z.enum([
    '이미 은퇴함', '5년 미만', '5-10년', '10-20년', '20년 이상'
  ], { required_error: "은퇴 시기를 선택해주세요." }),
  incomeNeed: z.enum([
    '월 소득 필요 없음', '월 0원 - 100만 원', '월 101만 원-300만 원', '월 301만 원-500만 원', '월 500만 원 이상'
  ], { required_error: "현금흐름 필요성을 선택해주세요." }),
  assetsSize: z.enum([
    '5천만 원 미만', '5천만 원-2억 5천만 원 미만', '2억 5천만 원-10억 원 미만', '10억 원-50억 원 미만', '50억 원 이상'
  ], { required_error: "투자 자산 규모를 선택해주세요." }),
  taxSensitivity: z.enum(['매우 민감한', '다소 민감함', '민감하지 않음'], { required_error: "세금 민감도를 선택해주세요." }),
  themePreference: z.enum([
    '배당', '성장', 'ESG(환경, 사회, 지배구조)', '국내 중심', '해외 중심', '균형/분산'
  ], { required_error: "투자 테마 선호도를 선택해주세요." }),
  regionPreference: z.enum([
    '국내 주식 중심', '미국 주식 중심', '기타 선진국 주식 중심(유럽, 일본 등)', '신흥국 주식 중심(중국, 인도 등)', '글로벌 분산 투자'
  ], { required_error: "투자 지역 선호도를 선택해주세요." }),
  managementStyle: z.enum(['적극적(직접 관리 선호)', '소극적/자동화(설정 후 신경 쓰지 않는 방식 선호)'], { required_error: "관리 스타일을 선택해주세요." }),
  riskTolerance: z.enum([
    '보수적(자본 보존 우선)', '다소 보수적', '중립적(위험과 수익 균형)', '다소 공격적', '공격적(높은 수익 추구, 높은 위험 감수)'
  ], { required_error: "위험 감수 수준을 선택해주세요." }),
  otherAssets: z.string().optional(),
  name: z.string().min(1, { message: '이름을 입력해주세요.' }),
});

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

export function SurveyForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
      toast({
        title: "전략 생성 완료",
        description: "AI가 맞춤형 투자 전략을 생성했습니다.",
      });
      router.push('/strategy');
    } catch (error) {
      console.error('Error generating strategy:', error);
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: "전략 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
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
          name="otherAssets"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">9. 기타 자산</FormLabel>
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
              <FormLabel className="font-bold text-lg">10. 이름</FormLabel>
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
                        전략 생성 중...
                    </>
                ) : '내 전략 생성하기'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
