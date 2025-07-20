
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
  otherAssets: z.string().describe('Description of other assets.'),
  name: z.string().describe('User name.'),
});
export type InvestmentStrategyInput = z.infer<typeof InvestmentStrategyInputSchema>;

const InvestmentStrategyOutputSchema = z.object({
  assetAllocation: z.object({
    stocks: z.number().describe('주식에 할당된 자산의 비율(%). 0에서 100 사이의 숫자.'),
    bonds: z.number().describe('채권에 할당된 자산의 비율(%). 0에서 100 사이의 숫자.'),
    cash: z.number().describe('현금에 할당된 자산의 비율(%). 0에서 100 사이의 숫자.'),
  }).describe('주식, 채권, 현금에 대한 추천 자산 배분 비율. 합계는 100이어야 합니다.'),
  etfStockRecommendations: z.array(
    z.object({
      ticker: z.string().describe('ETF 또는 주식의 티커 심볼. (예: "AAPL", "005930.KS")'),
      rationale: z.string().describe('해당 종목을 추천하는 이유에 대한 한글 설명.'),
    })
  ).min(3).max(4).describe('3개에서 4개의 추천 ETF 및 주식 목록.'),
  tradingStrategy: z.string().describe('포트폴리오 운용 방식에 대한 한글 설명. 언제 사고팔아야 하는지에 대한 개요.'),
  strategyExplanation: z.string().describe('생성된 전체 투자 전략에 대한 상세한 한글 설명 및 추천 근거.'),
});
export type InvestmentStrategyOutput = z.infer<typeof InvestmentStrategyOutputSchema>;

export async function investmentStrategyGenerator(input: InvestmentStrategyInput): Promise<InvestmentStrategyOutput> {
  const jsonSchema = zodToJsonSchema(InvestmentStrategyOutputSchema, "InvestmentStrategyOutputSchema");

  const systemPrompt = `당신은 한국인을 상대하는 전문 금융 투자 자문가입니다. 사용자의 투자 프로필을 기반으로 맞춤형 투자 전략을 생성해주세요.
  출력은 반드시 다음 JSON 스키마를 따르는 유효한 JSON 객체여야만 합니다. JSON 객체 외에 다른 텍스트는 절대 포함하지 마십시오.

  **출력 JSON 스키마:**
  \`\`\`json
  ${JSON.stringify(jsonSchema, null, 2)}
  \`\`\`

  **매우 중요한 규칙:**
  - 모든 응답 내용은 **반드시 한글로만 작성해야 합니다.** (티커 심볼 제외)
  - 'assetAllocation'의 'stocks', 'bonds', 'cash' 필드는 반드시 **숫자(number)**여야 하며, 그 합은 100이 되어야 합니다.
  - 'etfStockRecommendations'는 반드시 **3개에서 4개의 항목을 포함하는 배열(array)**이어야 합니다.
  - 각 추천 종목('etfStockRecommendations'의 요소)은 'ticker'(문자열)와 'rationale'(한글 문자열) 필드를 가져야 합니다.`;

  const userInput = `다음은 투자자 정보입니다. 이 정보를 바탕으로 투자 전략을 생성하고, 모든 설명을 한글로 작성해주세요.

  - 은퇴 시기: ${input.retirementHorizon}
  - 월 필요 소득: ${input.incomeNeed}
  - 총 투자 자산: ${input.assetsSize}
  - 세금 민감도: ${input.taxSensitivity}
  - 선호 투자 테마: ${input.themePreference}
  - 선호 투자 지역: ${input.regionPreference}
  - 선호 관리 스타일: ${input.managementStyle}
  - 위험 감수 수준: ${input.riskTolerance}
  - 기타 자산: ${input.otherAssets}
  - 투자자 이름: ${input.name}`;

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
