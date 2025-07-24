
'use server';

/**
 * @fileOverview Converts a company name or user query into a stock ticker symbol.
 *
 * - convertToTicker - A function to convert a query into a ticker symbol.
 * - TickerConversionInput - The input type for the convertToTicker function.
 * - TickerConversionOutput - The return type for the convertToTicker function.
 */

import { z } from 'zod';
import { callHyperClovaX, Message } from '@/services/hyperclova';
import { zodToJsonSchema } from 'zod-to-json-schema';

const TickerConversionInputSchema = z.object({
  query: z.string().describe('The user query, which could be a company name, ticker, or other text.'),
});
export type TickerConversionInput = z.infer<typeof TickerConversionInputSchema>;

const TickerConversionOutputSchema = z.object({
  success: z.boolean().describe('Whether the conversion was successful.'),
  ticker: z.string().nullable().describe('The converted ticker symbol (e.g., "AAPL", "005930.KS"). Null if not found.'),
  reason: z.string().describe('A brief explanation in Korean about the result.'),
});
export type TickerConversionOutput = z.infer<typeof TickerConversionOutputSchema>;

export async function convertToTicker(input: TickerConversionInput): Promise<TickerConversionOutput> {
  const jsonSchema = zodToJsonSchema(TickerConversionOutputSchema, 'TickerConversionOutputSchema');

  const systemPrompt = `당신은 사용자의 입력을 주식 티커 심볼로 변환하는 AI 전문가입니다.
사용자가 회사 이름(한글 또는 영문), 티커, 또는 관련 텍스트를 입력하면, 가장 가능성이 높은 야후 파이낸스(Yahoo Finance) 기준의 공식 티커 심볼로 변환해야 합니다.

**변환 규칙:**
- 한국 주식은 코스피(\`.KS\`) 또는 코스닥(\`.KQ\`) 접미사를 포함해야 합니다. (예: 삼성전자 -> \`005930.KS\`)
- 미국 주식은 접미사가 없습니다. (예: Apple -> \`AAPL\`)
- 입력이 이미 유효한 티커 형식(예: 'MSFT')이면, 그대로 반환합니다.
- 변환할 수 없는 경우, \`success\`를 \`false\`로 설정하고, \`ticker\`는 \`null\`로, \`reason\`에는 변환 실패 이유를 한글로 간결하게 설명합니다.

**출력은 반드시 다음 JSON 스키마를 따르는 유효한 JSON 객체여야만 합니다. JSON 객체 외에 다른 텍스트는 절대 포함하지 마십시오.**

**입출력 예시:**
- **사용자 입력:** "삼성전자"
- **AI 출력(JSON):**
  \`\`\`json
  {
    "success": true,
    "ticker": "005930.KS",
    "reason": "'삼성전자'는 한국 코스피 시장의 '005930.KS' 티커로 변환되었습니다."
  }
  \`\`\`
- **사용자 입력:** "애플"
- **AI 출력(JSON):**
  \`\`\`json
  {
    "success": true,
    "ticker": "AAPL",
    "reason": "'애플'은 미국 나스닥 시장의 'AAPL' 티커로 변환되었습니다."
  }
  \`\`\`
- **사용자 입력:** "없는회사"
- **AI 출력(JSON):**
  \`\`\`json
  {
    "success": false,
    "ticker": null,
    "reason": "'없는회사'에 해당하는 주식 티커를 찾을 수 없습니다."
  }
  \`\`\`
`;

  const userInput = `다음 사용자 입력을 주식 티커로 변환해주세요: "${input.query}"`;
  const messages: Message[] = [{ role: 'user', content: userInput }];

  try {
    const response = await callHyperClovaX(messages, systemPrompt);
    const parsedResponse = TickerConversionOutputSchema.safeParse(response);
    
    if (!parsedResponse.success) {
      console.error("Ticker conversion response validation failed:", parsedResponse.error);
      return { success: false, ticker: null, reason: "AI로부터 유효하지 않은 응답을 받았습니다." };
    }
    
    return parsedResponse.data;

  } catch (error) {
    console.error('Error during ticker conversion:', error);
    return { success: false, ticker: null, reason: "티커 변환 중 오류가 발생했습니다." };
  }
}
