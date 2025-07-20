
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

  **출력 JSON 스키마:**
  {
    "marketSummary": "시장 상황에 대한 한글 요약(문자열)",
    "suggestedActions": "제안하는 조치에 대한 한글 설명(문자열)",
    "rationale": "제안 조치의 근거에 대한 한글 설명(문자열)"
  }

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
