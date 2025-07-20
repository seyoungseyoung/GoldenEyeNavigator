
'use server';

/**
 * @fileOverview A stock signal generator AI agent.
 *
 * - generateStockSignal - A function that handles the stock signal generation process.
 * - StockSignalInput - The input type for the generateStockSignal function.
 * - StockSignalOutput - The return type for the generateStockSignal function.
 */

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
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

const HistoricalSignalPointSchema = z.object({
    date: z.string().describe("신호가 발생한 날짜 (YYYY-MM-DD 형식)."),
    signal: z.enum(['강한 매수', '매수', '보류', '매도', '강한 매도']).describe("해당 날짜의 매매 신호. '보류' 신호는 생략해도 좋습니다."),
    rationale: z.string().describe("해당 신호를 판단한 기술적 분석 근거. 추천된 3개 지표를 기반으로 간결하게 설명합니다."),
});

const StockSignalOutputSchema = z.object({
  indicator1: z.string().describe('첫 번째로 추천된 기술 지표 이름(한글 또는 영문 약어).'),
  indicator2: z.string().describe('두 번째로 추천된 기술 지표 이름(한글 또는 영문 약어).'),
  indicator3: z.string().describe('세 번째로 추천된 기술 지표 이름(한글 또는 영문 약어).'),
  signal: z
    .enum(['강한 매수', '매수', '보류', '매도', '강한 매도'])
    .describe(
      '세 지표를 종합하여 판단한 **가장 최신 날짜의** 최종 매매 신호. "강한 매수", "매수", "보류", "매도", "강한 매도" 중 하나여야 합니다.'
    ),
  historicalData: z.array(z.object({
    date: z.string(),
    close: z.number(),
  })).describe('Historical stock data for the last 252 days.'),
  historicalSignals: z.array(HistoricalSignalPointSchema).describe("과거 데이터의 각 주요 지점에서 발생한 매수 또는 매도 신호의 목록. '보류' 신호는 제외하고 의미있는 신호만 포함시켜 주세요.")
});
export type StockSignalOutput = z.infer<typeof StockSignalOutputSchema>;

export async function generateStockSignal(
  input: StockSignalInput
): Promise<StockSignalOutput> {

  const historicalData = await getHistoricalData(input.ticker);
  
  if (historicalData.length === 0) {
    throw new Error('주가 데이터를 가져오는 데 실패했습니다.');
  }
  
  const outputSchemaForPrompt = StockSignalOutputSchema.omit({ historicalData: true });
  const jsonSchema = zodToJsonSchema(outputSchemaForPrompt, "StockSignalOutputSchema");

  const systemPrompt = `당신은 한국인을 상대하는 주식 기술 분석 전문 AI 어시스턴트입니다.
제공된 주식 티커, 거래 전략, 그리고 과거 주가 데이터를 바탕으로 다음 두 가지 작업을 수행해야 합니다.

1.  **기술 지표 추천 및 최종 신호 생성**:
    *   아래 목록에서 가장 적합한 기술 지표 3개를 선택합니다.
    *   선택된 지표들을 종합적으로 분석하여 **가장 최신 날짜 기준**의 최종 매매 신호('signal' 필드)를 결정합니다.

2.  **과거 매매 신호 분석 (`historicalSignals` 필드 생성)**:
    *   제공된 과거 주가 데이터 전체를 분석하여, 추천된 3개의 기술 지표를 근거로 **의미 있는 매수 또는 매도 신호가 발생했던 과거 시점들**을 찾아 목록으로 만듭니다.
    *   각 신호 발생 시점마다 날짜('date'), 신호 유형('signal'), 그리고 판단 근거('rationale')를 포함해야 합니다.
    *   '보류' 신호는 `historicalSignals` 목록에 포함하지 마세요. 매수 또는 매도 시점만 알려주면 됩니다.

**출력은 반드시 다음 JSON 스키마를 따르는 유효한 JSON 객체여야만 합니다. JSON 객체 외에 다른 텍스트는 절대 포함하지 마십시오.**

**출력 JSON 스키마:**
\`\`\`json
${JSON.stringify(jsonSchema, null, 2)}
\`\`\`

**매우 중요한 규칙:**
- 'signal' 필드의 값은 반드시 "강한 매수", "매수", "보류", "매도", "강한 매도" 5가지 중 하나여야 합니다.
- 'indicator1', 'indicator2', 'indicator3' 필드에는 아래 목록에서 선택된 기술 지표의 이름을 문자열로 넣어야 합니다.
- 모든 설명('rationale')은 한글로 작성해야 합니다.

**사용 가능한 기술 지표 목록:**
SMA, EMA, MACD, Parabolic SAR, Ichimoku Cloud, RSI, Stochastic Oscillator, CCI, ROC, Bollinger Bands, Keltner Channel, OBV, VWAP, MFI, CMF
`;

  const userInput = `
주식 티커: ${input.ticker}
거래 전략: ${input.tradingStrategy || '지정되지 않음'}

분석할 과거 주가 데이터 (일부):
[
  ${historicalData.slice(0, 5).map(d => `{ "date": "${d.date}", "close": ${d.close} }`).join(',\n  ')},
  ... (총 ${historicalData.length}일치 데이터)
]
`;

  const messages: Message[] = [{ role: 'user', content: userInput }];

  const signalResult = await callHyperClovaX(messages, systemPrompt);

  const parsedResponse = outputSchemaForPrompt.safeParse(signalResult);

  if (!parsedResponse.success) {
      console.error("HyperClova X response validation failed:", parsedResponse.error);
      throw new Error("Received invalid data structure from AI.");
  }
  
  return {
    ...parsedResponse.data,
    historicalData,
  };
}
