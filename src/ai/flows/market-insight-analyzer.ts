
'use server';

/**
 * @fileOverview AI-powered market insight analyzer.
 *
 * - analyzeMarketInsight - A function that analyzes market insights and suggests actions.
 * - MarketInsightInput - The input type for the analyzeMarketInsight function.
 * - MarketInsightOutput - The return type for the analyzeMarketInsight function.
 */

import { z } from 'zod';
import { callHyperClovaX, Message } from '@/services/hyperclova';

const MarketInsightInputSchema = z.object({
  marketNews: z.string().describe('Recent market news and trends provided by the user.'),
});
export type MarketInsightInput = z.infer<typeof MarketInsightInputSchema>;

const MarketInsightOutputSchema = z.object({
  marketSummary: z.string().describe('최신 시장 뉴스 및 동향에 대한 한글 요약.'),
  suggestedActions: z.string().describe('시장 분석에 기반하여 제안하는 구체적인 행동 방안(한글).'),
  rationale: z.string().describe('제안된 조치에 대한 논리적 근거(한글).'),
});
export type MarketInsightOutput = z.infer<typeof MarketInsightOutputSchema>;


export async function analyzeMarketInsight(input: MarketInsightInput): Promise<MarketInsightOutput> {
  const systemPrompt = `당신은 한국인을 상대하는 전문 금융 분석가입니다. 사용자가 제공한 시장 뉴스를 분석하여, '시장 요약', '제안 조치', '근거' 세 부분으로 나누어 깊이 있는 통찰력을 제공해야 합니다.
  출력은 반드시 다음 JSON 스키마를 따르는 유효한 JSON 객체여야만 합니다. JSON 객체 외에 다른 텍스트는 절대 포함하지 마십시오.

  **출력 JSON 스키마 (예시):**
  \`\`\`json
  {
    "marketSummary": "미국 연준의 금리 동결 발표로 인해 시장의 불확실성이 일부 해소되었으며, 특히 기술주 중심의 상승세가 두드러졌습니다. 다음 주 예정된 주요 기술 기업들의 실적 발표가 향후 시장 방향성을 결정할 중요한 변수가 될 것입니다.",
    "suggestedActions": "현재 포트폴리오의 기술주 비중을 점검하고, 실적 발표 결과에 따라 비중을 조절할 준비를 하는 것이 좋습니다. 단기적인 변동성에 대비해 일부 현금 비중을 확보하는 것도 유효한 전략입니다.",
    "rationale": "금리 동결은 성장주에 긍정적이지만, 실적 발표 결과에 따라 개별 종목의 주가 변동성이 커질 수 있습니다. 따라서 섣부른 추가 매수보다는 관망하며 시장 상황에 유연하게 대응하는 것이 중요하기 때문입니다."
  }
  \`\`\`

  **매우 중요한 규칙:**
  - 모든 응답 내용은 **반드시 한글로만 작성해야 합니다.**
  - 세 가지 필드('marketSummary', 'suggestedActions', 'rationale')는 모두 비어 있지 않은 문자열이어야 합니다.`;

  const userInput = `다음 시장 뉴스와 동향을 분석해주세요: ${input.marketNews}`;
  
  const messages: Message[] = [{ role: 'user', content: userInput }];
  
  const response = await callHyperClovaX(messages, systemPrompt);
  
  // Validate the response against the Zod schema
  const parsedResponse = MarketInsightOutputSchema.safeParse(response);
  if (!parsedResponse.success) {
      console.error("HyperClova X response validation failed:", parsedResponse.error);
      throw new Error("Received invalid data structure from AI.");
  }
  
  return parsedResponse.data;
}
