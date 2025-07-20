
'use server';

/**
 * @fileOverview A stock signal generator AI agent.
 *
 * - generateStockSignal - A function that handles the stock signal generation process.
 * - StockSignalInput - The input type for the generateStockSignal function.
 * - StockSignalOutput - The return type for the generateStockSignal function.
 */

import { z } from 'zod';
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
  indicator1: z.string().describe('첫 번째로 추천된 기술 지표 이름(한글 또는 영문 약어).'),
  indicator2: z.string().describe('두 번째로 추천된 기술 지표 이름(한글 또는 영문 약어).'),
  indicator3: z.string().describe('세 번째로 추천된 기술 지표 이름(한글 또는 영문 약어).'),
  signal: z
    .enum(['강한 매수', '매수', '보류', '매도', '강한 매도'])
    .describe(
      '세 지표를 종합하여 판단한 최종 매매 신호. "강한 매수", "매수", "보류", "매도", "강한 매도" 중 하나여야 합니다.'
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
  const systemPrompt = `당신은 한국인을 상대하는 주식 기술 분석 전문 AI 어시스턴트입니다.
제공된 주식 티커와 거래 전략을 바탕으로 아래 목록에서 가장 적합한 기술 지표 3개를 선택해야 합니다. 그런 다음, 선택된 지표들을 종합적으로 분석하여 최종 매매 신호를 결정합니다.
출력은 'historicalData' 필드를 제외하고 다음 JSON 스키마를 따르는 유효한 JSON 객체여야만 합니다. JSON 객체 외에 다른 텍스트는 절대 포함하지 마십시오.

**출력 JSON 스키마:**
{
  "indicator1": "추천 기술 지표 1 (문자열)",
  "indicator2": "추천 기술 지표 2 (문자열)",
  "indicator3": "추천 기술 지표 3 (문자열)",
  "signal": "종합 매매 신호 (아래 5가지 중 하나)"
}

**매우 중요한 규칙:**
- 'signal' 필드의 값은 반드시 "강한 매수", "매수", "보류", "매도", "강한 매도" 5가지 중 하나여야 합니다.
- 'indicator1', 'indicator2', 'indicator3' 필드에는 아래 목록에서 선택된 기술 지표의 이름을 문자열로 넣어야 합니다.

**사용 가능한 기술 지표 목록:**
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
