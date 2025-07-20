'use server';

/**
 * @fileOverview A stock signal generator AI agent.
 *
 * - generateStockSignal - A function that handles the stock signal generation process.
 * - StockSignalInput - The input type for the generateStockSignal function.
 * - StockSignalOutput - The return type for the generateStockSignal function.
 */

import { z } from 'genkit';
import { getHistoricalData } from '@/services/stockService';
import { callHyperClovaX, Message } from '@/services/hyperclova';

const StockSignalInputSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the stock.'),
  tradingStrategy: z
    .string()
    .optional()
    .describe(
      'The desired trading strategy/timing (e.g., short-term volatility, long-term buy and hold).'
    ),
});
export type StockSignalInput = z.infer<typeof StockSignalInputSchema>;

const StockSignalOutputSchema = z.object({
  indicator1: z.string().describe('The first recommended technical indicator.'),
  indicator2: z.string().describe('The second recommended technical indicator.'),
  indicator3: z.string().describe('The third recommended technical indicator.'),
  signal: z
    .string()
    .describe(
      'The overall buy/sell signal based on the three indicators (e.g., 강한 매수, 매수, 보류, 매도, 강한 매도).'
    ),
  historicalData: z.array(z.object({
    date: z.string(),
    close: z.number(),
  })).describe('Historical stock data for the last 252 days.')
});
export type StockSignalOutput = z.infer<typeof StockSignalOutputSchema>;

export async function generateStockSignal(
  input: StockSignalInput
): Promise<StockSignalOutput> {
  const systemPrompt = `당신은 한국인을 상대하고 있는 주식 기술 분석 전문 AI 어시스턴트입니다.
제공된 주식 티커와 거래 전략을 바탕으로 아래 목록에서 가장 적합한 기술 지표 3개를 선택해야 합니다. 그런 다음 각 지표를 분석하여 매수, 매도 또는 보류 신호를 생성하고, 점수를 할당하고, 종합적인 거래 신호를 결정합니다.
출력은 'historicalData' 필드를 제외하고 다음 Zod 스키마를 준수하는 유효한 JSON 객체여야 합니다:
${JSON.stringify(StockSignalOutputSchema.omit({ historicalData: true }).shape)}

JSON 객체 외에 다른 텍스트를 포함하지 마세요.
모든 응답은 반드시 한글로 작성되어야 합니다.

**사용 가능한 기술 지표:**
1. SMA (단순 이동 평균)
2. EMA (지수 이동 평균)
3. MACD (이동 평균 수렴 발산)
4. Parabolic SAR
5. Ichimoku Cloud (일목균형표)
6. RSI (상대 강도 지수)
7. Stochastic Oscillator (스토캐스틱 오실레이터)
8. CCI (상품 채널 지수)
9. ROC (변화율)
10. Bollinger Bands (볼린저 밴드)
11. Keltner Channel (켈트너 채널)
12. OBV (온밸런스 볼륨)
13. VWAP (거래량 가중 평균 가격)
14. MFI (자금 흐름 지수)
15. CMF (차이킨 자금 흐름)

**종합 신호 계산:**
선택된 세 지표의 점수를 합산합니다.
- **총점 3점:** "강한 매수"
- **총점 1점 또는 2점:** "매수"
- **총점 0점:** "보류"
- **총점 -1점 또는 -2점:** "매도"
- **총점 -3점:** "강한 매도"
`;

  const userInput = `주식 티커: ${input.ticker}\n거래 전략: ${input.tradingStrategy || '지정되지 않음'}`;

  const messages: Message[] = [{ role: 'user', content: userInput }];

  const [signalResult, historicalData] = await Promise.all([
    callHyperClovaX(messages, systemPrompt),
    getHistoricalData(input.ticker),
  ]);

  const parsedResponse = StockSignalOutputSchema.omit({ historicalData: true }).safeParse(signalResult);
  if (!parsedResponse.success) {
      console.error("HyperClova X response validation failed:", parsedResponse.error);
      throw new Error("Received invalid data structure from AI.");
  }
  
  return {
    ...parsedResponse.data,
    historicalData,
  };
}
