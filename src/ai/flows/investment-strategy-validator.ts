
'use server';

/**
 * @fileOverview A validator and editor AI agent for investment strategies.
 * It takes a draft strategy and refines it to meet specific business rules.
 *
 * - validateAndRefineStrategy - The main function to validate and refine the strategy.
 */

import { z } from 'zod';
import { callHyperClovaX, Message } from '@/services/hyperclova';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const InvestmentStrategyInputSchema = z.object({
  retirementHorizon: z.enum([
    '이미 은퇴함',
    '5년 미만',
    '5-10년',
    '10-20년',
    '20년 이상',
  ]),
  incomeNeed: z.enum([
    '월 소득 필요 없음',
    '월 0원 - 100만 원',
    '월 101만 원-300만 원',
    '월 301만 원-500만 원',
    '월 500만 원 이상',
  ]),
  assetsSize: z.enum([
    '5천만 원 미만',
    '5천만 원-2억 5천만 원 미만',
    '2억 5천만 원-10억 원 미만',
    '10억 원-50억 원 미만',
    '50억 원 이상',
  ]),
  taxSensitivity: z.enum([
    '매우 민감한',
    '다소 민감함',
    '민감하지 않음',
  ]),
  themePreference: z.enum([
    '배당',
    '성장',
    'ESG(환경, 사회, 지배구조)',
    '국내 중심',
    '해외 중심',
    '균형/분산',
  ]),
  regionPreference: z.enum([
    '국내 주식 중심',
    '미국 주식 중심',
    '기타 선진국 주식 중심(유럽, 일본 등)',
    '신흥국 주식 중심(중국, 인도 등)',
    '글로벌 분산 투자',
  ]),
  managementStyle: z.enum([
    '적극적(직접 관리 선호)',
    '소극적/자동화(설정 후 신경 쓰지 않는 방식 선호)',
  ]),
  riskTolerance: z.enum([
    '보수적(자본 보존 우선)',
    '다소 보수적',
    '중립적(위험과 수익 균형)',
    '다소 공격적',
    '공격적(높은 수익 추구, 높은 위험 감수)',
  ]),
  retirementGoals: z.string().optional(),
  otherAssets: z.string().optional(),
  name: z.string(),
});
export type InvestmentStrategyInput = z.infer<typeof InvestmentStrategyInputSchema>;

// The output schema for the GENERATOR AI. It's more flexible.
export const InvestmentStrategyDraftSchema = z.object({
  portfolioName: z.string(),
  assetAllocation: z.object({
    stocks: z.coerce.number(),
    bonds: z.coerce.number(),
    cash: z.coerce.number(),
  }),
  etfStockRecommendations: z.array(
    z.object({
      ticker: z.string(),
      rationale: z.string(),
    })
  ), // No min/max constraints here
  tradingStrategy: z.string(),
  strategyExplanation: z.string(),
});

// Final, validated output schema. This is what the user gets.
export const InvestmentStrategyOutputSchema = z.object({
  portfolioName: z.string(),
  assetAllocation: z.object({
    stocks: z.coerce.number(),
    bonds: z.coerce.number(),
    cash: z.coerce.number(),
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


export async function validateAndRefineStrategy(draft: unknown): Promise<InvestmentStrategyOutput> {
  const parsedDraft = InvestmentStrategyDraftSchema.safeParse(draft);

  if (!parsedDraft.success) {
      throw new Error("Validator received an invalid draft object.");
  }

  const finalJsonSchema = zodToJsonSchema(InvestmentStrategyOutputSchema, "InvestmentStrategyOutputSchema");

  const systemPrompt = `당신은 투자 전략을 검토하고 최종 편집하는 AI 편집자입니다.
  주어진 투자 전략 **초안**을 분석하여, 아래의 **엄격한 규칙**에 맞게 수정하고 최종 완성된 JSON 객체를 반환해야 합니다.

  **엄격한 규칙:**
  1.  \`etfStockRecommendations\` 배열은 **반드시 3개에서 4개의 항목만 포함**해야 합니다.
      - 만약 초안에 2개 이하의 종목이 있다면, 투자 성향에 맞는 종목을 **추가**하여 3개를 만드세요.
      - 만약 초안에 5개 이상의 종목이 있다면, 가장 중요도가 낮거나 중복되는 종목을 **제거**하여 4개로 줄이세요.
  2.  \`assetAllocation\`의 \`stocks\`, \`bonds\`, \`cash\` 값의 합은 **정확히 100**이 되어야 합니다. 합계가 100이 아니라면, 비율을 유지하면서 합계가 100이 되도록 세 값을 조정하세요.
  3.  다른 모든 필드(\`portfolioName\`, \`tradingStrategy\` 등)의 내용은 최대한 유지하되, 문법적으로 어색하거나 명확하지 않은 부분이 있다면 자연스럽게 다듬어주세요.

  **출력은 반드시 다음 최종 JSON 스키마를 따르는 유효한 JSON 객체여야만 합니다. 그 어떤 다른 텍스트도 포함해서는 안 됩니다.**

  **최종 출력 JSON 스키마:**
  \`\`\`json
  ${JSON.stringify(finalJsonSchema, null, 2)}
  \`\`\`

  **매우 중요한 규칙:**
  - 모든 텍스트 내용은 **반드시 한글로만 작성되어야 합니다.** (티커 심볼 제외).
  - 최종 출력물은 **규칙을 완벽하게 준수한, 단 하나의 JSON 객체**여야 합니다.
  `;
  
  const userInput = `다음 투자 전략 초안을 검토하고, 위의 규칙에 따라 최종본으로 수정해주세요.

  **전략 초안:**
  \`\`\`json
  ${JSON.stringify(parsedDraft.data, null, 2)}
  \`\`\`
  `;
  
  const messages: Message[] = [{ role: 'user', content: userInput }];

  // Call the AI to get the final, validated strategy
  const finalResponse = await callHyperClovaX(messages, systemPrompt);

  const parsedFinalResponse = InvestmentStrategyOutputSchema.safeParse(finalResponse);
  if (!parsedFinalResponse.success) {
    console.error("Validator AI response validation failed:", parsedFinalResponse.error.flatten());
    throw new Error("검수 AI로부터 유효하지 않은 최종 데이터 구조를 받았습니다.");
  }
  
  console.log("Validator AI successfully refined the strategy.");
  return parsedFinalResponse.data;
}
