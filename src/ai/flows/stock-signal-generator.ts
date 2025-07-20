
'use server';

/**
 * @fileOverview A stock signal generator AI agent. This agent selects the best technical indicators
 * and their parameters for a given stock and trading strategy. The actual signal calculation
 * is performed by the application code.
 *
 * - generateStockSignal - A function that handles the indicator selection process.
 * - StockSignalInput - The input type for the generateStockSignal function.
 * - StockSignalOutput - The return type for the generateStockSignal function.
 */

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { callHyperClovaX, Message } from '@/services/hyperclova';
import { INDICATORS } from '@/services/indicatorService';

// Input now includes historical data to help the AI make a better decision.
const StockSignalInputSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the stock.'),
  tradingStrategy: z
    .string()
    .optional()
    .describe(
      'The desired trading strategy/timing (e.g., short-term volatility, long-term buy and hold).'
    ),
  // historicalData is passed to the AI for context but not part of the output schema for the prompt.
  historicalData: z.array(z.any()).describe("Historical data for context."), 
});
export type StockSignalInput = z.infer<typeof StockSignalInputSchema>;

const IndicatorParameterSchema = z.object({
  name: z.enum(INDICATORS).describe("The name of the technical indicator."),
  fullName: z.string().describe('The full name of the indicator in Korean. e.g., "상대강도지수"'),
  params: z.record(z.any()).describe("A key-value object for the indicator's parameters. e.g., {'period': 14, 'overbought': 70, 'oversold': 30}")
});

// Output only contains the AI's recommendations, not data it received.
const StockSignalOutputSchema = z.object({
  recommendedIndicators: z.array(IndicatorParameterSchema).min(3).max(3)
    .describe("An array of exactly 3 recommended technical indicators and their parameters."),
  finalSignal: z
    .enum(['강한 매수', '매수', '보류', '매도', '강한 매도'])
    .describe(
      '세 지표를 종합하여 판단한 **가장 최신 날짜의** 최종 매매 신호. "강한 매수", "매수", "보류", "매도", "강한 매도" 중 하나여야 합니다.'
    ),
  rationale: z.string().describe("A brief explanation in Korean of why these indicators were chosen and what the combined signal means for the most recent data point."),
});
export type StockSignalOutput = z.infer<typeof StockSignalOutputSchema>;

export async function generateStockSignal(
  input: StockSignalInput
): Promise<StockSignalOutput> {

  const jsonSchema = zodToJsonSchema(StockSignalOutputSchema, "StockSignalOutputSchema");

  const systemPrompt = `당신은 한국인을 상대하는 주식 기술 분석 전문 AI 어시스턴트입니다.
제공된 주식 티커와 거래 전략을 바탕으로, 가장 적합한 기술 지표 3개를 선택하고, 그 지표를 계산하는 데 필요한 매개변수(parameter)를 결정해야 합니다.

**사용 가능한 기술 지표 및 매개변수:**
- **RSI (상대강도지수):**
  - \`params\`: \`{ "period": number, "overbought": number, "oversold": number }\` (추천: period 14, overbought 70, oversold 30)
- **MACD (이동평균 수렴-확산):**
  - \`params\`: \`{ "fastPeriod": number, "slowPeriod": number, "signalPeriod": number }\` (추천: fast 12, slow 26, signal 9)
- **BollingerBands (볼린저 밴드):**
  - \`params\`: \`{ "period": number, "stdDev": number }\` (추천: period 20, stdDev 2)
- **Stochastic (스토캐스틱 오실레이터):**
  - \`params\`: \`{ "period": number, "signalPeriod": number }\` (추천: period 14, signalPeriod 3)

**작업:**
1.  주어진 티커와 전략에 가장 적합한 **기술 지표 3개를 위 목록에서 선택**합니다.
2.  선택된 각 지표에 대해 **최적의 매개변수(\`params\`)를 결정**합니다.
3.  3개의 지표를 종합적으로 분석하여 **가장 최신 데이터 기준**의 최종 매매 신호(\`finalSignal\`)와 그 근거(\`rationale\`)를 생성합니다.

**출력은 반드시 다음 JSON 스키마를 따르는 유효한 JSON 객체여야만 합니다. JSON 객체 외에 다른 텍스트는 절대 포함하지 마십시오.**

**출력 JSON 스키마:**
\`\`\`json
${JSON.stringify(jsonSchema, null, 2)}
\`\`\`

**매우 중요한 규칙:**
- \`recommendedIndicators\` 배열에는 **정확히 3개의 지표** 객체가 포함되어야 합니다.
- 각 지표 객체의 \`name\` 필드는 반드시 ["RSI", "MACD", "BollingerBands", "Stochastic"] 중 하나여야 합니다.
- \`params\` 객체는 위에서 설명한 각 지표의 매개변수 형식을 정확히 따라야 합니다.
- 모든 설명(\`rationale\`, \`fullName\`)은 한글로 작성해야 합니다.
`;

  // We only send the last few data points to the AI for context, to avoid large payloads.
  const recentData = input.historicalData.slice(-10).map(d => ({date: d.date, close: d.close}));
  const userInput = `
주식 티커: ${input.ticker}
거래 전략: ${input.tradingStrategy || '지정되지 않음'}
최신 주가 데이터 (참고용): ${JSON.stringify(recentData)}
`;

  const messages: Message[] = [{ role: 'user', content: userInput }];

  try {
    const signalResult = await callHyperClovaX(messages, systemPrompt);
    const parsedResponse = StockSignalOutputSchema.safeParse(signalResult);

    if (!parsedResponse.success) {
        console.error("HyperClova X response validation failed:", parsedResponse.error.flatten());
        throw new Error("AI로부터 유효하지 않은 데이터 구조를 받았습니다.");
    }
    
    return parsedResponse.data;

  } catch(error) {
    console.error("Error in generateStockSignal flow:", error);
    // Re-throw the error to be caught by the calling component
    throw error;
  }
}
