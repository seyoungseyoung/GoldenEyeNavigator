
'use server';

/**
 * @fileOverview Generates a personalized investment strategy based on user input.
 *
 * - investmentStrategyGenerator - A function that generates an investment strategy.
 * - InvestmentStrategyInput - The input type for the investmentStrategyGenerator function.
 * - InvestmentStrategyOutput - The return type for the investmentStrategyGenerator function.
 */
import { z } from 'zod';
import { callHyperClovaX, Message } from '@/services/hyperclova';
import { zodToJsonSchema } from 'zod-to-json-schema';

const InvestmentStrategyInputSchema = z.object({
  retirementHorizon: z.enum([
    '이미 은퇴함',
    '5년 미만',
    '5-10년',
    '10-20년',
    '20년 이상',
  ]).describe('Time until retirement.'),
  incomeNeed: z.enum([
    '월 소득 필요 없음',
    '월 0원 - 100만 원',
    '월 101만 원-300만 원',
    '월 301만 원-500만 원',
    '월 500만 원 이상',
  ]).describe('Level of income needed monthly.'),
  assetsSize: z.enum([
    '5천만 원 미만',
    '5천만 원-2억 5천만 원 미만',
    '2억 5천만 원-10억 원 미만',
    '10억 원-50억 원 미만',
    '50억 원 이상',
  ]).describe('Total investment assets size.'),
  taxSensitivity: z.enum([
    '매우 민감한',
    '다소 민감함',
    '민감하지 않음',
  ]).describe('Sensitivity to taxes.'),
  themePreference: z.enum([
    '배당',
    '성장',
    'ESG(환경, 사회, 지배구조)',
    '국내 중심',
    '해외 중심',
    '균형/분산',
  ]).describe('Preferred investment themes.'),
  regionPreference: z.enum([
    '국내 주식 중심',
    '미국 주식 중심',
    '기타 선진국 주식 중심(유럽, 일본 등)',
    '신흥국 주식 중심(중국, 인도 등)',
    '글로벌 분산 투자',
  ]).describe('Preferred investment region.'),
  managementStyle: z.enum([
    '적극적(직접 관리 선호)',
    '소극적/자동화(설정 후 신경 쓰지 않는 방식 선호)',
  ]).describe('Preferred management style.'),
  riskTolerance: z.enum([
    '보수적(자본 보존 우선)',
    '다소 보수적',
    '중립적(위험과 수익 균형)',
    '다소 공격적',
    '공격적(높은 수익 추구, 높은 위험 감수)',
  ]).describe('Risk tolerance level.'),
  retirementGoals: z.string().optional().describe('User\'s written retirement goals or concerns.'),
  otherAssets: z.string().optional().describe('Description of other assets.'),
  name: z.string().describe('User name.'),
});
export type InvestmentStrategyInput = z.infer<typeof InvestmentStrategyInputSchema>;

const InvestmentStrategyOutputSchema = z.object({
  portfolioName: z.string(),
  assetAllocation: z.object({
    stocks: z.number(),
    bonds: z.number(),
    cash: z.number(),
  }),
  etfStockRecommendations: z.array(
    z.object({
      ticker: z.string(),
      rationale: z.string(),
    })
  ).min(3).max(4),
  tradingStrategy: z.string(),
  strategyExplanation: z.string(),
});
export type InvestmentStrategyOutput = z.infer<typeof InvestmentStrategyOutputSchema>;

export async function investmentStrategyGenerator(input: InvestmentStrategyInput): Promise<InvestmentStrategyOutput> {
  const jsonSchema = zodToJsonSchema(InvestmentStrategyOutputSchema, "InvestmentStrategyOutputSchema");

  const systemPrompt = `당신은 한국인을 상대하는 전문 금융 투자 자문가입니다. 사용자의 투자 프로필을 기반으로 맞춤형 투자 전략을 생성해주세요.

  **작업 흐름:**
  1.  **사용자 프로필 분석:** 사용자의 설문 응답, 특히 '은퇴 목표 및 우려 사항'에 서술된 내용을 깊이 있게 분석하여, 사용자의 투자 성향(예: 보수적, 공격적, 안정 추구형)과 핵심 목표(예: 자산 보전, 높은 수익, 꾸준한 현금흐름)를 정확히 파악합니다. 예를 들어, '자산 고갈'에 대한 우려를 표하면 안정성을 강화하고, '빠른 자산 증식'을 원하면 성장주 비중을 높여야 합니다.
  2.  **포트폴리오 이름 부여:** 분석된 성향에 가장 적합한 포트폴리오 이름을 부여합니다. (예: "안정수익 포트폴리오", "균형성장 포트폴리오", "고수익 성장주 포트폴리오", "글로벌 분산투자 포트폴리오")
  3.  **전략 생성:** 부여된 포트폴리오 이름과 분석된 성향에 맞춰 자산 배분, 추천 종목, 거래 전략을 구체적으로 생성합니다.
  4.  **친절한 설명 작성:** 생성된 전략 전체에 대해, 왜 이런 전략이 추천되었는지 상세하고 친절하게 설명합니다. 전문 용어를 최대한 쉽게 풀어서 시니어 투자자도 이해할 수 있도록 작성해야 합니다.

  **출력은 반드시 다음 JSON 스키마를 따르는 유효한 JSON 객체여야만 합니다. JSON 객체 외에 다른 텍스트는 절대 포함하지 마십시오.**

  **출력 JSON 스키마:**
  \`\`\`json
  ${JSON.stringify(jsonSchema, null, 2)}
  \`\`\`

  **매우 중요한 규칙:**
  - 모든 응답 내용은 **반드시 한글로만 작성해야 합니다.** (티커 심볼 제외)
  - 'assetAllocation'의 'stocks', 'bonds', 'cash' 필드는 반드시 **숫자(number)**여야 하며, 그 합은 100이 되어야 합니다.
  - 'etfStockRecommendations'는 반드시 **3개에서 4개의 항목을 포함하는 배열(array)**이어야 합니다.`;

  const userInput = `다음은 투자자 정보입니다. 이 정보를 바탕으로 투자 전략을 생성하고, 모든 설명을 한글로 작성해주세요.

  - 투자자 이름: ${input.name}
  - 은퇴 시기: ${input.retirementHorizon}
  - 월 필요 소득: ${input.incomeNeed}
  - 총 투자 자산: ${input.assetsSize}
  - 위험 감수 수준: ${input.riskTolerance}
  - 선호 투자 테마: ${input.themePreference}
  - 선호 투자 지역: ${input.regionPreference}
  - 선호 관리 스타일: ${input.managementStyle}
  - 세금 민감도: ${input.taxSensitivity}
  - 기타 자산: ${input.otherAssets || '제공되지 않음'}
  - 은퇴 목표 및 우려 사항: ${input.retirementGoals || '제공되지 않음'}`;

  const messages: Message[] = [{ role: 'user', content: userInput }];
  
  const response = await callHyperClovaX(messages, systemPrompt);

  // Validate the response against the Zod schema
  const parsedResponse = InvestmentStrategyOutputSchema.safeParse(response);
  if (!parsedResponse.success) {
      console.error("HyperClova X response validation failed:", parsedResponse.error);
      throw new Error("Received invalid data structure from AI.");
  }
  
  const data = parsedResponse.data;

  // Normalize asset allocation to ensure it sums to 100
  const { stocks, bonds, cash } = data.assetAllocation;
  const total = stocks + bonds + cash;

  if (total !== 100 && total > 0) {
    console.warn(`Original allocation (${stocks}, ${bonds}, ${cash}) sum is ${total}. Normalizing...`);
    data.assetAllocation.stocks = Math.round((stocks / total) * 100);
    data.assetAllocation.bonds = Math.round((bonds / total) * 100);
    // Adjust the last one to make sure the sum is exactly 100
    data.assetAllocation.cash = 100 - data.assetAllocation.stocks - data.assetAllocation.bonds;
    console.log(`Normalized allocation: ${data.assetAllocation.stocks}, ${data.assetAllocation.bonds}, ${data.assetAllocation.cash}`);
  }
  
  return data;
}
