
'use server';

/**
 * @fileOverview A financial Q&A AI agent.
 *
 * - financialQnA - A function that answers user's financial questions based on their strategy.
 * - FinancialQnAInput - The input type for the financialQnA function.
 * - FinancialQnAOutput - The return type for the financialQnA function.
 */

import { z } from 'zod';
import { callHyperClovaX, Message } from '@/services/hyperclova';

// This is the schema of the strategy data this Q&A agent will use as context.
// It's imported from the validator flow to ensure consistency.
import type { InvestmentStrategyOutput } from './investment-strategy-validator';
import { InvestmentStrategyOutputSchema } from './investment-strategy-validator';


const FinancialQnAInputSchema = z.object({
  question: z.string().describe("The user's financial question."),
  investmentStrategy: InvestmentStrategyOutputSchema.describe("The user's personalized investment strategy to be used as context.")
});
export type FinancialQnAInput = z.infer<typeof FinancialQnAInputSchema>;

const FinancialQnAOutputSchema = z.object({
  answer: z.string().describe("The AI's answer to the financial question in Korean, based on the provided strategy."),
});
export type FinancialQnAOutput = z.infer<typeof FinancialQnAOutputSchema>;

export async function financialQnA(input: FinancialQnAInput): Promise<FinancialQnAOutput> {
  const parsedInput = FinancialQnAInputSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new Error(`Invalid input provided to financialQnA flow: ${parsedInput.error.message}`);
  }
  
  const systemPrompt = `당신은 사용자의 개인 투자 전략을 완벽하게 파악하고 있는, 친절하고 유능한 AI 금융 어드바이저입니다.
  
  사용자의 질문에 답변할 때, 반드시 아래에 제공된 **사용자의 맞춤 투자 전략 정보**를 최우선 근거로 삼아야 합니다.
  사용자의 자산 배분, 추천 종목, 거래 전략 등을 참고하여 구체적이고 개인화된 답변을 제공해주세요.

  **사용자 맞춤 투자 전략 정보:**
  \`\`\`json
  ${JSON.stringify(input.investmentStrategy, null, 2)}
  \`\`\`

  **규칙:**
  - 특정 종목에 대한 매수/매도 추천이나 직접적인 투자 자문을 해서는 안 됩니다.
  - 대신, 제공된 전략의 틀 안에서 원칙, 개념 설명, 고려해야 할 사항들을 중심으로 답변해야 합니다.
  - 사용자가 이해하기 쉽게, 전문 용어를 풀어서 친절한 어조로 설명해주세요.
  - 모든 답변은 반드시 한글로 작성해야 합니다.
  - **다른 어떤 텍스트도 포함하지 말고, 오직 답변 내용만 출력하세요.**
  `;
  
  const userInput = `내 투자 전략을 바탕으로, 다음 금융 관련 질문에 답변해주세요: "${input.question}"`;
  const messages: Message[] = [{ role: 'user', content: userInput }];

  try {
    // The `callHyperClovaX` service will handle wrapping the plain text response 
    // into a JSON object with the "answer" key.
    const response = await callHyperClovaX(messages, systemPrompt, 'answer');
    
    const parsedResponse = FinancialQnAOutputSchema.safeParse(response);

    if (!parsedResponse.success) {
      const errorDetails = JSON.stringify(parsedResponse.error.flatten(), null, 2);
      console.error("HyperClova X Q&A response validation failed:", errorDetails);
      throw new Error(`AI로부터 유효하지 않은 데이터 구조를 받았습니다. 오류: ${errorDetails}`);
    }

    return parsedResponse.data;

  } catch (error) {
    console.error("Error in financialQnA flow:", error);
    throw error;
  }
}
