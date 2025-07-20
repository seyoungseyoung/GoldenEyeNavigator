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
  marketSummary: z.string().describe('최신 시장 뉴스 및 동향 요약.'),
  suggestedActions: z.string().describe('시장 분석에 기반한 제안 조치.'),
  rationale: z.string().describe('제안된 조치에 대한 근거.'),
});
export type MarketInsightOutput = z.infer<typeof MarketInsightOutputSchema>;


export async function analyzeMarketInsight(input: MarketInsightInput): Promise<MarketInsightOutput> {
  const systemPrompt = `당신은 한국인을 상대하고 있는 시장 뉴스 및 동향에 대한 통찰력을 제공하는 전문 금융 분석가입니다.
  사용자의 입력을 분석하여 시장 요약, 제안 조치, 그리고 그 조치에 대한 근거를 제공해야 합니다.
  출력은 다음 Zod 스키마를 따르는 유효한 JSON 객체여야 합니다:
  ${JSON.stringify(MarketInsightOutputSchema.shape)}

  JSON 객체 외에 다른 텍스트를 포함하지 마세요.
  모든 응답은 반드시 한글로 작성되어야 합니다.`;

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
